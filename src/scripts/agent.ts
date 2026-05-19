import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { StateGraph, START, END } from '@langchain/langgraph';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 8192,
  apiKey: process.env.GEMINI_API_KEY,
});

// Defining the State for the LangGraph
interface AgentState {
  targetInput: string;
  curriculum: { grade: string, board: string, subject: string, chapter: string, topics: string[] } | null;
  gaps: { topic: string, required: { Easy: number, Medium: number, Hard: number, Olympiad: number } }[];
  generatedQuestions: any[];
  status: string;
}

// Node 1: Planner
async function curriculumPlanner(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`\n[Planner] Mapping curriculum for: ${state.targetInput}`);
  const schema = z.object({
    grade: z.string(),
    board: z.string(),
    subject: z.string(),
    chapter: z.string(),
    topics: z.array(z.string()).describe("List of sub-topics within this chapter"),
  });
  
  const structuredLlm = llm.withStructuredOutput(schema);
  const prompt = `You are a curriculum architect. Break down the following request into specific details. Request: "${state.targetInput}". Return grade, board, subject, chapter, and an array of exhaustive topics.`;
  
  const result = await structuredLlm.invoke(prompt);
  console.log(`[Planner] Found ${result.topics.length} topics for Chapter: ${result.chapter}`);
  return { curriculum: result };
}

// Node 2: Assessor
async function databaseAssessor(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.curriculum) return {};
  console.log(`\n[Assessor] Checking database for existing questions...`);
  const { grade, subject, chapter, topics } = state.curriculum;
  
  const gaps: any[] = [];
  const targetCounts = { Easy: 3, Medium: 3, Hard: 2, Olympiad: 2 };
  
  for (const topic of topics) {
    const existing = await prisma.question.groupBy({
      by: ['difficulty'],
      where: { grade, subject, chapter, topic },
      _count: { id: true }
    });
    
    const existingCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0, Olympiad: 0 };
    existing.forEach(e => existingCounts[e.difficulty] = e._count.id);
    
    const required: any = {};
    let needsGen = false;
    for (const [diff, target] of Object.entries(targetCounts)) {
      const needed = Math.max(0, target - existingCounts[diff]);
      required[diff] = needed;
      if (needed > 0) needsGen = true;
    }
    
    if (needsGen) {
      gaps.push({ topic, required });
    }
  }
  
  console.log(`[Assessor] Found ${gaps.length} topics requiring new questions.`);
  return { gaps };
}

// Node 3: Generator
async function questionGenerator(state: AgentState): Promise<Partial<AgentState>> {
  if (state.gaps.length === 0 || !state.curriculum) {
    return { status: 'complete' };
  }
  
  // We pop one gap off the list to process
  const gap = state.gaps[0];
  console.log(`\n[Generator] Writing questions for topic: ${gap.topic}...`);
  
  const qSchema = z.object({
    questions: z.array(z.object({
      difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Olympiad']),
      content: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
      explanation: z.string()
    }))
  });
  
  const structuredLlm = llm.withStructuredOutput(qSchema);
  
  let instructions = `Generate MCQs for Grade ${state.curriculum.grade} ${state.curriculum.board} ${state.curriculum.subject}, Chapter: ${state.curriculum.chapter}, Topic: ${gap.topic}.\n`;
  instructions += `Requirements:\n`;
  instructions += `IMPORTANT: DO NOT use LaTeX formatting or dollar signs ($) for math. Write equations as plain text (e.g. x^2 + 2x = 0).\n`;
  let totalRequested = 0;
  for (const [diff, count] of Object.entries(gap.required)) {
    if (count > 0) {
      instructions += `- ${count} questions of ${diff} difficulty.\n`;
      totalRequested += count;
    }
  }
  
  const result = await structuredLlm.invoke(instructions);
  console.log(`[Generator] AI wrote ${result.questions.length} questions (requested ${totalRequested}).`);
  
  const formattedQuestions = result.questions.map(q => ({
    ...q,
    board: state.curriculum!.board,
    grade: state.curriculum!.grade,
    subject: state.curriculum!.subject,
    chapter: state.curriculum!.chapter,
    topic: gap.topic,
    type: 'MCQ'
  }));
  
  return { generatedQuestions: formattedQuestions };
}

// Node 4: Seeder
async function databaseSeeder(state: AgentState): Promise<Partial<AgentState>> {
  if (state.generatedQuestions.length === 0) return {};
  console.log(`\n[Seeder] Inserting ${state.generatedQuestions.length} questions into DB...`);
  
  await prisma.question.createMany({
    data: state.generatedQuestions,
    skipDuplicates: true
  });
  
  console.log(`[Seeder] Insertion successful.`);
  
  // Remove the processed gap
  const remainingGaps = state.gaps.slice(1);
  return { gaps: remainingGaps, generatedQuestions: [] };
}

// Conditional Edges
function shouldContinue(state: AgentState) {
  if (state.gaps.length > 0) {
    return 'Generator';
  }
  return END;
}

// Build Graph
const workflow = new StateGraph<AgentState>({
  channels: {
    targetInput: { value: (x, y) => y ?? x, default: () => '' },
    curriculum: { value: (x, y) => y ?? x, default: () => null },
    gaps: { value: (x, y) => y ?? x, default: () => [] },
    generatedQuestions: { value: (x, y) => y ?? x, default: () => [] },
    status: { value: (x, y) => y ?? x, default: () => '' },
  }
})
  .addNode("Planner", curriculumPlanner)
  .addNode("Assessor", databaseAssessor)
  .addNode("Generator", questionGenerator)
  .addNode("Seeder", databaseSeeder)
  .addEdge(START, "Planner")
  .addEdge("Planner", "Assessor")
  .addEdge("Assessor", "Generator")
  .addEdge("Generator", "Seeder")
  .addConditionalEdges("Seeder", shouldContinue, {
    "Generator": "Generator",
    [END]: END
  });

const app = workflow.compile();

async function run() {
  const input = process.argv.slice(2).join(" ");
  if (!input) {
    console.error("Please provide a target. Example: npm run agent:seed 'Grade 9 ICSE Maths Algebra'");
    process.exit(1);
  }
  
  console.log(`\n🚀 Starting Autonomous Background Agent...`);
  await app.invoke({ targetInput: input, curriculum: null, gaps: [], generatedQuestions: [], status: '' });
  console.log(`\n✅ Autonomous seeding complete!\n`);
  process.exit(0);
}

run();
