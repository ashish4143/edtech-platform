import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

const questionSchema = z.object({
  questions: z.array(z.object({
    content: z.string().describe("The actual question text. Can include math or markdown."),
    options: z.array(z.string()).length(4).describe("Exactly 4 realistic options/distractors for a multiple choice question."),
    correctAnswer: z.string().describe("The exact string matching one of the options that is the correct answer."),
    explanation: z.string().describe("A step-by-step mathematical explanation of how to solve the problem and arrive at the correct answer.")
  }))
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grade, board, subject, chapter, topic, concept, difficulty, count } = body;

    if (!grade || !subject || !difficulty || !count) {
      return NextResponse.json({ error: 'Missing required parameters (grade, subject, difficulty, count)' }, { status: 400 });
    }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      maxOutputTokens: 8192,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const structuredLlm = llm.withStructuredOutput(questionSchema);

    const prompt = `You are an expert curriculum designer for ${board || 'ICSE/CBSE'} board, specializing in Grade ${grade} ${subject}.
I need you to generate exactly ${count} multiple-choice questions (MCQs) for the following:
- Chapter: ${chapter || 'N/A'}
- Topic: ${topic || 'N/A'}
- Specific Concept (if any): ${concept || 'General understanding'}
- Difficulty Level: ${difficulty} (Ensure the complexity perfectly matches this tier).

Rules for generation:
1. Generate mathematically sound and unambiguous questions.
2. Provide exactly 4 distinct options. Do not make the correct answer obviously stand out by length or format.
3. Include common misconceptions as distractors in the wrong options.
4. Provide a detailed, step-by-step explanation.
5. IMPORTANT: DO NOT use LaTeX formatting or dollar signs ($) for math. Write equations as plain text (e.g. x^2 + 2x = 0).

Return the result matching the requested JSON schema perfectly.`;

    const result = await structuredLlm.invoke(prompt);

    return NextResponse.json({ questions: result.questions });
  } catch (error: any) {
    console.error('Failed to generate AI questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions using AI' }, { status: 500 });
  }
}
