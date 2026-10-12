import { useState, useContext } from 'react';
import { AppContext } from '../App';
import * as api from '../services/api';
import { Target, Search, Loader, AlertCircle, ArrowRight } from 'lucide-react';

export default function SkillGap() {
  const { resumeData } = useContext(AppContext);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [error, setError] = useState('');

  const analyzeGap = async () => {
    if (!targetRole.trim()) {
       setError("Please enter a target role.");
       return;
    }
    
    // We will extract just the raw strings for the backend
    const resumeSkills = resumeData ? [...(resumeData.technicalSkills || []), ...(resumeData.softSkills || [])] : [];
    
    if (resumeSkills.length === 0) {
       setError("No skills found in resume. Please upload a resume first.");
       return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.getSkillGap(resumeSkills, targetRole);
      setGapData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to analyze skill gap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Target className="text-[#58a6ff]" size={28}/> Skill Gap Detection
      </h1>
      <p className="text-[#8b949e] mb-8">Compare your current resume skills against your dream job requirements.</p>

      <div className="glass-panel mb-8 flex gap-4 items-center">
        <div className="flex-1">
           <label className="text-sm text-[#8b949e] block mb-2">Target Job Role</label>
           <input 
             type="text" 
             className="input-field py-3 text-lg" 
             placeholder="e.g. Java Backend Developer"
             value={targetRole}
             onChange={e => setTargetRole(e.target.value)}
           />
        </div>
        <button 
          className="btn-primary mt-6 py-3 px-6 h-[50px] flex items-center justify-center min-w-[200px]"
          onClick={analyzeGap}
          disabled={loading}
        >
          {loading ? <Loader className="animate-spin" size={20} /> : (
            <><Search size={18} className="mr-2"/> Analyze Gap</>
          )}
        </button>
      </div>

      {error && !loading && (
        <div className="bg-[#da3633] bg-opacity-10 border border-[#da3633] text-white p-4 rounded-lg flex items-start gap-3 mb-8">
          <AlertCircle className="text-[#da3633] shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {gapData && !loading && (
        <div className="animate-fade-in space-y-6">
          <div className="glass-panel border-[#58a6ff] border-opacity-30">
            <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Analysis for: {gapData.targetRole}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#161b22] border border-green-900 border-opacity-50 p-5 rounded-lg">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">Existing Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {gapData.existingSkills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500 bg-opacity-10 text-green-300 rounded text-sm">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="bg-[#161b22] border border-red-900 border-opacity-50 p-5 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">Missing Skills (Gap)</h4>
                <div className="flex flex-wrap gap-2">
                  {gapData.missingSkills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500 bg-opacity-10 text-red-300 border border-red-500 border-opacity-20 rounded text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-[#c9d1d9] font-medium mb-3">Recommended Future Skills</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                 {gapData.recommendedSkills?.map((skill, i) => (
                    <span key={i} className="badge">{skill}</span>
                  ))}
              </div>

              <h4 className="text-[#c9d1d9] font-medium mb-3">Learning Action Plan</h4>
               <ul className="list-disc pl-5 space-y-2 text-[#8b949e]">
                 {gapData.learningSuggestions?.map((sg, i) => (
                    <li key={i}>{sg}</li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
