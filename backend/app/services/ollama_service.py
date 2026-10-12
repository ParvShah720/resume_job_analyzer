import httpx
import json
from ..config import settings

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL
        self.api_key = settings.OLLAMA_API_KEY # May be needed depending on Ollama proxy/setup
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        """General generation function mapped to Ollama /api/chat endpoints."""
        url = f"{self.base_url}/api/chat"
        
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
            
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }
        
        try:
            response = await self.client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
        except httpx.HTTPError as e:
            raise Exception(f"Ollama API request failed: {str(e)}")
            
    async def analyze_resume(self, resume_text: str) -> dict:
        """Sends extracted resume text to Ollama to be parsed logically."""
        
        system_prompt = (
            "You are an AI career assistant inside a Resume Analysis System. "
            "Your job is to extract organized data from the provided resume text. "
            "Only use the information supplied. Do not invent resume information."
        )
        
        prompt = (
            "Parse the following resume text and extract the details into the following strict JSON format. "
            "Ensure it is valid JSON and DO NOT include markdown code blocks like ```json in the output. Just return the raw JSON object.\n\n"
            "{\n"
            '  "name": "",\n'
            '  "email": "",\n'
            '  "phone": "",\n'
            '  "education": ["..."],\n'
            '  "experience": ["..."],\n'
            '  "technicalSkills": ["..."],\n'
            '  "softSkills": ["..."],\n'
            '  "projects": ["..."],\n'
            '  "certifications": ["..."],\n'
            '  "suggestedRoles": ["..."]\n'
            "}\n\n"
            f"RESUME TEXT:\n{resume_text}"
        )
        
        raw_response = await self.generate_response(prompt=prompt, system_prompt=system_prompt)
        
        return self._clean_and_parse_json(raw_response)

    def _clean_and_parse_json(self, response_text: str) -> dict:
        # Remove potential markdown fences
        text = response_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            # Fallback for malformed json
            return {
                "error": "Failed to parse JSON",
                "rawResult": text
            }
