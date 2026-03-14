"""
Skill Gap Learning API
Generates personalized coding exercises, quizzes, and mini-projects based on skill gaps
[PREMIUM FEATURE]
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
from app.services.gemini_service import GeminiService
from app.models.database import User
from app.utils.premium import require_premium

router = APIRouter(prefix="/api/learning", tags=["learning"])

class LearningRequest(BaseModel):
    current_skills: List[str]
    target_role: str
    experience_level: str  # "beginner", "intermediate", "advanced"
    weak_skills: List[str]

class CodingExercise(BaseModel):
    title: str
    skill: str
    difficulty: str  # "easy", "medium", "hard"
    description: str
    starter_code: str
    hints: List[str]
    expected_output: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class Quiz(BaseModel):
    topic: str
    skill: str
    questions: List[QuizQuestion]

class MiniProject(BaseModel):
    title: str
    description: str
    skills_practiced: List[str]
    duration: str
    steps: List[str]
    evaluation_criteria: List[str]

class LearningResponse(BaseModel):
    skill_gap_summary: str
    coding_exercises: List[CodingExercise]
    quizzes: List[Quiz]
    mini_projects: List[MiniProject]
    recommended_order: List[str]
    estimated_time: str

@router.post("/skill-gap-exercises", response_model=LearningResponse)
async def generate_skill_gap_exercises(
    request: LearningRequest,
    current_user: User = Depends(require_premium)  # Premium feature
):
    """
    Generate personalized learning content based on skill gaps.
    Includes coding exercises, quizzes, and mini-projects.
    [PREMIUM FEATURE - Requires active subscription]
    """
    try:
        gemini = GeminiService()
        
        prompt = f"""You are an expert coding instructor. Create personalized learning content for a developer.

**CURRENT SKILLS:** {', '.join(request.current_skills)}
**TARGET ROLE:** {request.target_role}
**EXPERIENCE LEVEL:** {request.experience_level}
**WEAK SKILLS TO IMPROVE:** {', '.join(request.weak_skills)}

Generate learning content to help them bridge the skill gap. Return ONLY valid JSON:
{{
    "skill_gap_summary": "2-3 sentence summary of their skill gaps and learning priorities",
    "coding_exercises": [
        {{
            "title": "Exercise title",
            "skill": "Specific skill being practiced",
            "difficulty": "easy" or "medium" or "hard",
            "description": "What the exercise asks the user to do",
            "starter_code": "// Starter code here\\nfunction solution() {{\\n  // Your code\\n}}",
            "hints": ["Hint 1", "Hint 2"],
            "expected_output": "What the output should be"
        }}
    ],
    "quizzes": [
        {{
            "topic": "Quiz topic",
            "skill": "Skill being tested",
            "questions": [
                {{
                    "question": "Question text?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_index": 0,
                    "explanation": "Why this answer is correct"
                }}
            ]
        }}
    ],
    "mini_projects": [
        {{
            "title": "Project name",
            "description": "What they will build",
            "skills_practiced": ["Skill1", "Skill2"],
            "duration": "2-3 hours",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "evaluation_criteria": ["Criteria 1", "Criteria 2"]
        }}
    ],
    "recommended_order": ["Exercise 1", "Quiz 1", "Exercise 2", "Mini Project 1"],
    "estimated_time": "8-10 hours"
}}

