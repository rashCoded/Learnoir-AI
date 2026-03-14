import google.generativeai as genai
import os
import json
import re
from typing import List, Dict, Any

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found. LLM features will be disabled.")
            self.model = None
            self.quota_exceeded = False
        else:
            genai.configure(api_key=api_key)
            # List of models to try in order of preference
            self.model_names = [
                'gemini-2.5-flash',
                'gemini-2.0-flash',
                'gemini-flash-latest'
            ]
            self.current_model_name = self.model_names[0]
            self.model = genai.GenerativeModel(self.current_model_name)
            # If we ever get a 429, we'll stop trying real calls for this server run
            self.quota_exceeded = False

    def generate(self, prompt: str) -> str:
        """Generic text generation method - returns raw text from LLM"""
        if not self.model or self.quota_exceeded:
            return "{}"
        
        for model_name in self.model_names:
            try:
                print(f"🤖 Generating with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                print(f"✅ Generation successful with {model_name}")
                return text
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                if "429" in msg:
                    print("🚫 Gemini quota exceeded.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                continue
        
        return "{}"

    def generate_roadmap(self, learner_profile: Dict[str, Any], duration_weeks: int = 8) -> Dict[str, Any]:
        """
        Generate roadmap using structured JSON input (Option B approach)
        
        Args:
            learner_profile: {
                "current_skills": [...],
                "missing_skills": [...],
                "experience": [...],
                "time_commitment": "2 hours/day"
            }
        """
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_roadmap(learner_profile.get("target_role", "Software Developer"), duration_weeks)

        # Clean, focused prompt using structured JSON
        prompt = f"""You are an expert career coach. Generate a {duration_weeks}-week learning roadmap.

LEARNER PROFILE:
{json.dumps(learner_profile, indent=2)}

REQUIREMENTS:
1. Focus on bridging the "missing_skills" gap
2. Build on their "current_skills"
3. Each week should have 3-5 actionable tasks
4. Include a hands-on project per week
5. Provide specific resources (not generic)

OUTPUT FORMAT (strict JSON):
{{
  "items": [
    {{
      "week": 1,
      "title": "Week theme",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
      "project": "Hands-on project name",
      "resources": ["Resource 1", "Resource 2"]
    }}
  ]
}}

Return ONLY the JSON object, no markdown, no extra text."""

        # Try each model in the list until one works
        for model_name in self.model_names:
            try:
                print(f"🤖 Attempting generation with model: {model_name}...")
                model = genai.GenerativeModel(model_name)
                
                response = model.generate_content(prompt)
                text = response.text
                
                print(f"✅ Success with {model_name}!")
                
                # Parse JSON
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # Fallback: Extract JSON from markdown
                    match = re.search(r'\{.*\}', text, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
                    raise
                    
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models, disable Gemini
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
                
        print("❌ All models failed. Falling back to mock data.")
        return self._get_mock_roadmap(learner_profile.get("target_role", "Software Developer"), duration_weeks)

    def generate_interview_questions(self, role: str, difficulty: str = "intermediate") -> List[Dict[str, Any]]:
        """Generate role-specific interview questions with tips"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_interview_questions(role)
        
        prompt = f"""You are an expert technical interviewer. Generate 12 interview questions for a {role} position.

Difficulty: {difficulty}

Requirements:
- 8 technical questions (role-specific, practical scenarios)
- 4 behavioral questions (using STAR method)
- Each question must have actionable tips for answering

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "category": "technical",
      "question": "Explain the difference between...",
      "tips": "Focus on practical examples and real-world use cases"
    }},
    {{
      "category": "behavioral",
      "question": "Tell me about a time when...",
      "tips": "Use STAR method: Situation, Task, Action, Result"
    }}
  ]
}}"""

        for model_name in self.model_names:
            try:
                print(f"🤖 Generating interview questions with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Generated {len(result.get('questions', []))} questions")
                return result.get("questions", [])
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock questions.")
        return self._get_mock_interview_questions(role)

    def generate_mcq_questions(self, role: str, difficulty: str = "intermediate", count: int = 10) -> List[Dict[str, Any]]:
        """Generate MCQ questions with 4 options and correct answer for a role"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_mcq_questions(role)
        
        prompt = f"""You are an expert technical interviewer. Generate {count} multiple choice questions for a {role} position.

Difficulty: {difficulty}

Requirements:
- Questions should test practical knowledge for {role}
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE option should be correct
- Include a brief explanation for why the answer is correct

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "question": "What is the primary purpose of React's useEffect hook?",
      "options": [
        "To manage component state",
        "To perform side effects in functional components",
        "To create new React components",
        "To handle form submissions"
      ],
      "correct_answer": 1,
      "explanation": "useEffect is used to perform side effects like data fetching, subscriptions, or manually changing the DOM in functional components."
    }},
    {{
      "question": "Which HTTP method is idempotent?",
      "options": [
        "POST",
        "PATCH",
        "PUT",
        "None of the above"
      ],
      "correct_answer": 2,
      "explanation": "PUT is idempotent because making the same request multiple times produces the same result."
    }}
  ]
}}"""

        for model_name in self.model_names:
            try:
                print(f"🤖 Generating MCQ questions with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Generated {len(result.get('questions', []))} MCQ questions")
                return result.get("questions", [])
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock MCQ questions.")
        return self._get_mock_mcq_questions(role)

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume and provide ATS score + feedback"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_resume_feedback()
        
        prompt = f"""Analyze this resume and provide detailed feedback:

{resume_text[:2000]}

Evaluate:
1. ATS Compatibility Score (0-100): How well will this pass Applicant Tracking Systems?
2. Strengths (3-5 specific points)
3. Weaknesses (3-5 specific issues to fix)
4. Actionable Suggestions (3-5 concrete improvements)

Return ONLY valid JSON:
{{
  "ats_score": 75,
  "strengths": ["Clear section headers", "Quantified achievements with metrics"],
  "weaknesses": ["Missing keywords for target role", "Resume exceeds 1 page"],
  "suggestions": ["Add action verbs like 'Led', 'Developed'", "Reduce to 1 page for entry-level"]
}}"""

        for model_name in self.model_names:
            try:
                print(f"🤖 Analyzing resume with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Resume analyzed - ATS Score: {result.get('ats_score', 0)}")
                return result
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock feedback.")
        return self._get_mock_resume_feedback()

    def analyze_resume_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Analyze resume PDF directly using Gemini's multimodal capabilities"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_resume_feedback()
        
        prompt = """Analyze this resume PDF thoroughly and provide detailed feedback.

You have the complete PDF - examine EVERYTHING on it including:
- All text content
- Formatting and layout
- Section organization
- Visual presentation

Provide your analysis as JSON with:
1. ATS Score (0-100): How well will this pass Applicant Tracking Systems?
2. Strengths (at least 5): Specific things done well
3. Weaknesses (at least 5): Specific issues to fix
4. Suggestions (at least 8): Detailed, actionable improvements

Return ONLY valid JSON:
{
  "ats_score": 75,
  "strengths": [
    "Detailed strength 1 with explanation",
    "Detailed strength 2 with explanation",
    "Detailed strength 3 with explanation",
    "Detailed strength 4 with explanation",
    "Detailed strength 5 with explanation"
  ],
  "weaknesses": [
    "Detailed weakness 1 with explanation",
    "Detailed weakness 2 with explanation",
    "Detailed weakness 3 with explanation",
    "Detailed weakness 4 with explanation",
    "Detailed weakness 5 with explanation"
  ],
  "suggestions": [
    "Detailed actionable suggestion 1",
    "Detailed actionable suggestion 2",
    "Detailed actionable suggestion 3",
    "Detailed actionable suggestion 4",
    "Detailed actionable suggestion 5",
    "Detailed actionable suggestion 6",
    "Detailed actionable suggestion 7",
    "Detailed actionable suggestion 8"
  ]
}

Be thorough, specific, and brutally honest. Reference actual content from the resume."""

        for model_name in self.model_names:
            try:
                print(f"🤖 Analyzing resume PDF with {model_name}...")
                model = genai.GenerativeModel(model_name)
                
                # Upload the PDF file to Gemini
                pdf_file = genai.upload_file(pdf_path, mime_type="application/pdf")
                
                # Generate content with the PDF
                response = model.generate_content([prompt, pdf_file])
                text = response.text
                
                # Clean up the uploaded file
                try:
                    pdf_file.delete()
                except:
                    pass
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Resume PDF analyzed - ATS Score: {result.get('ats_score', 0)}")
                return result
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock feedback.")
        return self._get_mock_resume_feedback()

    def generate_coding_problem(self, difficulty: str = "easy", topic: str = "arrays") -> Dict[str, Any]:
        """Generate a LeetCode-style coding problem using Gemini AI"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_coding_problem(difficulty, topic)
        
        prompt = f"""You are an expert coding interview creator. Generate a unique LeetCode-style coding problem.

