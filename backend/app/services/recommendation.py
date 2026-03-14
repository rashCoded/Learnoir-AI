import json
import os
from typing import List, Dict, Any

class RecommendationService:
    def __init__(self):
        self.roles_data = self._load_roles()

    def _load_roles(self) -> List[Dict[str, Any]]:
        # Load from JSON file
        file_path = os.path.join(os.path.dirname(__file__), "..", "data", "roles.json")
        with open(file_path, "r") as f:
            return json.load(f)

    def recommend_roles(self, user_skills: List[str], user_interests: List[str]) -> List[Dict[str, Any]]:
        scored_roles = []
        
        user_skills_lower = [s.lower() for s in user_skills]
        user_interests_lower = [i.lower() for i in user_interests]

        for role in self.roles_data:
            score = 0
            matches = []
            missing = []

            # 1. Skill Matching
            # Required skills (Higher weight)
            for skill in role["required_skills"]:
                if skill.lower() in user_skills_lower:
                    score += 10
                    matches.append(skill)
                else:
                    missing.append(skill)
            
            # Preferred skills (Lower weight)
            for skill in role["preferred_skills"]:
                if skill.lower() in user_skills_lower:
                    score += 5
                    matches.append(skill)

            # 2. Interest Matching (Bonus)
            # Simple keyword matching between role title/skills and interests
            role_keywords = role["title"].lower().split() + [s.lower() for s in role["required_skills"]]
            for interest in user_interests_lower:
                if interest in role_keywords or any(k in interest for k in role_keywords):
                    score += 15
                    break # Cap interest bonus per role

            # 3. Market Demand Multiplier (Simplified)
            if role["market_demand"] == "very high":
                score *= 1.2
            elif role["market_demand"] == "high":
                score *= 1.1

            # Calculate match percentage (normalized roughly)
            # Max possible score estimation: 4 required * 10 + 4 preferred * 5 + 15 interest = 75 * 1.2 = 90
            match_percentage = min(int((score / 90) * 100), 99)

            scored_roles.append({
                "role": role,
                "score": score,
                "match_percentage": match_percentage,
                "matching_skills": matches,
                "missing_skills": missing
            })

        # Sort by score descending
        scored_roles.sort(key=lambda x: x["score"], reverse=True)
        
        return scored_roles[:5] # Return top 5
