from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..services.skill_service import SkillService

router = APIRouter()
skill_service = SkillService()

class SkillGapRequest(BaseModel):
    resumeSkills: List[str]
    targetRole: str
    
@router.post("/gap")
async def analyze_gap(request: SkillGapRequest):
    try:
        gap_analysis = await skill_service.get_skill_gap(request.resumeSkills, request.targetRole)
        return gap_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
