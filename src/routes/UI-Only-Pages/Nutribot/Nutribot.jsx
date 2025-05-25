import React, { useState, useEffect, useRef } from 'react';
import './Nutribot.css';

export default function Nutribot() {
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chatHistory')) || []);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const chatRef = useRef(null);
  const mascotRef = useRef(null);

  const AI_API_URL = 'https://your-ai-api/chat';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const msg = new SpeechSynthesisUtterance("Hi! I'm Nutribot. Feel free to ask me anything about nutrition or health.");
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text, time: now }, { sender: 'bot', text: 'Typing...', time: now }]);
    setInput('');

    try {
      const res = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: text })
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, I didn’t understand.';
      setMessages(prev => [...prev.slice(0, -1), { sender: 'bot', text: reply, time: now }]);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { sender: 'bot', text: 'Error connecting to server.', time: now }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  const quickAsk = (text) => {
    setInput(text);
    sendMessage(text);
  };

  const toggleMascotMenu = () => {
    setShowTooltip(true);
    setShowMenu(true);
    setTimeout(() => {
      setShowTooltip(false);
      setShowMenu(false);
    }, 5000);
  };


  useEffect(() => {
    const mascot = mascotRef.current;
    let isDragging = false;
    let offsetX, offsetY;

    const handleMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - mascot.getBoundingClientRect().left;
      offsetY = e.clientY - mascot.getBoundingClientRect().top;
      mascot.style.transition = 'none';
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        mascot.style.left = `${e.clientX - offsetX}px`;
        mascot.style.top = `${e.clientY - offsetY}px`;
        mascot.style.right = 'auto';
        mascot.style.bottom = 'auto';
        mascot.style.position = 'fixed';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      mascot.style.transition = 'transform 0.2s';
    };

    mascot.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      mascot.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="nutribot-container">
      <div className="sidebar">
        <div className="sidebar-header">Nutribot</div>
        <button onClick={() => setMessages([])}>🗑️ Clear Chat</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="main-container">
        <div className="chat-box" ref={chatRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
              <div className="timestamp">{msg.time}</div>
            </div>
          ))}
        </div>

        <div className="nutribot-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
          />
          <button onClick={() => sendMessage(input)}>➤</button>
        </div>

        <div className="file-upload">
          <label>
            📂 Upload File
            <input
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  setMessages(prev => [...prev, { sender: 'bot', text: `📂 File "${file.name}" uploaded.`, time: now }]);
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="mascot-container" onClick={toggleMascotMenu} ref={mascotRef}>
        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712103.png" alt="Mascot" />
      </div>

      {showTooltip && (
        <div className="mascot-tooltip">
          💬 Try asking: What is BMI? Or upload a file!
        </div>
      )}

      {showMenu && (
        <div className="mascot-menu">
          <button onClick={() => quickAsk('What is my BMI?')}>📏 What is my BMI?</button>
          <button onClick={() => quickAsk('Give me healthy tips')}>🥗 Healthy Tips</button>
          <button onClick={() => quickAsk('Help me make a meal plan')}>📋 Meal Plan</button>
        </div>
      )}
    </div>
  );
}
