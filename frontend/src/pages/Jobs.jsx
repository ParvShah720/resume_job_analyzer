import { useState, useContext } from 'react';
import { AppContext } from '../App';
import * as api from '../services/api';
import { Briefcase, Search, ExternalLink, Loader, BarChart, AlertCircle } from 'lucide-react';

export default function Jobs() {
  const { resumeData } = useContext(AppContext);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecommendMode, setIsRecommendMode] = useState(false);

  const fetchJobs = async (recommend = false) => {
    if (!keyword.trim()) {
      setError("Please enter a job keyword.");
      return;
    }
    
    setLoading(true);
    setError('');
    setIsRecommendMode(recommend);
    
    try {
      if (recommend) {
        const resumeSkills = resumeData ? [...(resumeData.technicalSkills || []), ...(resumeData.softSkills || [])] : [];
        if(resumeSkills.length === 0) {
           setError("No resume extracted. Please upload a resume first for recommendations.");
           setLoading(false);
           return;
        }
        const res = await api.recommendJobs(resumeSkills, keyword, location || 'India');
        setJobs(res.data.recommended || []);
      } else {
        const res = await api.searchJobs(keyword, location || 'India');
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if(percentage >= 70) return 'text-green-400';
    if(percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Briefcase className="text-[#58a6ff]" size={28}/> Live Job Finder
          </h1>
          <p className="text-[#8b949e]">Search live Adzuna listings or match them magically to your resume.</p>
        </div>
      </div>

      <div className="glass-panel mb-8 border-b-4 border-b-[#58a6ff]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-[#8b949e] block mb-2">Job Keyword</label>
            <input type="text" className="input-field" placeholder="e.g. React Developer" value={keyword} onChange={e => setKeyword(e.target.value)}/>
          </div>
          <div>
            <label className="text-sm text-[#8b949e] block mb-2">Location</label>
            <input type="text" className="input-field" placeholder="e.g. Mumbai" value={location} onChange={e => setLocation(e.target.value)}/>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary flex items-center justify-center gap-2 flex-1" onClick={() => fetchJobs(false)} disabled={loading}>
            <Search size={16}/> Basic Search
          </button>
          <button className="btn-primary flex items-center justify-center gap-2 flex-1" onClick={() => fetchJobs(true)} disabled={loading}>
            <BarChart size={16}/> Recommend & Match (AI)
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="bg-[#da3633] bg-opacity-10 border border-[#da3633] text-white p-4 rounded-lg flex items-start gap-3 mb-8">
          <AlertCircle className="text-[#da3633] shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-[#8b949e] flex flex-col items-center">
            <Loader className="animate-spin text-[#58a6ff] mb-4" size={40} />
            <p>Fetching amazing opportunities for you...</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid gap-6 animate-fade-in">
          {jobs.map((job, idx) => (
            <div key={idx} className="glass-panel hover:border-[#58a6ff] transition-all">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-[#58a6ff] font-medium">{job.company} &bull; <span className="text-[#8b949e]">{job.location}</span></p>
                  <p className="text-xs text-[#8b949e] mt-2 uppercase tracking-wide">Category: {job.category}</p>
                </div>
                <a href={job.url} target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2 shrink-0">
                   Apply Now <ExternalLink size={16}/>
                </a>
              </div>
              
              <div dangerouslySetInnerHTML={{__html: job.description}} className="text-sm text-[#c9d1d9] mb-6 line-clamp-3 bg-[#0d1117] p-4 rounded-lg border border-[#30363d]" />
              
              {isRecommendMode && job.matchPercentage !== undefined && (
                <div className="mt-4 pt-4 border-t border-[#30363d]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}% Match</span>
                    <div className="flex-1 h-3 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                       <div className="h-full bg-[#58a6ff]" style={{width: `${job.matchPercentage}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Matched Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {job.matchedSkills?.map(s => <span key={s} className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-400 text-xs rounded">{s}</span>)}
                        {(!job.matchedSkills || job.matchedSkills.length === 0) && <span className="text-xs text-[#8b949e]">None</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Missing Setup</p>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills?.map(s => <span key={s} className="px-2 py-1 bg-red-900 bg-opacity-30 text-red-400 text-xs rounded">{s}</span>)}
                        {(!job.missingSkills || job.missingSkills.length === 0) && <span className="text-xs text-[#8b949e]">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
