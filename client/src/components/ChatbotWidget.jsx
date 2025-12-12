// src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from "react";

/* ============================================
   🎤 VOICE INPUT BUTTON
============================================ */
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

  const toggle = () => {
    if (!recognitionRef.current) return alert("Voice not supported");
    !listening ? recognitionRef.current.start() : recognitionRef.current.stop();
    setListening(!listening);
  };

  return (
    <button
      onClick={toggle}
      className={`px-2 py-1 rounded ${listening ? "bg-red-500 text-white" : "bg-gray-100"}`}
      title="Voice input"
    >
      {listening ? "Listening..." : "🎤"}
    </button>
  );
}

/* ============================================
   🤖 MAIN CHATBOT WIDGET
============================================ */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(1);

  const boxRef = useRef();
  const draftKey = "chatbot_draft_v1";

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* Restore saved draft */
  useEffect(() => {
    const d = localStorage.getItem(draftKey);
    if (d) setInput(d);
  }, []);

  /* Auto-scroll when messages update */
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  /* Default suggestions */
  const [suggestions, setSuggestions] = useState([
    "Show gift ideas",
    "Gift under 500 for kids",
    "Track my order",
    "Show best sellers",
    "Suggest anniversary gift"
  ]);

  /* Fetch cart count when opened */
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/cart/get?sessionId=${sessionId || ""}`);
        const j = await r.json();
        setCartCount(j.count || 0);
      } catch {}
    })();
  }, [open, sessionId]);

  /* Text-to-speech */
  function speak(text) {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = voiceRate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  /* Send message to backend */
  async function sendMessage(raw) {
    const msg = raw || input || "";
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setInput("");
    localStorage.removeItem(draftKey);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });

      const data = await res.json();

      if (data.sessionId) setSessionId(data.sessionId);

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }

      const botMsg = {
        sender: "bot",
        text: data.reply,
        products: data.products || null
      };

      // slight delay for realism
      setTimeout(() => {
        setMessages((prev) => [...prev, botMsg]);
        speak(data.reply);
        if (typeof data.cartCount === "number") setCartCount(data.cartCount);
        setIsTyping(false);
      }, 500);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Service error. Try again." }]);
      setIsTyping(false);
    }
  }

  /* Add item to cart (server) */
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
          { sender: "bot", text: `🛒 Added ${j.added.title} (x${j.added.qty}) to cart.` }
        ]);

        setCartCount((c) => c + j.added.qty);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* Multi-selection handler */
  async function handleSelectIndices(indices = []) {
    const idxText = indices.map((i) => i + 1).join(", ");
    await sendMessage(`select ${idxText}`);
  }

  /* Product card inside chat */
  function ProductCard({ p }) {
    const img = p.image?.startsWith("http")
      ? p.image
      : "/assets/placeholders/product.png";

    return (
      <div className="w-56 p-2 border rounded-lg flex-shrink-0 mr-3 bg-white shadow-sm">
        <img
          src={img}
          alt={p.name || p.title}
          className="w-full h-32 object-cover rounded"
          onError={(e) => (e.target.src = "/assets/placeholders/product.png")}
        />

        <div className="mt-2">
          <div className="font-semibold line-clamp-2">
            {p.title || p.name}
          </div>

          <div className="text-sm text-gray-600">₹{p.price}</div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleAddToCart(p._id, 1)}
              className="text-xs bg-sv-purple text-white px-2 py-1 rounded"
            >
              Add
            </button>
            <button
              onClick={() => sendMessage(`compare ${p._id}`)}
              className="text-xs border px-2 py-1 rounded"
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Render message */
  function renderMessage(m, i) {
    const isUser = m.sender === "user";

    return (
      <div key={i} className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
        
        {!isUser && (
          <img
            src="/assets/chatbot/bot-icon.png"
            alt="bot"
            className="w-8 h-8 rounded-full bg-purple-200"
          />
        )}

        <div
          className={`p-2 max-w-[78%] rounded-xl shadow 
          ${isUser ? "bg-sv-orange text-white ml-auto" : "bg-white mr-auto"}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {m.text}

          {m.products && (
            <div className="mt-3">
              <div className="flex overflow-x-auto gap-3 py-2">
                {m.products.map((p) => (
                  <ProductCard key={p._id} p={p} />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Tip: say “select 1 and 3” or “add first two to cart”
              </div>
            </div>
          )}
        </div>

        {isUser && (
          <img
            src="/assets/chatbot/user-icon.png"
            alt="user"
            className="w-8 h-8 rounded-full bg-orange-200"
          />
        )}
      </div>
    );
  }

  /* Typing animation */
  function TypingDots() {
    return (
      <div className="flex items-center gap-1">
        <div className="typing-dot" />
        <div className="typing-dot delay-1" />
        <div className="typing-dot delay-2" />
      </div>
    );
  }

  /* Save draft & close */
  function handleClose() {
    if (input?.trim()) localStorage.setItem(draftKey, input);
    setOpen(false);
  }

  /* ============================================
     🧠 UI RENDER
  ============================================ */
  return (
    <>
      {/* Floating Bubble */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setOpen(true)}
            className="relative bg-sv-orange text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
          >
            💬
          </button>

          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
              {cartCount}
            </div>
          )}
        </div>
      )}

      {/* Full Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 bg-white shadow-2xl rounded-xl z-50 flex flex-col animate-fadeIn">

          {/* Header */}
          <div className="bg-sv-purple text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-3">
              <strong>SurpriseVista Assistant</strong>
              <span className="text-xs opacity-80">We help you pick gifts</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs">TTS</span>
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
              />
              <button onClick={handleClose} className="ml-2">✖</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={boxRef} className="p-3 h-96 overflow-y-auto space-y-3 bg-pink-50/50">
            {messages.map((m, i) => renderMessage(m, i))}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TypingDots />
                <span>Assistant is typing…</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="p-2 flex gap-2 overflow-x-auto bg-gray-100 border-t">
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

          {/* Input Bar */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <VoiceButton onResult={(t) => { setInput(t); sendMessage(t); }} />

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

            <button
              title="Close & save draft"
              onClick={handleClose}
              className="text-xs px-2 py-1 border rounded"
            >
              Save
            </button>
          </div>

          {/* Voice Speed */}
          <div className="p-2 border-t bg-gray-50 text-xs flex items-center gap-2">
            <span>Voice speed</span>
            <input
              type="range"
              min="0.5"
              max="1.6"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(Number(e.target.value))}
            />
            <span className="ml-auto">Cart: {cartCount}</span>
          </div>
        </div>
      )}
    </>
  );
}
