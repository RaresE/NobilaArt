import { useState } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Salut! Spune-mi ce spațiu ai disponibil (ex: 200x80x40 cm) și îți recomand un produs potrivit din stoc.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot/suggest-product', { message: input });
      setMessages(msgs => [...msgs, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'A apărut o eroare. Încearcă din nou.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, width: 320, background: 'white', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000 }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#f5f7fa' }}>Chatbot Mobilux</div>
      <div style={{ maxHeight: 260, overflowY: 'auto', padding: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{ display: 'inline-block', background: m.from === 'user' ? '#e0e7ff' : '#f1f5f9', color: '#222', borderRadius: 12, padding: '6px 12px', maxWidth: 220 }}>{m.text}</span>
          </div>
        ))}
        {loading && <div style={{ color: '#888', fontSize: 12 }}>Se caută sugestii...</div>}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fafbfc' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ex: 200x80x40 cm"
          style={{ flex: 1, border: '1px solid #ddd', borderRadius: 8, padding: 6, marginRight: 8 }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 'bold' }}>
          Trimite
        </button>
      </div>
    </div>
  );
} 