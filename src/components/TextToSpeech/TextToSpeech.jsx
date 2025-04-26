import React, { useState, useRef, useEffect } from 'react';
import {
  FaVolumeUp,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
 
const TextToSpeechDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const ttsRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const location = useLocation();
 
 
  useEffect(() => {
    const loadVoices = () => {
      const all = speechSynthesis.getVoices();
      if (all.length > 0) setVoices(all);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
 
    return () => {
      speechSynthesis.cancel();
    };
  }, []);
 
 
  useEffect(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setHasFinished(false);
    hasSpokenRef.current = false;
  }, [location]);
 
 
  const isVisible = (el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  };
 
  const collectVisibleText = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    const excludedTags = ['nav', 'footer', 'script', 'style'];
    let textContent = '';
 
    const ignored = Array.from(document.querySelectorAll('.tts-ignore'));
    const originalDisplay = ignored.map(el => el.style.display);
    ignored.forEach(el => (el.style.display = 'none'));
 
    const ttsDisplay = ttsRef.current?.style.display;
    if (ttsRef.current) ttsRef.current.style.display = 'none';
 
    while (walker.nextNode()) {
      const el = walker.currentNode;
      const tag = el.tagName?.toLowerCase();
      if (
        excludedTags.includes(tag) ||
        el.closest('nav') ||
        el.closest('footer') ||
        el.closest('.navbar')
      ) continue;
      if (!isVisible(el)) continue;
 
      const txt = el.innerText?.trim();
      if (txt) textContent += txt + ' ';
    }
 
    ignored.forEach((el, i) => (el.style.display = originalDisplay[i]));
    if (ttsRef.current) ttsRef.current.style.display = ttsDisplay ?? '';
 
    return textContent.trim();
  };
 
  const speak = () => {
    if (hasSpokenRef.current || speechSynthesis.speaking) return;
 
    const text = collectVisibleText();
    if (!text) return;
 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find(v => v.lang.startsWith('en')) || null;
    utterance.rate = 1;
 
    utterance.onstart = () => {
      setIsPlaying(true);
    };
 
    utterance.onend = () => {
      setIsPlaying(false);
      setHasFinished(true);
      hasSpokenRef.current = true;
    };
 
    utterance.onerror = () => {
      setIsPlaying(false);
      setHasFinished(true);
      hasSpokenRef.current = true;
    };
 
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setHasFinished(false);
  };
 
  const handlePlayPause = () => {
    if (!speechSynthesis.speaking && !speechSynthesis.paused) {
      hasSpokenRef.current = false;
      setHasFinished(false);
      speak();
    }
  };
 
  const handlePause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPlaying(false);
    }
  };
 
  const handleResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPlaying(true);
    }
  };
 
  const handleReplay = () => {
    speechSynthesis.cancel();
    hasSpokenRef.current = false;
    setHasFinished(false);
    speak();
  };
 
  const buttonBaseStyle =
    'w-10 h-10 flex items-center justify-center rounded-md text-white bg-purple-500 hover:bg-purple-600';
 
  return (
    <div className="relative z-50" ref={ttsRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-600"
      >
        <FaVolumeUp size={20} />
      </button>
 
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-100 border border-gray-300 shadow-xl rounded-md p-3 flex gap-3 z-50">
          <button onClick={handlePlayPause} title="Play" className={buttonBaseStyle}>
            <FaPlay size={16} />
          </button>
          <button onClick={handlePause} title="Pause" className={buttonBaseStyle}>
            <FaPause size={16} />
          </button>
          <button onClick={handleResume} title="Resume" className={buttonBaseStyle}>
            <FaForward size={16} />
          </button>
          <button onClick={handleReplay} title="Replay" className={buttonBaseStyle}>
            🔁
          </button>
        </div>
      )}
    </div>
  );
};
 
export default TextToSpeechDropdown;
 
 
 