Generate:
- 3 coding exercises (1 easy, 1 medium, 1 hard)
- 2 quizzes with 4 questions each
- 2 mini projects
Make content specific to their weak skills and target role.
Return ONLY valid JSON, no markdown."""

        response = gemini.generate(prompt)
        
        try:
            # Clean up response
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            result = json.loads(cleaned.strip())
            
            return LearningResponse(
                skill_gap_summary=result.get("skill_gap_summary", ""),
                coding_exercises=[CodingExercise(**e) for e in result.get("coding_exercises", [])],
                quizzes=[
                    Quiz(
                        topic=q["topic"],
                        skill=q["skill"],
                        questions=[QuizQuestion(**qq) for qq in q["questions"]]
                    ) for q in result.get("quizzes", [])
                ],
                mini_projects=[MiniProject(**p) for p in result.get("mini_projects", [])],
                recommended_order=result.get("recommended_order", []),
                estimated_time=result.get("estimated_time", "")
            )
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")
            
        except Exception as e:
            print(f"❌ Error parsing response: {e}")
    
    except Exception as e:
        print(f"❌ Error in learning content generation: {e}")
    
    # Return fallback data
    weak_skill = request.weak_skills[0] if request.weak_skills else "JavaScript"
    return LearningResponse(
        skill_gap_summary=f"Based on your current skills and target role as {request.target_role}, you should focus on strengthening {', '.join(request.weak_skills[:3])}. These skills are in high demand and will significantly boost your career prospects.",
        coding_exercises=[
            CodingExercise(
                title="Array Manipulation Basics",
                skill=weak_skill,
                difficulty="easy",
                description="Write a function that takes an array of numbers and returns a new array with each number doubled.",
                starter_code="function doubleArray(arr) {\n  // Your code here\n}",
                hints=["Use the map() method", "Remember to return the new array"],
                expected_output="[2, 4, 6, 8, 10] for input [1, 2, 3, 4, 5]"
            ),
            CodingExercise(
                title="Object Filtering",
                skill=weak_skill,
                difficulty="medium",
                description="Write a function that filters an array of objects based on a given property and value.",
                starter_code="function filterObjects(arr, prop, value) {\n  // Your code here\n}",
                hints=["Use the filter() method", "Access object properties dynamically"],
                expected_output="Filtered array containing only matching objects"
            ),
            CodingExercise(
                title="Async Data Processing",
                skill=weak_skill,
                difficulty="hard",
                description="Implement a function that fetches data from multiple endpoints concurrently and combines the results.",
                starter_code="async function fetchAndCombine(urls) {\n  // Your code here\n}",
                hints=["Use Promise.all()", "Handle errors gracefully", "Consider using async/await"],
                expected_output="Combined data object from all endpoints"
            )
        ],
        quizzes=[
            Quiz(
                topic=f"{weak_skill} Fundamentals",
                skill=weak_skill,
                questions=[
                    QuizQuestion(question="What is the output of typeof []?", options=["array", "object", "undefined", "list"], correct_index=1, explanation="In JavaScript, arrays are objects, so typeof returns 'object'."),
                    QuizQuestion(question="Which method adds an element to the end of an array?", options=["shift()", "unshift()", "push()", "pop()"], correct_index=2, explanation="push() adds elements to the end of an array."),
                    QuizQuestion(question="What is closure in JavaScript?", options=["A syntax error", "A function with access to its outer scope", "A loop structure", "A data type"], correct_index=1, explanation="A closure is a function that retains access to variables from its containing scope."),
                    QuizQuestion(question="What does === compare?", options=["Value only", "Type only", "Value and type", "Reference only"], correct_index=2, explanation="The strict equality operator (===) compares both value and type.")
                ]
            )
        ],
        mini_projects=[
            MiniProject(
                title="Todo List App",
                description="Build a simple todo list application with add, delete, and mark complete functionality.",
                skills_practiced=[weak_skill, "DOM Manipulation", "Event Handling"],
                duration="2-3 hours",
                steps=["Set up HTML structure", "Style with CSS", "Add JavaScript for CRUD operations", "Implement local storage persistence"],
                evaluation_criteria=["All CRUD operations work correctly", "Data persists after page refresh", "Clean and readable code"]
            ),
            MiniProject(
                title="API Data Dashboard",
                description="Create a dashboard that fetches and displays data from a public API.",
                skills_practiced=[weak_skill, "API Integration", "Async/Await"],
                duration="3-4 hours",
                steps=["Choose a public API", "Fetch data using fetch()", "Display data in cards", "Add loading states and error handling"],
                evaluation_criteria=["Successfully fetches and displays data", "Handles loading and error states", "Responsive design"]
            )
        ],
        recommended_order=["Array Manipulation Basics", f"{weak_skill} Fundamentals Quiz", "Object Filtering", "Todo List App", "Async Data Processing", "API Data Dashboard"],
        estimated_time="8-12 hours"
    )
