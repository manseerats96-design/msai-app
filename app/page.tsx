"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all chats from browser storage
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("msai_chats");

      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);

        if (Array.isArray(parsedChats)) {
          setChats(parsedChats);

          if (parsedChats.length > 0) {
            setActiveChatId(parsedChats[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Could not load MSAI history:", error);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  // Save chats whenever they change
  useEffect(() => {
    if (!historyLoaded) return;

    localStorage.setItem("msai_chats", JSON.stringify(chats));
  }, [chats, historyLoaded]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? null;

  const messages = activeChat?.messages ?? [];

  function createNewChat() {
    setActiveChatId(null);
    setInput("");

    // On mobile, close sidebar after selecting New Chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function openChat(id: string) {
    setActiveChatId(id);

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function deleteChat(id: string) {
    setChats((previousChats) =>
      previousChats.filter((chat) => chat.id !== id)
    );

    if (activeChatId === id) {
      setActiveChatId(null);
    }
  }

  function openImagePicker() {
    fileInputRef.current?.click();
  }

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected image:", file);

    // Image understanding will be connected later.
    event.target.value = "";
  }

  async function sendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || loading) return;

    const userMessage: Message = {
      role: "user",
      text: trimmedInput,
    };

    let chatId = activeChatId;

    // If this is a brand-new chat, create it.
    if (!chatId) {
      chatId = crypto.randomUUID();

      const title =
        trimmedInput.length > 32
          ? trimmedInput.slice(0, 32) + "..."
          : trimmedInput;

      const newChat: Chat = {
        id: chatId,
        title,
        messages: [userMessage],
        updatedAt: Date.now(),
      };

      setChats((previousChats) => [
        newChat,
        ...previousChats,
      ]);

      setActiveChatId(chatId);
    } else {
      const currentChatId = chatId;

      setChats((previousChats) =>
        previousChats
          .map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, userMessage],
                  updatedAt: Date.now(),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
    }

    const messagesForAI = [...messages, userMessage];

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAI,
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

      const currentChatId = chatId;

      setChats((previousChats) =>
        previousChats
          .map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, aiMessage],
                  updatedAt: Date.now(),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        role: "ai",
        text: "MSAI could not connect to the AI.",
      };

      const currentChatId = chatId;

      setChats((previousChats) =>
        previousChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                updatedAt: Date.now(),
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-screen bg-[#0d0d0d] text-white flex overflow-hidden">

      {/* Mobile background overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative z-40
          h-full w-[280px]
          bg-[#171717]
          border-r border-white/10
          transition-transform duration-200
          flex flex-col
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:hidden"
          }
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            MSAI
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 rounded-lg hover:bg-white/10"
            title="Close sidebar"
          >
            ←
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-left"
          >
            <span className="text-xl">＋</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 text-xs uppercase tracking-wider text-gray-500">
          Recent
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">

          {chats.length === 0 ? (
            <p className="text-sm text-gray-500 px-3 py-3">
              No conversations yet.
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center rounded-xl mb-1 ${
                  activeChatId === chat.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => openChat(chat.id)}
                  className="flex-1 text-left px-3 py-3 truncate"
                >
                  <span className="mr-2">◯</span>
                  {chat.title}
                </button>

                <button
                  onClick={() => deleteChat(chat.id)}
                  className="px-3 py-3 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            ))
          )}

        </div>

        <div className="border-t border-white/10 p-4 text-xs text-gray-500">
          MSAI Chat History
        </div>
      </aside>

      {/* MAIN CHAT */}
      <section className="flex-1 min-w-0 flex flex-col">

        <header className="h-16 border-b border-white/10 flex items-center px-4 gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-lg hover:bg-white/10 text-xl"
              title="Open sidebar"
            >
              ☰
            </button>
          )}

          <h1 className="font-semibold truncate">
            {activeChat?.title || "MSAI"}
          </h1>

          <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
            AI
          </span>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-8">

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">
                ✦
              </div>

              <h2 className="text-3xl font-semibold">
                How can I help you?
              </h2>

              <p className="text-gray-500 mt-3">
                Start a new conversation with MSAI.
              </p>
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
                        ? "bg-[#2f2f2f] px-5 py-3 rounded-3xl max-w-[85%] whitespace-pre-wrap"
                        : "px-2 py-3 max-w-[85%] whitespace-pre-wrap"
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

        </div>

        {/* INPUT */}
        <div className="px-4 pb-6">
          <div className="max-w-3xl mx-auto bg-[#202020] rounded-3xl p-4">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message MSAI..."
              className="w-full bg-transparent resize-none outline-none text-white placeholder:text-gray-400 min-h-[60px]"
            />

            <div className="flex items-center justify-between">

              <div className="flex gap-2">

                <button
                  onClick={openImagePicker}
                  className="w-10 h-10 rounded-full hover:bg-white/10"
                  title="Upload image"
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

                <button
                  className="w-10 h-10 rounded-full hover:bg-white/10"
                  title="Voice - coming later"
                >
                  🎙️
                </button>

              </div>

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-white text-black w-10 h-10 rounded-full font-bold disabled:opacity-40"
              >
                ↑
              </button>

            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            MSAI can make mistakes. Check important information.
          </p>
        </div>

      </section>
    </main>
  );
}