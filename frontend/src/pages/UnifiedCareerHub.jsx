import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import * as api from '../services/api';
import { Sparkles, Briefcase, ExternalLink, Send, User, Loader, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function UnifiedCareerHub() {
  const { resumeData, rawText } = useContext(AppContext);
  const navigate = useNavigate();

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobs, setJobs] = useState([]);
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'ai', content: "I've analyzed your resume and found some excellent job matches below! feel free to ask me to analyze your skill gaps for any specific role." }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!resumeData) {
      navigate('/');
      return;
    }
    
    try {
        const cachedJobs = localStorage.getItem('careerAI_jobs');
        const cachedChat = localStorage.getItem('careerAI_chat');
        
        if (cachedJobs) {
            const parsedJobs = JSON.parse(cachedJobs);
            if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
               setJobs(parsedJobs);
               setLoadingJobs(false);
               if (cachedChat) {
                   const parsedChat = JSON.parse(cachedChat);
                   if (Array.isArray(parsedChat)) setMessages(parsedChat);
               }
               return; // Prevent re-fetching from API if cached session exists
            }
        }
    } catch(e) {
        console.warn("Corrupted cache found, resetting...");
        localStorage.removeItem('careerAI_jobs');
        localStorage.removeItem('careerAI_chat');
    }
    
    // 1. Fetch recommended jobs automatically
    const resumeSkills = [...(resumeData.technicalSkills || []), ...(resumeData.softSkills || [])];
    const topRole = resumeData.suggestedRoles && resumeData.suggestedRoles.length > 0 ? resumeData.suggestedRoles[0] : 'Software Developer';
    
    api.recommendJobs(resumeSkills, topRole, 'India')
      .then(res => setJobs(res.data.recommended || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingJobs(false));
      
  }, [resumeData, navigate]);

  useEffect(() => {
     if (jobs.length > 0) {
        localStorage.setItem('careerAI_jobs', JSON.stringify(jobs));
     }
  }, [jobs]);

  useEffect(() => {
     if (messages.length > 1) {
        localStorage.setItem('careerAI_chat', JSON.stringify(messages));
     }
     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const sendHoverMessage = (job) => {
      const msg = `Based on my resume, what skills am I missing for the ${job.title} role at ${job.company}?`;
      sendMessage(msg);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    
    try {
       // Serialize jobs heavily truncating descriptions to save context token limits
       const jobContext = jobs.map(j => ({title: j.title, company: j.company, missingSkills: j.missingSkills}));
       const res = await api.sendChatPrompt(text, resumeData, rawText, jobContext);
       setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch(err) {
       console.error(err);
       setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I ran into an connection error." }]);
    } finally {
       setChatLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if(percentage >= 70) return 'text-green-400';
    if(percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!resumeData) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col gap-8 md:flex-row">
       {/* LEFT CONTENT: Jobs & Gap Analysis */}
       <div className="flex-1 overflow-hidden flex flex-col gap-6">
          <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Your AI Career Hub</h1>
                <p className="text-sm text-[#86868b] mt-1">Personalized analysis for {resumeData.name}</p>
             </div>
             <button className="btn-secondary flex items-center gap-2" onClick={() => setShowAnalysis(!showAnalysis)}>
                 {showAnalysis ? 'Hide Resume Stats' : 'View Resume Stats'} {showAnalysis ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
             </button>
          </div>
          
          {showAnalysis && (
            <div className="glass-panel text-sm text-[#8b949e]">
               <h4 className="text-white font-medium mb-2 border-b border-[#30363d] pb-2">Extracted Data</h4>
               <p><strong>Technical:</strong> {resumeData.technicalSkills?.join(' • ')}</p>
               <p className="mt-2"><strong>Soft:</strong> {resumeData.softSkills?.join(' • ')}</p>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-white mb-[-10px] mt-4 flex items-center gap-2"><BarChart className="text-[#58a6ff]" size={20}/> Recommended Live Jobs</h2>
          {loadingJobs && (
            <div className="py-12 text-center">
              <Loader className="animate-spin inline-block text-[#58a6ff] mb-2" size={30} />
              <p className="text-[#8b949e]">Matching your resume to live Adzuna listings...</p>
            </div>
          )}
          
          {!loadingJobs && jobs.length === 0 && (
             <p className="text-[#8b949e] italic">No exact job matches found nearby at the moment.</p>
          )}

          <div className="grid gap-4">
             {jobs.map((job, idx) => (
                <div key={idx} className="job-card-gemini job-card-animate relative overflow-hidden" style={{animationDelay: `${idx * 0.12}s`}}>
                   <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{job.title}</h3>
                          <p className="text-[#58a6ff] font-medium text-sm">{job.company}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                         {job.matchPercentage !== undefined && (
                            <span className={`text-lg font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}% Match</span>
                         )}
                      </div>
                   </div>
                   <div className="mt-4 flex flex-wrap gap-2 text-xs">
                       {job.missingSkills?.length > 0 ? (
                           <>
                             <span className="text-[#8b949e] flex items-center pr-2">Gaps:</span>
                             {job.missingSkills.map(s => <span key={s} className="px-2 py-1 bg-red-900 bg-opacity-30 text-red-300 rounded border border-red-500 border-opacity-20">{s}</span>)}
                           </>
                       ) : (
                           <span className="text-green-400">Perfect skill match!</span>
                       )}
                   </div>
                   <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                        <button className="text-[#a8c7fa] text-sm font-semibold hover:text-[#d3e3fd] transition-colors flex items-center gap-1" onClick={() => sendHoverMessage(job)}>
                           Ask AI to analyze this job gap <Sparkles size={14} className="gemini-gradient-text" />
                        </button>
                        <a href={job.url} target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2 py-1.5 px-4 text-xs font-semibold">
                           Apply <ExternalLink size={14}/>
                        </a>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* RIGHT CONTENT: Attached AI Co-pilot Chat */}
       <div className="w-full md:w-[400px] lg:w-[450px] shrink-0">
          <div className="glass-panel flex flex-col h-[750px] sticky top-24 shadow-lg overflow-hidden p-0 border-[rgba(255,255,255,0.1)]">
             <div className="bg-[#1e1f22] border-b border-[rgba(255,255,255,0.05)] p-5 flex items-center gap-3 z-10 relative">
                 <div className="w-10 h-10 bg-[rgba(255,255,255,0.05)] rounded-full flex justify-center items-center">
                    <Sparkles size={20} style={{stroke: "url(#geminiGrad)"}} />
                    <svg width="0" height="0">
                      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop stopColor="#4285f4" offset="0%" />
                        <stop stopColor="#d96570" offset="50%" />
                        <stop stopColor="#9b72cb" offset="100%" />
                      </linearGradient>
                    </svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-lg tracking-tight">Career Copilot</h3>
                    <p className="text-xs text-[#c4c7c5] mt-0.5">Gemini-powered insights</p>
                 </div>
             </div>
             
             {/* Chat log */}
             <div className="flex-1 overflow-y-auto space-y-6 px-5 py-6 custom-scroll pb-4 bg-[#131314] relative z-0">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 msg-bubble-animate ${msg.role === 'ai' ? 'items-start' : 'items-end flex-row-reverse'}`} style={{animationDelay: '0.05s'}}>
                      {msg.role === 'ai' && (
                         <div className="w-8 h-8 mt-1 rounded-full shrink-0 flex justify-center items-center">
                            <Sparkles size={16} style={{stroke: "url(#geminiGrad)"}} />
                         </div>
                      )}
                      
                      <div className={`max-w-[85%] rounded-2xl p-4 text-[15px] ${msg.role === 'ai' ? 'text-[#e3e3e3] bg-transparent pl-0 pt-1' : 'bg-[#1e1f22] text-[#e3e3e3] border border-[rgba(255,255,255,0.05)] rounded-br-sm shadow-sm'}`}>
                          <div className="react-markdown-content leading-relaxed break-words">
                             <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                          </div>
                      </div>
                    </div>
                ))}
                {chatLoading && (
                    <div className="flex gap-3 items-start msg-bubble-animate">
                      <div className="w-8 h-8 mt-1 rounded-full shrink-0 flex justify-center items-center">
                         <Sparkles size={16} style={{stroke: "url(#geminiGrad)"}} />
                      </div>
                      <div className="max-w-[60%] rounded-2xl p-4 text-[#e3e3e3] bg-transparent pl-0 pt-2">
                          <div className="flex gap-2 items-center h-4">
                            <span className="w-2 h-2 bg-[#a8c7fa] rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-[#a8c7fa] rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                            <span className="w-2 h-2 bg-[#a8c7fa] rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                          </div>
                      </div>
                    </div>
                )}
                <div ref={chatEndRef} />
             </div>
             
             {/* Chat input */}
             <div className="p-5 border-t border-[rgba(255,255,255,0.05)] bg-[#1e1f22] z-10 relative">
                <div className="flex gap-3 relative">
                   <input 
                     type="text" 
                     className="input-field rounded-[24px] pl-5 pr-14 py-3 bg-[#131314] shadow-inner text-[15px]" 
                     placeholder="Message Career Copilot..."
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                     disabled={chatLoading}
                   />
                   <button 
                     className="absolute right-2 top-2 bottom-2 w-10 h-auto p-0 flex justify-center items-center rounded-full bg-[#131314] text-[#c4c7c5] hover:bg-[#a8c7fa] hover:text-[#041e49] border border-[rgba(255,255,255,0.1)] transition-colors" 
                     onClick={() => sendMessage(input)}
                     disabled={chatLoading}
                   >
                     <Send size={16} className="translate-x-[-1px] translate-y-[1px]" />
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
