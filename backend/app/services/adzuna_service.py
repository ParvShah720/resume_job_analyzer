import httpx
from ..config import settings

class AdzunaService:
    def __init__(self):
        self.app_id = settings.ADZUNA_APP_ID
        self.app_key = settings.ADZUNA_APP_KEY
        self.base_url = "https://api.adzuna.com/v1/api/jobs"
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def search_jobs(self, keyword: str, location: str, page: int = 1) -> list:
        """Fetch live jobs from Adzuna API."""
        # Using country 'gb' here or we can use 'in' for India/Mumbai. By default Adzuna uses 'in' for India.
        # Let's use 'in' as prompt example mentions Mumbai.
        country_code = "in" 
        url = f"{self.base_url}/{country_code}/search/{page}"
        
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": 20,
            "what": keyword,
            "where": location
        }
        
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Map into clean schema format
            results = data.get("results", [])
            mapped_jobs = []
            
            for job in results:
                mapped_jobs.append({
                    "id": job.get("id"),
                    "title": job.get("title"),
                    "company": job.get("company", {}).get("display_name", ""),
                    "location": job.get("location", {}).get("display_name", location),
                    "description": job.get("description", ""),
                    "url": job.get("redirect_url", ""),
                    "created": job.get("created", ""),
                    "category": job.get("category", {}).get("label", "")
                })
                
            return mapped_jobs
        except httpx.HTTPError as e:
            raise Exception(f"Adzuna API request failed: {str(e)}")
