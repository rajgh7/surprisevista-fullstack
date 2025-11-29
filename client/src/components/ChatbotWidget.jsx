import React, { useState, useRef, useEffect } from "react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const boxRef = useRef();

  const API_BASE = "https://surprisevista-backend.onrender.com";

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to backend
  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

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

      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "No response." },
      ]);
    } catch (err) {
      console.error("Chatbot send error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "AI service is temporarily unavailable." },
      ]);
    }

    setInput("");
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-sv-orange text-white p-4 rounded-full shadow-xl hover:scale-110 transition z-50"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-xl border border-sv-purple z-50 flex flex-col">

          {/* Header */}
          <div className="bg-sv-purple text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <span className="font-semibold">SurpriseVista Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white text-lg">
              ✖
            </button>
          </div>

          {/* Messages */}
          <div
            ref={boxRef}
            className="p-3 h-96 overflow-y-auto space-y-2 bg-pink-50/40"
          >
            {messages.length === 0 && (
              <div className="text-xs text-gray-600">
                👋 Hi! Ask me about gifts, orders, or product suggestions!
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 max-w-[85%] rounded-lg text-sm ${
                  m.sender === "user"
                    ? "ml-auto bg-sv-orange text-white"
                    : "mr-auto bg-white border border-gray-200"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input box */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
