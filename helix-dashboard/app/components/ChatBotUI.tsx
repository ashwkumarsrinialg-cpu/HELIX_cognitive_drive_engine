'use client';

import React, { useState } from 'react';

export const ChatBotUI: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Initializing Cognitive Engine...' },
    { role: 'ai', text: 'Helix AI active. Ready to inspect strategic drift anomalies.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Processing strategic impact. Correlating telemetry streams...' }]);
    }, 600);
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(5, 5, 5, 0.5)',
      borderRadius: '0px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(37, 99, 235, 0.2)',
        background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.1) 0%, transparent 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          boxShadow: '0 0 10px #3B82F6',
          animation: 'pulse 2s infinite'
        }} />
        <h4 className="glow-text" style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Helix AI Assistant
        </h4>
      </div>

      {/* Chat History */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: msg.role === 'ai' ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: msg.role === 'ai' ? 'rgba(10, 11, 15, 0.8)' : 'rgba(37, 99, 235, 0.2)',
              color: '#E5E7EB',
              fontSize: '13px',
              lineHeight: '1.5',
              fontWeight: 500,
              boxShadow: msg.role === 'ai' ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'
            }}>
              {msg.role === 'ai' && <strong style={{ color: '#60A5FA', display: 'block', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}>Helix AI</strong>}
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(2, 5, 18, 0.8)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(10, 11, 15, 0.8)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px 12px',
          transition: 'all 0.2s',
        }}>
          <input 
            type="text" 
            placeholder="Query telemetry or trigger strategic nudge..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              padding: '10px 0',
            }}
          />
          <button 
            onClick={handleSend}
            style={{
              background: 'linear-gradient(45deg, #2563EB, #4338CA)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#FFF',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '12px',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
