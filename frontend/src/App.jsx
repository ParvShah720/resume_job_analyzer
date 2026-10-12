import { useState, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Briefcase, User, Search, MessageSquare, LayoutDashboard } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import ResumeAnalysis from './pages/ResumeAnalysis'
import SkillGap from './pages/SkillGap'
import Jobs from './pages/Jobs'
import AIChat from './pages/AIChat'
import UnifiedCareerHub from './pages/UnifiedCareerHub'

export const AppContext = createContext();

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [rawText, setRawText] = useState(null);

  return (
    <AppContext.Provider value={{ resumeData, setResumeData, rawText, setRawText }}>
      <Router>
        <div className="min-h-screen">
          <nav className="glass-nav">
            <div className="nav-content">
              <div className="logo cursor-pointer font-bold text-xl text-white flex items-center gap-2">
                <Briefcase className="text-[#58a6ff]" />
                <span>CareerAI</span>
              </div>
              <div className="nav-links flex items-center gap-6">
                <NavLink to="/" className={({isActive}) => `flex items-center gap-2 nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/hub" className={({isActive}) => `flex items-center gap-2 nav-link ${isActive ? 'active' : ''}`}>
                  <User size={18} /> Career Hub
                </NavLink>
                <NavLink to="/gap" className={({isActive}) => `flex items-center gap-2 nav-link ${isActive ? 'active' : ''}`}>
                  <Search size={18} /> Skill Gap
                </NavLink>
                <NavLink to="/jobs" className={({isActive}) => `flex items-center gap-2 nav-link ${isActive ? 'active' : ''}`}>
                  <Briefcase size={18} /> Jobs
                </NavLink>
                <NavLink to="/chat" className={({isActive}) => `flex items-center gap-2 nav-link ${isActive ? 'active' : ''}`}>
                  <MessageSquare size={18} /> AI Chat
                </NavLink>
              </div>
            </div>
          </nav>
          
          <main className="layout-container animate-fade-in">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hub" element={<UnifiedCareerHub />} />
              <Route path="/analysis" element={<ResumeAnalysis />} />
              <Route path="/gap" element={<SkillGap />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/chat" element={<AIChat />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppContext.Provider>
  )
}

export default App
