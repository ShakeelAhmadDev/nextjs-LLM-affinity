import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { provider, message } = await req.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    let reply = "";

    if (provider === "openai") {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: message }],
      });
      reply = response.choices[0].message.content;
    } 
    else if (provider === "anthropic") {
      const response = await anthropic.messages.create({
        model: "claude-3",
        max_tokens: 1024,
        messages: [{ role: "user", content: message }],
      });
      reply = response.content[0].text;
    }
     else {
      return Response.json({ error: "Invalid provider" }, { status: 400 });
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
