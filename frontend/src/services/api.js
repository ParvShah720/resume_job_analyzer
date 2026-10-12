import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const checkHealth = () => api.get('/health');

export const uploadResume = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post('/resume/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getSkillGap = (resumeSkills, targetRole) => {
    return api.post('/skills/gap', {
        resumeSkills,
        targetRole
    });
};

export const searchJobs = (keyword, location, page = 1) => {
    return api.get('/jobs', {
        params: { keyword, location, page }
    });
};

export const recommendJobs = (resumeSkills, keyword, location) => {
    return api.post('/jobs/recommend', {
        resumeSkills,
        keyword,
        location
    });
};

export const sendChatPrompt = (prompt, resumeData = null, rawText = null, jobContext = null) => {
    return api.post('/ai/chat', {
        prompt,
        resume: resumeData,
        raw_text: rawText,
        jobContext
    });
};

export default api;
