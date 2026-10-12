from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from ..services.adzuna_service import AdzunaService
from ..services.job_matching_service import JobMatchingService
from ..services.skill_service import SkillService

router = APIRouter()
adzuna_service = AdzunaService()
job_matching_service = JobMatchingService()
skill_service = SkillService()

class RecommendRequest(BaseModel):
    resumeSkills: List[str]
    keyword: str
    location: str

@router.get("")
async def search_jobs(
    keyword: str = Query(..., description="Job keyword to search"),
    location: str = Query(..., description="Location to search"),
    page: int = Query(1, ge=1)
):
    try:
        jobs = await adzuna_service.search_jobs(keyword=keyword, location=location, page=page)
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
async def recommend_jobs(req: RecommendRequest):
    try:
        # 1. Fetch live jobs
        jobs = await adzuna_service.search_jobs(keyword=req.keyword, location=req.location, page=1)
        
        # We will bound to top 5 jobs for performance since extracting skills might be heavy if doing LLM per job.
        jobs_to_process = jobs[:5]
        
        recommended = []
        for job in jobs_to_process:
            # 2. Extract job skills
            extracted_skills = await skill_service.extract_skills_from_text(job.get("description", ""))
            
            # 3. Deterministic match
            match_stats = job_matching_service.calculate_match(req.resumeSkills, extracted_skills)
            
            job.update(match_stats)
            recommended.append(job)
            
        # 4. (Optional) Ollama explanation: We can let React ask Ollama for explanation separately if needed, or attach it here.
        # But for deterministic sake, returning the calculated match is enough here.
        return {"recommended": recommended}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
