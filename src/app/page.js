"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isChatting, setIsChatting] = useState(false);

  const startConversation = async () => {
    if (!prompt) return;
    setIsChatting(true);
    setConversation([{ sender: "User", text: prompt }]);

    let botMessage = prompt;
    let messages = [{ sender: "User", text: prompt }];

    for (let i = 0; i < 5; i++) { // 5 exchanges
      try {
        const [resOpenAI, resAnthropic] = await Promise.all([
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "openai", message: botMessage }),
          }),
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "anthropic", message: botMessage }),
          })
        ]);

        const dataOpenAI = await resOpenAI.json();
        const dataAnthropic = await resAnthropic.json();

        messages.push({ sender: "OpenAI Bot", text: dataOpenAI.reply });
        messages.push({ sender: "Anthropic Bot", text: dataAnthropic.reply });

        botMessage = dataAnthropic.reply; // Use last reply for the next input
      } catch (error) {
        console.error("Error in conversation:", error);
        break;
      }
    }

    setConversation(messages);
    setIsChatting(false);
    setPrompt("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="border p-2 w-full max-w-md rounded"
        placeholder="Enter initial prompt..."
        disabled={isChatting}
      />
      <button
        onClick={startConversation}
        disabled={!prompt || isChatting}
        className="mt-4 p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isChatting ? "Chatting..." : "START"}
      </button>
      <div className="mt-6 w-full max-w-md">
        {conversation.map((msg, index) => (
          <p key={index} className={msg.sender.includes("OpenAI") ? "text-blue-500" : msg.sender.includes("Anthropic") ? "text-green-500" : "text-black"}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
    </div>
  );
}
