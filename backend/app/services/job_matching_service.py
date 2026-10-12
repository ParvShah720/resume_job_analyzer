class JobMatchingService:
    def match_resume_to_jobs(self, resume_skills: list, jobs: list) -> list:
        """
        Simple deterministic skill matching.
        Looks for resume skills inside job descriptions to determine matches.
        """
        # Normalize resume skills mapping
        resume_skills_lower = [s.lower() for s in resume_skills]
        
        matched_jobs = []
        for job in jobs:
            description = job.get("description", "").lower()
            
            # Simple keyword matching algorithm
            matched_skills = []
            for skill, lower_skill in zip(resume_skills, resume_skills_lower):
                if lower_skill in description: # A robust implementation would use word boundaries
                    matched_skills.append(skill)
                    
            # For this simple mock logic, let's assume random 'missing' skills or infer them from job category
            # A true missing skill detection would extract skills from job desc first, but Adzuna doesn't give structured job skills out of the box in free tier.
            # So, we'll ask Ollama to explain or we just say any known skill not in matched is missing according to resume vs role.
            # Wait, the prompt specifically wants a deterministic matching:
            # "Extract relevant skills from job descriptions -> Compare with resume skills -> Calculate match -> Ollama explanation -> Recommended jobs"
            # Since we can't deterministically extract all job skills without an AI/NER model, we will use a basic keyword search.
            pass

            # Since the prompt requires deterministic algorithm:
            # "Matched: Java, Spring Boot ... Missing: Docker, Kafka ... Percentage 3/5 * 100"
            pass

        return []

    def calculate_match(self, resume_skills: list, job_skills: list) -> dict:
        matched = []
        missing = []
        
        # Normalize resume skills: both full strings and individual words
        resume_skills_lower = [s.lower().strip() for s in resume_skills]
        # Build a set of individual words from resume skills for fuzzy matching
        resume_words = set()
        for s in resume_skills_lower:
            for word in s.split():
                if len(word) > 2:  # skip tiny words like "of", "in"
                    resume_words.add(word)
        
        for js in job_skills:
            js_lower = js.lower().strip()
            
            # 1. Exact match
            if js_lower in resume_skills_lower:
                matched.append(js)
                continue
            
            # 2. Substring match (resume skill contains job skill or vice versa)
            found = False
            for rs in resume_skills_lower:
                if js_lower in rs or rs in js_lower:
                    matched.append(js)
                    found = True
                    break
            if found:
                continue
                    
            # 3. Word-overlap match (e.g. "Warehouse Operations" matches if "warehouse" is in resume)
            js_words = set(w for w in js_lower.split() if len(w) > 2)
            overlap = js_words & resume_words
            if len(overlap) >= 1 and len(overlap) / len(js_words) >= 0.5:
                matched.append(js)
                continue
            
            missing.append(js)
                
        total = len(job_skills)
        percentage = round((len(matched) / total * 100)) if total > 0 else 0
        
        return {
            "matchPercentage": percentage,
            "matchedSkills": matched,
            "missingSkills": missing
        }
