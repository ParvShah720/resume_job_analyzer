from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.ollama_service import OllamaService
import typing

router = APIRouter()
ollama = OllamaService()

class ChatRequest(BaseModel):
    prompt: str
    resume: Optional[dict] = None
    raw_text: Optional[str] = None
    jobContext: Optional[list] = None

@router.post("/chat")
async def chat_with_assistant(req: ChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
    system_instruction = (
        "You are an AI career assistant inside a Resume Analysis, Skill Gap Detection and Job Recommendation System. "
        "You help users with Resume analysis, improvement, skill extraction, gaps, career development, roles and learning. "
        "Use only information supplied. Do not invent details. "
        "If a question is unrelated to resumes, careers, skills or jobs, gracefully explain you are limited to career assistance. "
        "Provide clear, concise and structured responses."
    )
    
    context = ""
    if req.resume:
        context = f"\n\nHere is the user's parsed resume data for context:\n{req.resume}\n\n"
        
    if req.raw_text:
        context += f"And here is the exact, unsummarized text extracted from their PDF resume for maximum detail:\n[START RAW TEXT]\n{req.raw_text}\n[END RAW TEXT]\n\n"
        
    if req.jobContext:
        context += f"Here are the recommended jobs the user is currently looking at: {req.jobContext}\n"
    
    full_prompt = f"{context}User Question: {req.prompt}"
    
    try:
        response = await ollama.generate_response(prompt=full_prompt, system_prompt=system_instruction)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
