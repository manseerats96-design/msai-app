import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    const conversation = messages
      .map(
        (message: { role: string; text: string }) =>
          `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`
      )
      .join("\n");

    const response = await openai.responses.create({
      model: "gpt-6-luna",

      instructions: `
You are MSAI, an AI assistant.

Your name is MSAI.

Follow these rules:
- Answer clearly and accurately.
- Remember the conversation supplied to you.
- Respond in the same primary language as the user.
- Understand English, Hindi and Hinglish.
- Explain difficult concepts simply when needed.
- Help with programming, electronics, mathematics,
  science and general questions.
- Do not claim to have live information unless
  a live-data tool provides it.
- Never claim that you are the ChatGPT application.
`,

      input: conversation,
    });

    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("MSAI Error:", error);

    return NextResponse.json(
      { error: "MSAI could not generate a response." },
      { status: 500 }
    );
  }
}