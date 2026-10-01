"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am ENECO Assistant. How can I help you analyze your solar data today?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'system', 
        text: 'This is a demo environment. Real AI integrations for energy recommendations will appear here!' 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-accent-dark text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 h-96 bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-accent-dark text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <Bot size={20} />
            ENECO Assistant
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-br-sm' 
                  : 'bg-white border border-border text-primary-text rounded-bl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border bg-surface">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask about performance..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <button 
              type="submit" 
              className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors shrink-0"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
