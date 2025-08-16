import React, { useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import "./ChatPage.css";

const ChatPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setConversation((prev) => [...prev, { type: "user", content: inputValue }]);
    const question = inputValue;
    setInputValue("");

    try {
      const response = await axios.post(
        "https://api.gpt.ge/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: question }],
          max_tokens: 1688,
          temperature: 0.5,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer sk-2gS0X2Fc4As4rm7P5eD459B7Db3049638f9a6cE49b18C62e`,
          },
        }
      );

      const botReply =
        response?.data?.choices[0]?.message?.content || "No response";
      setConversation((prev) => [...prev, { type: "bot", content: botReply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setConversation((prev) => [
        ...prev,
        { type: "bot", content: "Error fetching response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>ChatBox</h2>
      </div>
      <div className="conversation-container">
        {conversation.map((item, index) => (
          <div key={index} className={`message ${item.type}`}>
            <strong>{item.type === "user" ? "You: " : "GPT: "}</strong>
            {item.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
        />
        <Button type="primary" onClick={handleSend} loading={loading}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
