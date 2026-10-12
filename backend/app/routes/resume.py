from fastapi import APIRouter, UploadFile, File, HTTPException
from ..utils.pdf_parser import extract_text_from_pdf
from ..services.ollama_service import OllamaService
from ..models.schemas import ResumeUploadResponse

router = APIRouter()
ollama_service = OllamaService()

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty PDF file.")
            
        resume_text = extract_text_from_pdf(contents)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
            
        parsed_data = await ollama_service.analyze_resume(resume_text)
        
        if "error" in parsed_data:
            # Let it return gracefully with the error string in the parsed_data object
            pass
            
        return ResumeUploadResponse(
            message="Resume parsed successfully",
            parsed_data=parsed_data,
            raw_text=resume_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
