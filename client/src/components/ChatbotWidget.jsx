// src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios"; // ensure exists as earlier or use absolute URL

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

  return <button onClick={toggle} className={`px-2 py-1 rounded ${listening ? "bg-red-500 text-white" : "bg-gray-100"}`}>{listening ? "Listening..." : "🎤"}</button>;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const boxRef = useRef();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages]);

  async function sendMessage(raw) {
    const msg = raw || input;
    if (!msg || !msg.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: msg }]);
    setInput("");
    try {
      const res = await fetch(`${API_BASE}/api/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId })
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
      // if result includes products, attach them for add-to-cart actions
      setMessages(prev => [...prev, { sender: "bot", text: data.reply, products: data.products || null }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "bot", text: "Service error. Try again." }]);
    }
  }

  async function handleAddToCart(productId, qty=1) {
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty, sessionId })
      });
      const j = await res.json();
      if (j.ok) {
        setMessages(prev => [...prev, { sender: "bot", text: `Added ${j.added.title} x${j.added.qty} to cart.` }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Failed to add to cart." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: "bot", text: "Add to cart failed." }]);
    }
  }

  // quick UI to render product lists inside messages
  function renderMessage(m, i) {
    return (
      <div key={i} className={`p-2 max-w-[85%] rounded ${m.sender==="user"?"ml-auto bg-sv-orange text-white":"mr-auto bg-white border"}`}>
        <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
        {m.products && m.products.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {m.products.map(p => (
              <div key={p._id} className="p-2 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm">₹{p.price}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAddToCart(p._id,1)} className="btn btn-primary">Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  async function openGreeting() {
    setShowGreetingModal(true);
  }

  return (
    <>
      {!open && <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 bg-sv-orange text-white p-4 rounded-full shadow-xl z-50">💬</button>}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-xl z-50 flex flex-col">
          <div className="bg-sv-purple text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
            <strong>SurpriseVista Assistant</strong>
            <div className="flex gap-2">
              <button onClick={openGreeting} className="text-sm">Greeting</button>
              <button onClick={() => setOpen(false)}>✖</button>
            </div>
          </div>

          <div ref={boxRef} className="p-3 h-96 overflow-y-auto space-y-2 bg-pink-50/40">
            {messages.length===0 && <div className="text-xs text-gray-600">Hi! Ask me about gifts, orders, or say “recommend a gift for 10 year old under 600”.</div>}
            {messages.map((m,i)=> renderMessage(m,i))}
          </div>

          <div className="p-3 border-t flex gap-2 bg-white">
            <VoiceButton onResult={(t)=>{ setInput(t); sendMessage(t); }} />
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={(e)=> e.key==="Enter" && sendMessage()} className="flex-1 border rounded-lg px-3 py-2" placeholder="Type your question..." />
            <button onClick={()=>sendMessage()} className="bg-sv-purple text-white px-4 py-2 rounded-lg">➤</button>
          </div>
        </div>
      )}

      {/* Greeting modal */}
      {showGreetingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded shadow w-11/12 max-w-md">
            <h3 className="text-lg font-semibold">Generate Greeting Card Message</h3>
            <p className="text-sm text-gray-600">Enter a short prompt (tone + occasion + recipient)</p>
            <textarea id="gmsg" className="w-full border rounded p-2 mt-2" placeholder="e.g. Short romantic birthday message for my wife, cute tone"></textarea>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={()=>setShowGreetingModal(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={async ()=>{
                const t = document.getElementById("gmsg").value;
                setAiGenerating(true);
                try {
                  const r = await fetch(`${API_BASE}/api/chatbot/ask`, {
                    method: "POST", headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ message: `Write 3 short greeting messages: ${t}` , sessionId })
                  });
                  const j = await r.json();
                  setMessages(prev=> [...prev, { sender:"bot", text: j.reply } ]);
                  setShowGreetingModal(false);
                } catch(e) { console.error(e); }
                setAiGenerating(false);
              }} className="px-3 py-1 bg-sv-purple text-white rounded">{aiGenerating ? "..." : "Generate"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
