"use client";

import { useRef, useState } from "react";
type Message = {
  role: "user" | "ai";
  text: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

function openImagePicker() {
  fileInputRef.current?.click();
}

function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;

  console.log("Selected image:", file);
}
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const currentMessage = input;

    const userMessage: Message = {
      role: "user",
      text: currentMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: "ai",
        text:
          data.reply ||
          data.error ||
          "MSAI could not generate a response.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "MSAI could not connect to the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">

      <header className="h-16 border-b border-white/10 flex items-center px-6">
        <h1 className="text-xl font-semibold">MSAI</h1>
        <span className="ml-2 text-xs bg-white/10 px-2 py-1 rounded-full">
          AI
        </span>
      </header>

      <section className="flex-1 overflow-y-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-5xl mb-4">✦</div>
            <h2 className="text-3xl font-semibold">
              How can I help you?
            </h2>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "bg-[#2f2f2f] px-5 py-3 rounded-3xl max-w-[80%]"
                      : "px-2 py-3 max-w-[80%]"
                  }
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400">
                MSAI is thinking...
              </div>
            )}
          </div>
        )}
      </section>

      <div className="px-4 pb-6">
        <div className="max-w-3xl mx-auto bg-[#202020] rounded-3xl p-4">

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message MSAI..."
            className="w-full bg-transparent resize-none outline-none text-white placeholder:text-gray-400 min-h-[60px]"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full hover:bg-white/10">
                ＋
              </button>

              <button className="w-10 h-10 rounded-full hover:bg-white/10">
                📷
              </button>
<button
  onClick={openImagePicker}
  className="w-10 h-10 rounded-full hover:bg-white/10"
>
  📷
</button>

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleImage}
  className="hidden"
/>
              <button className="w-10 h-10 rounded-full hover:bg-white/10">
                🎙️
              </button>
            </div>

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-white text-black w-10 h-10 rounded-full font-bold disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          MSAI can make mistakes. Check important information.
        </p>
      </div>
    </main>
  );
}