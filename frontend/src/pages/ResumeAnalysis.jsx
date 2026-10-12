import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { User, Phone, Mail, GraduationCap, Briefcase, Code, Award, Lightbulb, AlertTriangle } from 'lucide-react';

export default function ResumeAnalysis() {
  const { resumeData } = useContext(AppContext);
  const navigate = useNavigate();

  if (!resumeData) {
    return (
      <div className="glass-panel text-center mt-12 py-16">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl mb-4">No Resume Data Found</h2>
        <p className="text-[#8b949e] mb-6">Please upload a resume first to view the analysis.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }) => (
    <div className="glass-panel mb-6">
      <h3 className="text-lg flex items-center gap-2 border-b border-[#30363d] pb-3 mb-4">
        <Icon size={20} className="text-[#58a6ff]" /> {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="pb-12">
      <h1 className="text-2xl font-bold mb-8">Generated Resume Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        
        {/* Left Column: Personal info & Skills */}
        <div className="flex flex-col gap-6">
          <Section title="Personal Info" icon={User}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider">Name</p>
                <p className="font-medium">{resumeData.name || 'Not Found'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#8b949e]" />
                <p>{resumeData.email || 'Not Found'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#8b949e]" />
                <p>{resumeData.phone || 'Not Found'}</p>
              </div>
            </div>
          </Section>

          <Section title="Technical Skills" icon={Code}>
            <div className="flex flex-wrap gap-2">
              {resumeData.technicalSkills?.length > 0 ? (
                resumeData.technicalSkills.map((s, i) => (
                  <span key={i} className="badge">{s}</span>
                ))
              ) : (
                <p className="text-[#8b949e] text-sm">None explicitly found.</p>
              )}
            </div>
          </Section>

          <Section title="Soft Skills" icon={Lightbulb}>
             <div className="flex flex-wrap gap-2">
              {resumeData.softSkills?.length > 0 ? (
                resumeData.softSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-full text-sm">{s}</span>
                ))
              ) : (
                <p className="text-[#8b949e] text-sm">None explicitly found.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Right Column: Experience, Ed, Projects */}
        <div className="flex flex-col gap-6">
          
          <Section title="Suggested Roles by AI" icon={Award}>
             <div className="flex flex-wrap gap-3">
               {resumeData.suggestedRoles?.length > 0 ? (
                 resumeData.suggestedRoles.map((role, idx) => (
                   <div key={idx} className="bg-[#0d1117] border border-[#58a6ff] border-opacity-30 p-3 rounded-lg flex-1 min-w-[200px] text-center">
                     <span className="font-semibold text-[#58a6ff]">{role}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-[#8b949e]">No roles suggested.</p>
               )}
             </div>
          </Section>

          <Section title="Experience" icon={Briefcase}>
            {resumeData.experience?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-[#c9d1d9]">
                {resumeData.experience.map((exp, i) => <li key={i}>{exp}</li>)}
              </ul>
            ) : (
              <p className="text-[#8b949e]">No experience listed.</p>
            )}
          </Section>

          <Section title="Education" icon={GraduationCap}>
             {resumeData.education?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-[#c9d1d9]">
                {resumeData.education.map((ed, i) => <li key={i}>{ed}</li>)}
              </ul>
            ) : (
              <p className="text-[#8b949e]">No education listed.</p>
            )}
          </Section>
          
          <Section title="Projects" icon={Award}>
             {resumeData.projects?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-[#c9d1d9]">
                {resumeData.projects.map((proj, i) => <li key={i}>{proj}</li>)}
              </ul>
            ) : (
              <p className="text-[#8b949e]">No projects listed.</p>
            )}
          </Section>

        </div>

      </div>
    </div>
  );
}
