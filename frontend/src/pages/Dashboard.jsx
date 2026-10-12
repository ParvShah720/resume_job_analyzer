import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, ArrowRight, Loader } from 'lucide-react';
import { AppContext } from '../App';
import * as api from '../services/api';

export default function Dashboard() {
  const { resumeData, setResumeData, setRawText } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.uploadResume(file);
      if (response.data?.parsed_data) {
        const pd = response.data.parsed_data || {};
        
        // Sanitize generated arrays since LLM might return comma-separated strings
        const ensureArray = (val) => {
            if (Array.isArray(val)) return val.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item));
            if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
            return [];
        };

        const ensureString = (val) => {
            if (typeof val === 'string') return val;
            if (typeof val === 'number') return String(val);
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return '';
        };

        pd.name = ensureString(pd.name);
        pd.email = ensureString(pd.email);
        pd.phone = ensureString(pd.phone);
        
        pd.technicalSkills = ensureArray(pd.technicalSkills);
        pd.softSkills = ensureArray(pd.softSkills);
        pd.experience = ensureArray(pd.experience);
        pd.education = ensureArray(pd.education);
        pd.projects = ensureArray(pd.projects);
        pd.certifications = ensureArray(pd.certifications);
        pd.suggestedRoles = ensureArray(pd.suggestedRoles);

        setResumeData(pd);
        setRawText(response.data.raw_text || '');
        
        // Clear stale cache from previous session so old chat doesn't replay
        localStorage.removeItem('careerAI_jobs');
        localStorage.removeItem('careerAI_chat');
        
        navigate('/hub');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="text-center mt-12 mb-16">
        <h1 className="text-4xl font-bold mb-4">Supercharge Your Career with <span className="text-[#58a6ff]">AI</span></h1>
        <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">Upload your resume to instantly identify skill gaps, discover tailored job recommendations, and receive AI-powered career coaching.</p>
      </div>

      <div className="glass-panel text-center p-12 max-w-2xl mx-auto border-dashed border-2 border-[#30363d] hover:border-[#58a6ff] transition-all cursor-pointer relative" onClick={!loading ? handleUploadClick : undefined}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="application/pdf"
        />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[150px]">
            <Loader className="animate-spin text-[#58a6ff] mb-4" size={40} />
            <p className="text-white font-medium">Extracting data with AI...</p>
            <p className="text-[#8b949e] text-sm mt-2">This usually takes a few seconds.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[150px]">
             <UploadCloud className="text-[#58a6ff] mb-4" size={48} />
             <h3 className="text-xl text-white font-semibold mb-2">Upload Resume PDF</h3>
             <p className="text-[#8b949e]">Click to browse or drag and drop your file here.</p>
             {error && <p className="text-[#da3633] mt-4 font-medium bg-[#da3633] bg-opacity-10 py-2 px-4 rounded">{error}</p>}
          </div>
        )}
      </div>

      {resumeData && !loading && (
        <div className="mt-16 bg-[#161b22] border border-[#30363d] rounded-xl p-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl text-white font-semibold flex items-center gap-2"><FileText className="text-[#58a6ff]" /> Current Resume active</h3>
            <span className="badge">Analyzed</span>
          </div>
          
          <div className="grid-2">
             <div className="bg-[#0d1117] p-5 rounded-lg border border-[#30363d]">
               <p className="text-[#8b949e] text-sm mb-1">Candidate Name</p>
               <p className="text-white font-medium text-lg">{resumeData.name || 'Unknown'}</p>
             </div>
             <div className="bg-[#0d1117] p-5 rounded-lg border border-[#30363d]">
               <p className="text-[#8b949e] text-sm mb-1">Extracted Skills</p>
               <p className="text-white font-medium text-lg">{(resumeData.technicalSkills?.length || 0) + (resumeData.softSkills?.length || 0)} Found</p>
             </div>
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button className="btn-secondary" onClick={() => navigate('/gap')}>Detect Gaps</button>
            <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/hub')}>Enter Career Hub <ArrowRight size={16}/></button>
          </div>
        </div>
      )}
    </div>
  );
}
