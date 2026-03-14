import pdfplumber
import re
from typing import List, Dict, Any

class ResumeParser:
    def __init__(self):
        # Expanded skill database for better extraction
        self.skills_db = [
            "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Next.js",
            "Node.js", "Express", "FastAPI", "Django", "Flask", "SQL", "PostgreSQL",
            "MongoDB", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git",
            "Machine Learning", "Deep Learning", "Data Science", "HTML", "CSS",
            "Tailwind CSS", "Redux", "GraphQL", "REST API", "NumPy", "Pandas",
            "TensorFlow", "PyTorch", "Scikit-learn", "Linux", "Bash", "CI/CD"
        ]

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    def extract_skills(self, text: str) -> List[str]:
        found_skills = []
        text_lower = text.lower()
        for skill in self.skills_db:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
                found_skills.append(skill)
        return found_skills

    def extract_email(self, text: str) -> str:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else ""

    def extract_experience(self, text: str) -> List[str]:
        """Extract project/experience mentions from resume"""
        experience = []
        
        # Look for common project indicators
        project_patterns = [
            r'(?:project|built|developed|created|designed)[\s:]+([^\n.]{10,80})',
            r'(?:experience|worked on)[\s:]+([^\n.]{10,80})'
        ]
        
        for pattern in project_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            experience.extend([m.strip() for m in matches[:3]])  # Limit to 3
        
        return experience if experience else ["General software development experience"]

    def parse(self, file_path: str) -> Dict[str, Any]:
        """
        Parse resume and return structured JSON (Option B format)
        """
        text = self.extract_text_from_pdf(file_path)
        skills = self.extract_skills(text)
        email = self.extract_email(text)
        experience = self.extract_experience(text)
        
        # Return structured data ready for LLM
        return {
            "current_skills": skills if skills else ["Communication", "Problem Solving"],
            "experience": experience,
            "email": email,
            "raw_text_preview": text[:300] + "..."  # For debugging
        }
