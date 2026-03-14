"""
Auto Project Builder API
Generates complete project blueprints from job descriptions
[PREMIUM FEATURE]
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
from app.services.gemini_service import GeminiService
from app.models.database import User
from app.utils.premium import require_premium

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectRequest(BaseModel):
    job_description: str
    experience_level: str  # "beginner", "intermediate", "advanced"

class TechStack(BaseModel):
    frontend: List[str]
    backend: List[str]
    database: List[str]
    tools: List[str]

class ArchitectureComponent(BaseModel):
    name: str
    description: str
    technologies: List[str]

class ERDEntity(BaseModel):
    name: str
    attributes: List[str]

class ERDRelationship(BaseModel):
    from_entity: str
    to_entity: str
    type: str  # "one-to-many", "many-to-many", etc.

class APIRoute(BaseModel):
    route: str
    method: str
    description: str
    request_body: Optional[str] = None
    response: str

class BuildWeek(BaseModel):
    week: int
    title: str
    tasks: List[str]
    deliverables: List[str]

class EvaluationCriteria(BaseModel):
    criteria: str
    points: int
    description: str

class ProjectResponse(BaseModel):
    project_title: str
    project_description: str
    why_relevant: str
    tech_stack: TechStack
    architecture_components: List[ArchitectureComponent]
    architecture_diagram: str  # Mermaid diagram
    erd_entities: List[ERDEntity]
    erd_relationships: List[ERDRelationship]
    erd_diagram: str  # Mermaid diagram
    api_routes: List[APIRoute]
    folder_structure: str
    build_guide: List[BuildWeek]
    evaluation_rubric: List[EvaluationCriteria]

def get_fallback_project():
    """Return fallback project data"""
    return ProjectResponse(
        project_title="Full Stack Task Manager",
        project_description="A modern task management application with user authentication, real-time updates, and collaborative features.",
        why_relevant="Demonstrates full-stack development skills including React, Node.js, database design, and API development.",
        tech_stack=TechStack(
            frontend=["React", "TypeScript", "TailwindCSS"],
            backend=["Node.js", "Express", "JWT"],
            database=["PostgreSQL", "Prisma ORM"],
            tools=["Docker", "Git", "VS Code"]
        ),
        architecture_components=[
            ArchitectureComponent(name="Frontend SPA", description="React single-page application", technologies=["React", "TypeScript"]),
            ArchitectureComponent(name="REST API", description="Express.js API layer", technologies=["Node.js", "Express"]),
            ArchitectureComponent(name="Database", description="PostgreSQL with Prisma ORM", technologies=["PostgreSQL", "Prisma"])
        ],
        architecture_diagram="graph TD\\n    A[React Frontend] --> B[Express API]\\n    B --> C[PostgreSQL]",
        erd_entities=[
            ERDEntity(name="User", attributes=["id", "email", "password_hash", "name", "created_at"]),
            ERDEntity(name="Task", attributes=["id", "title", "description", "status", "user_id", "due_date"]),
            ERDEntity(name="Project", attributes=["id", "name", "description", "owner_id"])
        ],
        erd_relationships=[
            ERDRelationship(from_entity="User", to_entity="Task", type="one-to-many"),
            ERDRelationship(from_entity="User", to_entity="Project", type="one-to-many"),
            ERDRelationship(from_entity="Project", to_entity="Task", type="one-to-many")
        ],
        erd_diagram="erDiagram\\n    USER ||--o{ TASK : has\\n    USER ||--o{ PROJECT : owns",
        api_routes=[
            APIRoute(route="/api/auth/register", method="POST", description="Register new user", request_body="{ email, password, name }", response="{ user, token }"),
            APIRoute(route="/api/auth/login", method="POST", description="User login", request_body="{ email, password }", response="{ user, token }"),
            APIRoute(route="/api/tasks", method="GET", description="Get user's tasks", request_body=None, response="{ tasks: Task[] }"),
            APIRoute(route="/api/tasks", method="POST", description="Create new task", request_body="{ title, description }", response="{ task }"),
            APIRoute(route="/api/projects", method="GET", description="Get user's projects", request_body=None, response="{ projects: Project[] }")
        ],
        folder_structure="src/\\n├── components/\\n├── pages/\\n├── api/\\n└── utils/",
        build_guide=[
            BuildWeek(week=1, title="Week 1: Foundation", tasks=["Set up project", "Configure database"], deliverables=["Dev environment", "Database schema"]),
            BuildWeek(week=2, title="Week 2: Authentication", tasks=["Implement JWT auth", "Create login pages"], deliverables=["Working auth flow"]),
            BuildWeek(week=3, title="Week 3: Core Features", tasks=["Build task CRUD", "Create project management"], deliverables=["Task management"]),
            BuildWeek(week=4, title="Week 4: Polish", tasks=["Add real-time updates", "Deploy to cloud"], deliverables=["Production-ready app"])
        ],
        evaluation_rubric=[
            EvaluationCriteria(criteria="Code Quality", points=25, description="Clean, readable code"),
            EvaluationCriteria(criteria="Functionality", points=30, description="All features work correctly"),
            EvaluationCriteria(criteria="UI/UX Design", points=20, description="Intuitive interface"),
            EvaluationCriteria(criteria="Database Design", points=15, description="Normalized schema"),
            EvaluationCriteria(criteria="Documentation", points=10, description="Clear README")
        ]
    )

@router.post("/generate-from-jd", response_model=ProjectResponse)
async def generate_project_from_jd(
    request: ProjectRequest,
    current_user: User = Depends(require_premium)  # Premium feature
):
    """
    Generate a complete project blueprint from a job description.
    Includes architecture, ERD, API routes, folder structure, and build guide.
    [PREMIUM FEATURE - Requires active subscription]
    """
    try:
        gemini = GeminiService()
        
        prompt = f"""You are a senior software architect. Based on this job description, generate a COMPLETE project that would perfectly demonstrate the skills required.

