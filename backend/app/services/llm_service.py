import os
import json
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate_roadmap(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            # Return mock data if no API key
            return self._get_mock_roadmap()

        prompt = self._construct_prompt(user_profile)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview", # Or gpt-3.5-turbo
                messages=[
                    {"role": "system", "content": "You are PathPilot AI, an expert career mentor. Generate a structured learning roadmap."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._get_mock_roadmap()

    def _construct_prompt(self, profile: Dict[str, Any]) -> str:
        return f"""
        Generate a structured 8-week learning roadmap for a student aiming to become a {profile.get('target_role', 'Software Engineer')}.
        
        User Context:
        - Current Skills: {', '.join(profile.get('current_skills', []))}
        - Skill Gaps: {', '.join(profile.get('skill_gaps', []))}
        - Time Available: {profile.get('time_commitment', '10')} hours/week
        
        Requirements:
        1. Break down into 8 weekly milestones
        2. Each week should have:
           - Theme/Objective
           - 3-4 specific tasks
           - 2-3 resources (names only)
           - 1 mini-project
        3. Output strictly as JSON with this structure:
        {{
          "weeks": [
            {{
              "week": 1,
              "theme": "...",
              "tasks": ["..."],
              "resources": ["..."],
              "project": "..."
            }}
          ]
        }}
        """

    def _get_mock_roadmap(self) -> Dict[str, Any]:
        return {
            "weeks": [
                {
                    "week": 1,
                    "theme": "Python Basics & Git",
                    "tasks": ["Learn Python Syntax", "Understand Variables & Loops", "Git Init & Commit"],
                    "resources": ["Python Official Docs", "Git-SCM Book"],
                    "project": "CLI Calculator"
                },
                {
                    "week": 2,
                    "theme": "Data Structures",
                    "tasks": ["Lists & Dictionaries", "Basic Algorithms", "LeetCode Easy"],
                    "resources": ["NeetCode", "GeeksForGeeks"],
                    "project": "Contact Book App"
                }
            ],
            "note": "This is a MOCK roadmap because OpenAI API Key is missing."
        }
