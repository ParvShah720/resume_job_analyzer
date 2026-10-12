import { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import * as api from '../services/api';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Send, Sparkles, User, Loader } from 'lucide-react';

export default function AIChat() {
  const { resumeData, rawText } = useContext(AppContext);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I am your Career Assistant. I can analyze your resume, recommend skills, or suggest career paths. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const suggestions = [
      "What skills am I missing for a Python backend developer?",
      "How can I improve my resume?",
      "What should I learn next?",
      "Make my projects section stronger."
  ];

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  useEffect(() => {
     scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    try {
       const res = await api.sendChatPrompt(text, resumeData, rawText);
       setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch(err) {
       console.error(err);
       setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I ran into an error generating that response. Please ensure Ollama is running and my API keys are correct." }]);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
       <div className="mb-4">
         <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="text-[#58a6ff]" size={28}/> AI Career Assistant
          </h1>
          <p className="text-[#8b949e]">Chat with context-aware AI running on your resume data.</p>
       </div>

       <div className="glass-panel flex-1 flex flex-col overflow-hidden p-0 border-[#30363d]">
          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {messages.map((msg, i) => (
                 <div key={i} className={`flex w-full mb-4 ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'ai' ? 'bg-[#58a6ff] bg-opacity-20 text-[#58a6ff]' : 'bg-[#2ea043] bg-opacity-20 text-[#2ea043]'}`}>
                          {msg.role === 'ai' ? <Sparkles size={16}/> : <User size={16}/>}
                       </div>
                       <div className={`flex flex-col rounded-2xl p-4 text-[15px] shadow-sm ${msg.role === 'ai' ? 'bg-[#161b22] border border-[#30363d] text-[#e3e3e3] rounded-tl-sm' : 'bg-[#005c4b] text-[#e9edef] rounded-tr-sm'}`}>
                          <div className="react-markdown-content leading-relaxed break-words markdown-content">
                             <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                          </div>
                       </div>
                    </div>
                 </div>
             ))}
             {loading && (
                 <div className="flex w-full mb-4 justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#58a6ff] bg-opacity-20 text-[#58a6ff]">
                          <Loader size={16} className="animate-spin"/>
                       </div>
                       <div className="rounded-2xl p-4 bg-[#161b22] border border-[#30363d] rounded-tl-sm">
                          <div className="flex gap-1.5 items-center h-5">
                             <span className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                             <span className="w-2 h-2 bg-[#8b949e] rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                          </div>                       
                       </div>
                    </div>
                 </div>
             )}
             <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex flex-col gap-3">
             <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)} className="text-xs bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] text-[#8b949e] py-1 px-3 rounded-full transition-colors truncate max-w-full">
                       {s}
                    </button>
                ))}
             </div>
             
             <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input-field rounded-full px-6" 
                  placeholder="Ask any career or resume-related question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                />
                <button 
                  className="btn-primary rounded-full w-12 h-12 p-0 flex justify-center items-center shrink-0" 
                  onClick={() => sendMessage(input)}
                  disabled={loading}
                >
                  <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                </button>
             </div>
          </div>
       </div>
    </div>
  )
}
