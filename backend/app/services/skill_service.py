from .ollama_service import OllamaService
import json

class SkillService:
    def __init__(self):
        self.ollama = OllamaService()
        
    async def get_skill_gap(self, resume_skills: list, target_role: str) -> dict:
        system_prompt = (
            "You are a Career Assistant AI. Your job is to analyze skill gaps based on the user's current skills and their target role. "
            "Do not output markdown code blocks. Output raw valid JSON strictly."
        )
        
        prompt = (
             f"The user wants to become a '{target_role}'.\n"
             f"Their current skills are: {', '.join(resume_skills)}.\n\n"
             "Analyze the skill gap and return a valid JSON object strictly matching this format without any ```json wrappers. Return ONLY the JSON:\n"
             "{\n"
             f'  "targetRole": "{target_role}",\n'
             '  "existingSkills": ["<skills from their list relevant to this role>"],\n'
             '  "missingSkills": ["<skills they need to learn for this role but dont have>"],\n'
             '  "recommendedSkills": ["<additional future/advanced skills to learn>"],\n'
             '  "learningSuggestions": ["<actions they can take to learn>"]\n'
             "}"
        )
        
        raw = await self.ollama.generate_response(prompt=prompt, system_prompt=system_prompt)
        return self.ollama._clean_and_parse_json(raw)
        
    async def extract_skills_from_text(self, text: str) -> list:
        # Helper to extract skills from job description quickly if needed
        prompt = (
             "Extract technical and soft skills from the following text and return a raw JSON list of strings. "
             "No markdown. For example: [\"Java\", \"Docker\", \"Communication\"].\n\n"
             f"TEXT:\n{text}"
        )
        
        raw = await self.ollama.generate_response(prompt=prompt, system_prompt="You extract skills into JSON format.")
        try:
             res = self.ollama._clean_and_parse_json(raw)
             if isinstance(res, list): return res
             return []
        except:
             return []
