import React, { useState, useRef, useEffect } from "react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const boxRef = useRef();

  const API_BASE = "https://surprisevista-backend.onrender.com";

  function scrollBottom() {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }

  useEffect(scrollBottom, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((p) => [...p, userMsg]);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId || undefined,
          userId: "guest",
        }),
      });

      const data = await res.json();
      setSessionId(data.sessionId || sessionId);

      setMessages((p) => [...p, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((p) => [
        ...p,
        { sender: "bot", text: "Oops! Something went wrong." },
      ]);
    }

    setInput("");
  }

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-sv-orange text-white p-4 rounded-full shadow-xl hover:scale-110 transition z-50"
      >
        💬
      </button>

      {/* WIDGET */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-xl border border-sv-purple z-50 flex flex-col">
          {/* HEADER */}
          <div className="bg-sv-purple text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <span className="font-semibold">SurpriseVista Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white">✖</button>
          </div>

          {/* MESSAGES */}
          <div
            ref={boxRef}
            className="p-3 h-96 overflow-y-auto space-y-2 bg-pink-50/40"
          >
            {messages.length === 0 && (
              <div className="text-xs text-gray-600">
                👋 Hi! Ask me about gifts, orders, tracking or suggestions.
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 max-w-[85%] rounded-lg ${
                  m.sender === "user"
                    ? "ml-auto bg-sv-orange text-white"
                    : "mr-auto bg-white border"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Ask something..."
            />
            <button
              onClick={sendMessage}
              className="bg-sv-purple text-white px-4 py-2 rounded-lg"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