**JOB DESCRIPTION:**
{request.job_description}

**CANDIDATE EXPERIENCE LEVEL:** {request.experience_level}

Generate a project that:
1. Directly maps to skills in the JD
2. Is impressive enough to discuss in interviews
3. Is achievable within 2-4 weeks for a {request.experience_level} developer

Return ONLY valid JSON in this EXACT format:
{{
    "project_title": "Catchy project name",
    "project_description": "2-3 sentence description",
    "why_relevant": "Why this project matches the JD",
    "tech_stack": {{
        "frontend": ["React", "TypeScript"],
        "backend": ["Node.js", "Express"],
        "database": ["PostgreSQL"],
        "tools": ["Docker", "Git"]
    }},
    "architecture_components": [
        {{
            "name": "Component Name",
            "description": "What it does",
            "technologies": ["tech1", "tech2"]
        }}
    ],
    "architecture_diagram": "graph TD\\n    A[Frontend] --> B[API]\\n    B --> C[Database]",
    "erd_entities": [
        {{
            "name": "User",
            "attributes": ["id", "email", "name", "created_at"]
        }}
    ],
    "erd_relationships": [
        {{
            "from_entity": "User",
            "to_entity": "Post",
            "type": "one-to-many"
        }}
    ],
    "erd_diagram": "erDiagram\\n    USER ||--o{{ POST : has",
    "api_routes": [
        {{
            "route": "/api/users",
            "method": "GET",
            "description": "Get all users",
            "request_body": null,
            "response": "{{ users: User[] }}"
        }}
    ],
    "folder_structure": "src/\\n├── components/\\n├── pages/\\n├── api/\\n└── utils/",
    "build_guide": [
        {{
            "week": 1,
            "title": "Week 1: Foundation",
            "tasks": ["Set up project", "Create database schema"],
            "deliverables": ["Working dev environment", "Empty database"]
        }}
    ],
    "evaluation_rubric": [
        {{
            "criteria": "Code Quality",
            "points": 20,
            "description": "Clean, readable, well-documented code"
        }}
    ]
}}

Make the project REALISTIC and IMPRESSIVE. Include 4-6 API routes, 3-5 entities, and a 4-week build plan.
Return ONLY valid JSON, no markdown or explanation."""

        response = gemini.generate(prompt)
        
        # Clean up response
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        
        result = json.loads(cleaned.strip())
        
        return ProjectResponse(
            project_title=result.get("project_title", "Portfolio Project"),
            project_description=result.get("project_description", ""),
            why_relevant=result.get("why_relevant", ""),
            tech_stack=TechStack(**result.get("tech_stack", {"frontend": [], "backend": [], "database": [], "tools": []})),
            architecture_components=[ArchitectureComponent(**c) for c in result.get("architecture_components", [])],
            architecture_diagram=result.get("architecture_diagram", ""),
            erd_entities=[ERDEntity(**e) for e in result.get("erd_entities", [])],
            erd_relationships=[ERDRelationship(**r) for r in result.get("erd_relationships", [])],
            erd_diagram=result.get("erd_diagram", ""),
            api_routes=[APIRoute(**r) for r in result.get("api_routes", [])],
            folder_structure=result.get("folder_structure", ""),
            build_guide=[BuildWeek(**w) for w in result.get("build_guide", [])],
            evaluation_rubric=[EvaluationCriteria(**e) for e in result.get("evaluation_rubric", [])]
        )
        
    except Exception as e:
        print(f"❌ Error in project generation: {e}")
        return get_fallback_project()