REQUIREMENTS:
- Difficulty: {difficulty}
- Topic: {topic}
- Must have a clear problem statement
- Include 2-3 examples with input/output/explanation
- Include constraints (e.g., array length, value ranges)
- Provide starter code for Python and JavaScript

Return ONLY valid JSON:
{{
  "title": "Two Sum",
  "difficulty": "{difficulty}",
  "topic": "{topic}",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\\n\\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\\n\\nYou can return the answer in any order.",
  "examples": [
    {{
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }},
    {{
      "input": "nums = [3,2,4], target = 6",
      "output": "[1,2]",
      "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
    }}
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  "starter_code": {{
    "python": "def solution(nums: list, target: int) -> list:\\n    # Your code here\\n    pass",
    "javascript": "function solution(nums, target) {{\\n    // Your code here\\n}}"
  }},
  "solution_hint": "Consider using a hash map to store seen values for O(n) time complexity.",
  "test_cases": [
    {{"input": {{"nums": [2,7,11,15], "target": 9}}, "expected": [0, 1]}},
    {{"input": {{"nums": [3,2,4], "target": 6}}, "expected": [1, 2]}},
    {{"input": {{"nums": [3,3], "target": 6}}, "expected": [0, 1]}}
  ]
}}

Generate a UNIQUE problem (not Two Sum). Make it interesting and educational."""

        for model_name in self.model_names:
            try:
                print(f"🤖 Generating coding problem with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Generated problem: {result.get('title', 'Unknown')}")
                return result
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock problem.")
        return self._get_mock_coding_problem(difficulty, topic)

    def evaluate_code(self, problem: Dict[str, Any], user_code: str, language: str = "python") -> Dict[str, Any]:
        """Evaluate user's code solution using Gemini AI"""
        
        # If no model OR we've already seen a 429 earlier, use mocks
        if not self.model or self.quota_exceeded:
            return self._get_mock_evaluation()
        
        prompt = f"""You are an expert code reviewer. Evaluate this solution for the coding problem.

PROBLEM:
Title: {problem.get('title', 'Unknown')}
Description: {problem.get('description', '')}

TEST CASES:
{json.dumps(problem.get('test_cases', []), indent=2)}

USER'S CODE ({language}):
```{language}
{user_code}
```

Evaluate the code and provide feedback. Consider:
1. Correctness: Does it pass the test cases?
2. Logic: Is the approach correct?
3. Edge cases: Does it handle edge cases?
4. Efficiency: What's the time/space complexity?

Return ONLY valid JSON:
{{
  "is_correct": true,
  "passed_tests": 3,
  "total_tests": 3,
  "feedback": "Great solution! Your approach uses a hash map correctly for O(n) time complexity.",
  "suggestions": ["Consider handling edge cases where no solution exists"],
  "time_complexity": "O(n)",
  "space_complexity": "O(n)"
}}"""

        for model_name in self.model_names:
            try:
                print(f"🤖 Evaluating code with {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = response.text
                
                # Parse JSON
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    text = match.group(0)
                
                result = json.loads(text)
                print(f"✅ Evaluation complete - Correct: {result.get('is_correct', False)}")
                return result
            except Exception as e:
                msg = str(e)
                print(f"⚠️ Error with {model_name}: {msg[:100]}")
                
                # If it's a quota issue, stop trying other models
                if "429" in msg:
                    print("🚫 Gemini quota exceeded. Disabling real LLM calls for this server run.")
                    self.quota_exceeded = True
                    self.model = None
                    break
                    
                continue
        
        print("❌ All models failed. Using mock evaluation.")
        return self._get_mock_evaluation()

    def _get_mock_coding_problem(self, difficulty: str, topic: str) -> Dict[str, Any]:
        """Fallback coding problem"""
        problems = {
            "arrays": {
                "title": "Find Maximum Element",
                "difficulty": difficulty,
                "topic": topic,
                "description": "Given an array of integers, find and return the maximum element in the array.\n\nYou must implement a solution that iterates through the array once.",
                "examples": [
                    {"input": "nums = [3, 1, 4, 1, 5, 9, 2, 6]", "output": "9", "explanation": "9 is the largest number in the array."},
                    {"input": "nums = [-1, -5, -3]", "output": "-1", "explanation": "-1 is the largest among negative numbers."}
                ],
                "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
                "starter_code": {
                    "python": "def solution(nums: list) -> int:\n    # Your code here\n    pass",
                    "javascript": "function solution(nums) {\n    // Your code here\n}"
                },
                "solution_hint": "Initialize max with the first element, then compare each element.",
                "test_cases": [
                    {"input": {"nums": [3, 1, 4, 1, 5, 9, 2, 6]}, "expected": 9},
                    {"input": {"nums": [-1, -5, -3]}, "expected": -1},
                    {"input": {"nums": [42]}, "expected": 42}
                ]
            },
            "strings": {
                "title": "Reverse String",
                "difficulty": difficulty,
                "topic": topic,
                "description": "Write a function that reverses an input string.\n\nThe input is given as an array of characters. You must do this in-place with O(1) extra memory.",
                "examples": [
                    {"input": "s = ['h','e','l','l','o']", "output": "['o','l','l','e','h']", "explanation": "The string is reversed in place."},
                    {"input": "s = ['H','a','n','n','a','h']", "output": "['h','a','n','n','a','H']", "explanation": "The palindrome name is reversed."}
                ],
                "constraints": ["1 <= s.length <= 10^5", "s[i] is a printable ASCII character"],
                "starter_code": {
                    "python": "def solution(s: list) -> list:\n    # Your code here\n    pass",
                    "javascript": "function solution(s) {\n    // Your code here\n}"
                },
                "solution_hint": "Use two pointers: one at the start, one at the end.",
                "test_cases": [
                    {"input": {"s": ["h","e","l","l","o"]}, "expected": ["o","l","l","e","h"]},
                    {"input": {"s": ["a","b"]}, "expected": ["b","a"]}
                ]
            }
        }
        return problems.get(topic, problems["arrays"])

    def _get_mock_evaluation(self) -> Dict[str, Any]:
        """Fallback code evaluation"""
        return {
            "is_correct": True,
            "passed_tests": 2,
            "total_tests": 3,
            "feedback": "Your solution looks good! It handles the main test cases correctly.",
            "suggestions": ["Consider edge cases like empty arrays", "Think about optimizing for very large inputs"],
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        }

    def _get_mock_interview_questions(self, role: str) -> List[Dict[str, Any]]:
        """Fallback interview questions"""
        return [
            {
                "category": "technical",
                "question": f"What are the most important skills for a {role}?",
                "tips": "Mention both technical skills and soft skills like communication and teamwork"
            },
            {
                "category": "technical",
                "question": f"Describe a challenging project you've worked on related to {role}.",
                "tips": "Focus on the problem, your approach, and the measurable impact"
            },
            {
                "category": "technical",
                "question": "How do you stay updated with the latest technologies in your field?",
                "tips": "Mention specific resources like blogs, courses, conferences, or communities"
            },
            {
                "category": "behavioral",
                "question": "Tell me about a time when you had to learn a new technology quickly.",
                "tips": "Use STAR: Situation (deadline), Task (what to learn), Action (how you learned), Result (outcome)"
            },
            {
                "category": "behavioral",
                "question": "Describe a situation where you disagreed with a team member.",
                "tips": "Show conflict resolution skills and focus on the positive outcome"
            },
            {
                "category": "behavioral",
                "question": "Tell me about a time when you failed and what you learned from it.",
                "tips": "Be honest, show self-awareness, and emphasize the lesson learned"
            }
        ]

    def _get_mock_resume_feedback(self) -> Dict[str, Any]:
        """Fallback resume feedback"""
        return {
            "ats_score": 72,
            "strengths": [
                "Clear section organization with distinct headers",
                "Includes relevant technical skills",
                "Contact information is easy to find"
            ],
            "weaknesses": [
                "Missing quantifiable achievements and metrics",
                "Could benefit from more action verbs",
                "Some sections lack specific details"
            ],
            "suggestions": [
                "Add metrics to achievements (e.g., 'Improved performance by 30%')",
                "Use strong action verbs like 'Led', 'Developed', 'Implemented'",
                "Tailor resume keywords to match job descriptions",
                "Consider adding a brief summary or objective statement"
            ]
        }

    def _get_mock_roadmap(self, role: str, duration: int) -> Dict[str, Any]:
        """Fallback roadmap if AI fails"""
        return {
            "items": [
                {
                    "week": i + 1,
                    "title": f"Learning {role} - Week {i+1}",
                    "tasks": ["Study core concepts", "Practice coding", "Review documentation"],
                    "project": f"Mini Project {i+1}",
                    "resources": ["Official Docs", "YouTube Tutorials"]
                } for i in range(duration)
            ]
        }

    def _get_mock_mcq_questions(self, role: str) -> List[Dict[str, Any]]:
        """Fallback MCQ questions"""
        questions = [
            {
                "question": f"What is a key responsibility of a {role}?",
                "options": [
                    "Managing company finances",
                    "Writing and maintaining code",
                    "Designing marketing campaigns",
                    "Handling customer complaints"
                ],
                "correct_answer": 1,
                "explanation": "A key responsibility involves writing, testing, and maintaining code to build software solutions."
            },
            {
                "question": "What does API stand for?",
                "options": [
                    "Application Programming Interface",
                    "Advanced Program Integration",
                    "Automated Process Implementation",
                    "Application Process Interface"
                ],
                "correct_answer": 0,
                "explanation": "API stands for Application Programming Interface - a set of protocols for building software applications."
            },
            {
                "question": "Which data structure uses LIFO (Last In, First Out)?",
                "options": [
                    "Queue",
                    "Stack",
                    "Linked List",
                    "Tree"
                ],
                "correct_answer": 1,
                "explanation": "A Stack follows LIFO principle where the last element added is the first one to be removed."
            },
            {
                "question": "What is the time complexity of binary search?",
                "options": [
                    "O(n)",
                    "O(n²)",
                    "O(log n)",
                    "O(1)"
                ],
                "correct_answer": 2,
                "explanation": "Binary search has O(log n) time complexity as it halves the search space with each comparison."
            },
            {
                "question": "Which HTTP status code indicates 'Not Found'?",
                "options": [
                    "200",
                    "301",
                    "404",
                    "500"
                ],
                "correct_answer": 2,
                "explanation": "HTTP 404 means the requested resource was not found on the server."
            },
            {
                "question": "What is the purpose of version control systems like Git?",
                "options": [
                    "To compile code faster",
                    "To track changes and collaborate on code",
                    "To run automated tests",
                    "To deploy applications"
                ],
                "correct_answer": 1,
                "explanation": "Version control systems help track changes, maintain history, and enable team collaboration."
            },
            {
                "question": "What does SQL stand for?",
                "options": [
                    "Structured Query Language",
                    "Simple Question Language",
                    "System Query Logic",
                    "Sequential Query Language"
                ],
                "correct_answer": 0,
                "explanation": "SQL stands for Structured Query Language, used to manage and query relational databases."
            },
            {
                "question": "Which of these is NOT a JavaScript framework/library?",
                "options": [
                    "React",
                    "Angular",
                    "Django",
                    "Vue"
                ],
                "correct_answer": 2,
                "explanation": "Django is a Python web framework, not a JavaScript framework."
            },
            {
                "question": "What is the main purpose of CSS?",
                "options": [
                    "To add interactivity to web pages",
                    "To style and layout web pages",
                    "To store data on servers",
                    "To handle form submissions"
                ],
                "correct_answer": 1,
                "explanation": "CSS (Cascading Style Sheets) is used to style and control the visual presentation of web pages."
            },
            {
                "question": "What is a REST API?",
                "options": [
                    "A type of database",
                    "An architectural style for web services",
                    "A programming language",
                    "A testing framework"
                ],
                "correct_answer": 1,
                "explanation": "REST (Representational State Transfer) is an architectural style for designing networked applications."
            }
        ]
        return questions

