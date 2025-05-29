import React, { useState } from "react";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Financial Consultant. How can I help you with budgeting, saving, or expense analysis today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);

  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: data.reply || "No response from GPT" },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: "Erreur de connexion avec le serveur." },
    ]);
  }

  setInput("");
};


  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <span>Chatbot</span>
        <div className="chat-info">ℹ️</div>
      </div>

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-bubble ${msg.sender === "user" ? "chat-user" : "chat-ai"}`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
