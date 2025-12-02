// src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from "react";

useEffect(() => {
  const saved = localStorage.getItem("chat_history");
  if (saved) setMessages(JSON.parse(saved));
}, []);


useEffect(() => {
  localStorage.setItem("chat_history", JSON.stringify(messages));
}, [messages]);


function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      onResult(t);
      setListening(false);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
  }, [onResult]);

  function toggle() {
    if (!recognitionRef.current) return alert("Voice not supported");
    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`px-2 py-1 rounded ${
        listening ? "bg-red-500 text-white" : "bg-gray-100"
      }`}
    >
      {listening ? "Listening..." : "🎤"}
    </button>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const boxRef = useRef();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  // Smart suggestion chips
  const suggestions = [
    "Show gift ideas",
    "Gift under 500 for kids",
    "Track my order",
    "Show best sellers",
    "Suggest anniversary gift",
  ];

  async function sendMessage(raw) {
    const msg = raw || input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });

      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      setTimeout(() => {
  const botMsg = {
    sender: "bot",
    text: data.reply,
    products: data.products || null,
  };

  setMessages((prev) => [...prev, botMsg]);
  speak(data.reply);     // <-- ADD THIS FOR VOICE
  setIsTyping(false);
}, 600);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Service error. Try again." },
      ]);
      setIsTyping(false);
    }
  }

  async function handleAddToCart(productId, qty = 1) {
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty, sessionId }),
      });
      const j = await res.json();
      if (j.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `🛒 Added ${j.added.title} (x${j.added.qty}) to cart.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Failed to add to cart." },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // RENDER MESSAGE BUBBLES
  function renderMessage(m, i) {
    const isUser = m.sender === "user";

    return (
      <div
        key={i}
        className={`flex items-start gap-2 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isUser && (
          <img
            src="/bot-icon.png"
            alt="bot"
            className="w-8 h-8 rounded-full bg-purple-200"
          />
        )}

        <div
  className={`chat-bubble p-2 max-w-[80%] rounded-xl shadow ${
    isUser ? "bg-sv-orange text-white ml-auto" : "bg-white mr-auto"
  }`}

          style={{ whiteSpace: "pre-wrap" }}
        >
          {m.text}

          {/* Product list inside message */}
          {m.products && (
            <div className="mt-3 space-y-2">
              {m.products.map((p) => (
                <div
                  key={p._id}
                  className="p-2 border rounded flex justify-between items-center bg-sv-light"
                >
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm">₹{p.price}</div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p._id, 1)}
                    className="bg-sv-purple text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isUser && (
          <img
            src="/user-icon.png"
            alt="user"
            className="w-8 h-8 rounded-full bg-orange-200"
          />
        )}
      </div>
    );
  }

// TTS: Speak text aloud
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}


  return (
    <>
      {/* CHAT OPEN BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-sv-orange text-white p-4 rounded-full shadow-xl z-50 hover:scale-110 transition"
        >
          💬
        </button>
      )}

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-xl z-50 flex flex-col animate-fadeIn">
          <div className="bg-sv-purple text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <strong>SurpriseVista Assistant</strong>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* CHAT BODY */}
          <div
            ref={boxRef}
            className="p-3 h-96 overflow-y-auto space-y-3 bg-pink-50/50"
          >
            {messages.map((m, i) => renderMessage(m, i))}

            {/* Typing Animation */}
            {isTyping && (
              <div className="text-sm text-gray-500 animate-pulse">
                Assistant is typing…
              </div>
            )}
          </div>

          {/* SMART SUGGESTIONS */}
          <div className="p-2 flex gap-2 overflow-x-auto whitespace-nowrap bg-gray-100 border-t">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1 bg-white rounded-full text-xs shadow hover:bg-gray-200"
              >
                {s}
              </button>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <VoiceButton
              onResult={(t) => {
                setInput(t);
                sendMessage(t);
              }}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Type your message..."
            />
            <button
              onClick={() => sendMessage()}
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
