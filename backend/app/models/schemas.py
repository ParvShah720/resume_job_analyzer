from pydantic import BaseModel
from typing import List, Optional

class ResumeUploadResponse(BaseModel):
    message: str
    parsed_data: Optional[dict] = None
    raw_text: Optional[str] = None
