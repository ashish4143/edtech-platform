const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { z } = require('zod');
require('dotenv').config();

async function test() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 8192,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const questionSchema = z.object({
    questions: z.array(z.object({
      content: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
      explanation: z.string()
    }))
  });

  try {
    const structuredLlm = llm.withStructuredOutput(questionSchema);
    console.log("Calling LLM...");
    const result = await structuredLlm.invoke("Generate 1 easy math question about algebra factorisation.");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
