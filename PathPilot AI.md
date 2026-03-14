# Product Requirements Document (PRD)
## PathPilot AI: AI-Powered Career & Skill Development Platform

**Version:** 2.0  
**Date:** December 2025  
**Project Type:** 8th Semester Major Project  
**Document Owner:** [Your Name/Team]

---

## Executive Summary

PathPilot AI is an intelligent career guidance platform that transforms the fragmented job preparation experience into a structured, personalized journey. Unlike generic career advice tools, PathPilot AI combines resume analysis, skill-gap detection, and AI-powered roadmap generation to provide actionable, week-by-week guidance for students and early career professionals.

**Key Value Proposition:** We don't just tell you what to learn—we show you how, when, and track your progress every step of the way.

---

## 1. Problem Statement

### Current Pain Points

**For Students:**
- Overwhelmed by scattered career advice from multiple sources (YouTube, Reddit, seniors, placement cells)
- Generic "learn X technology" recommendations without understanding their current skill level
- No clarity on which skills are actually required for target roles
- Difficulty tracking progress across multiple learning resources
- Weak resumes that fail ATS screening and don't showcase skills effectively
- Inadequate interview preparation tailored to specific roles

**For Educational Institutions:**
- Limited visibility into student career readiness
- Difficulty providing personalized guidance at scale
- No systematic way to track skill development progress
- Challenge in connecting curriculum to industry requirements

### Market Gap

Existing solutions fall short:
- **ChatGPT/Generic AI:** Provides one-off advice without tracking or personalization
- **LinkedIn Learning/Coursera:** Offers courses but no career path intelligence
- **Career counselors:** Limited availability, not scalable, often outdated knowledge
- **Placement prep platforms:** Focus only on interview prep, miss holistic skill development

### Our Solution

An integrated platform that:
1. Analyzes current skill profile through resume parsing and assessment
2. Maps skills to industry-relevant career paths using intelligent matching
3. Generates personalized, time-bound learning roadmaps (30/60/90 days)
4. Tracks weekly progress with adaptive recommendations
5. Provides continuous AI mentorship for resume, projects, and interviews

---

## 2. Target Users & Personas

### Primary: Engineering/CS Students (75% of users)

**Persona 1: "Confused Sophomore"**
- **Profile:** 2nd year CS student, knows basics but unsure of specialization
- **Pain Points:** Too many options (web dev, ML, mobile, cloud), no clear path
- **Goals:** Identify strengths, choose a domain, build relevant skills
- **Success Metric:** Completes first 30-day roadmap, lands internship

**Persona 2: "Final Year Hustler"**
- **Profile:** 4th year, placement season approaching, skill gaps visible
- **Pain Points:** Resume rejected by ATS, unprepared for technical rounds
- **Goals:** Fast-track learning, portfolio projects, interview readiness
- **Success Metric:** Improves resume score 60→85%, passes 3+ interview rounds

### Secondary: Fresh Graduates (15% of users)

**Persona 3: "Job Seeker"**
- **Profile:** Recently graduated, 0-1 years experience, struggling in job market
- **Pain Points:** Degree doesn't match industry needs, stale portfolio
- **Goals:** Upskill quickly, transition to in-demand roles
- **Success Metric:** Receives 5+ interview calls within 60 days

### Tertiary: Educational Institutions (10% of users)

**Persona 4: "Placement Coordinator"**
- **Profile:** College placement officer managing 200+ students
- **Pain Points:** Cannot provide personalized guidance, limited tracking
- **Goals:** Improve overall placement percentage, identify at-risk students
- **Success Metric:** 20% increase in placed students, 30% higher average package

---

## 3. Objectives & Success Criteria

### Business Objectives

| Objective | Key Result | Timeline |
|-----------|------------|----------|
| User Acquisition | 200+ active users from pilot college | Month 1-2 |
| Engagement | 60% weekly active user rate | Month 2-3 |
| Value Delivery | 100+ complete roadmaps generated | Month 2-4 |
| Institutional Adoption | 2+ college partnerships | Month 3-6 |
| Placement Impact | 15+ users report successful placements | Month 4-6 |

### Technical Objectives

- **Resume Parsing Accuracy:** ≥90% skill extraction accuracy
- **Response Time:** Roadmap generation <8 seconds, dashboard loads <2 seconds
- **AI Quality:** 85%+ user satisfaction with AI recommendations (measured via feedback)
- **System Uptime:** 99% availability during critical placement months
- **Data Security:** Zero data breaches, GDPR-compliant data handling

### Learning Objectives (for Project Evaluation)

- Demonstrate full-stack development proficiency
- Implement production-grade LLM integration
- Design scalable system architecture
- Apply software engineering best practices (testing, CI/CD, documentation)
- Conduct user research and validate problem-solution fit

---

## 4. Core Features (MVP - Phase 1)

### 4.1 User Onboarding & Profile Creation

**Feature Description:**
Streamlined signup process that captures essential information without overwhelming the user.

**User Stories:**
- As a new user, I want to create an account quickly so I can start receiving guidance
- As a student, I want to indicate my interests and current skills so recommendations are relevant

**Functional Requirements:**
- Email/Google OAuth authentication
- Basic profile form: Name, College, Year, Branch, Current CGPA (optional)
- Skills self-assessment: Select from predefined list + custom additions
- Interest areas: Multi-select from domains (Web Dev, AI/ML, Cloud, Mobile, etc.)
- Optional: Current job search status (actively looking, open, not now)

**Acceptance Criteria:**
- User can complete signup in <2 minutes
- Profile data stored securely in database
- Validation for required fields
- Email verification flow

**Priority:** P0 (Must Have)

---

### 4.2 Resume Upload & Intelligent Parsing

**Feature Description:**
AI-powered resume analysis that extracts skills, experience, projects, and identifies gaps.

**User Stories:**
- As a user, I want to upload my resume so the system understands my background
- As a student, I want to know what's missing from my resume so I can improve it

**Functional Requirements:**

**Input:**
- Support PDF, DOCX formats (max 5MB)
- Drag-drop or file picker UI

**Processing:**
- Extract text using pdfplumber/PyMuPDF
- Parse structured data:
  - Contact information
  - Education (degree, institution, graduation year, CGPA)
  - Technical skills (programming languages, frameworks, tools)
  - Projects (title, description, technologies used, links)
  - Work experience (company, role, duration, responsibilities)
  - Certifications, achievements, extracurriculars

**Analysis:**
- Skill categorization (frontend, backend, database, cloud, etc.)
- Experience level inference (beginner/intermediate/advanced per skill)
- Resume completeness score (0-100%)
- Missing sections detection (e.g., "No projects found", "Skills section weak")

**Output:**
- Structured JSON with extracted data
- Visual resume score card
- Specific improvement suggestions (e.g., "Add quantifiable achievements", "Include GitHub links")

**Technical Implementation:**
```python
# Example parsing pipeline
resume_text = extract_text(pdf_file)
skills = extract_skills(resume_text, skill_database)
experience = extract_experience(resume_text)
score = calculate_resume_score(skills, experience, projects)
suggestions = generate_improvements(score, missing_sections)
```

**Acceptance Criteria:**
- 90%+ accuracy in skill extraction (validated against test set of 50 resumes)
- Processing completes in <5 seconds
- Clear error handling for corrupted/unsupported files
- Resume data stored with user consent only

**Priority:** P0 (Must Have)

---

### 4.3 Career Role Recommendation Engine

**Feature Description:**
Intelligent matching system that suggests 3-5 career paths based on skills, interests, and market demand.

**User Stories:**
- As a confused student, I want to see which roles match my profile so I can make informed decisions
- As a user, I want to understand why a role is recommended so I can evaluate it

**Functional Requirements:**

**Input Data:**
- Extracted skills from resume
- Self-reported interests
- Academic background (branch, CGPA)
- Optional: Target industry preference

**Recommendation Logic (Hybrid Approach):**

**1. Rule-Based Scoring (60% weight):**
```
For each role:
  score = 0
  for required_skill in role.required_skills:
    if required_skill in user.skills:
      score += skill_importance_weight
  
  for interest in user.interests:
    if interest matches role.domain:
      score += interest_bonus
  
  score *= market_demand_multiplier[role]
```

**2. Similarity Matching (40% weight):**
- Cosine similarity between user skill vector and role requirement vector
- Embeddings using sentence-transformers

**Role Database Structure:**
```json
{
  "role_id": "swe_backend",
  "title": "Backend Software Engineer",
  "required_skills": ["Python", "REST APIs", "SQL", "Docker"],
  "preferred_skills": ["AWS", "Redis", "GraphQL"],
  "typical_projects": ["API development", "Microservices"],
  "market_demand": "high",
  "avg_fresher_salary": "6-10 LPA",
  "growth_trajectory": "SDE-2 → Senior → Lead → Architect"
}
```

**Output:**
- Top 5 recommended roles with match percentage (60-95%)
- For each role:
  - Why it matches (specific skills alignment)
  - What's missing (skill gaps)
  - Industry outlook & salary range
  - Typical day-to-day responsibilities

**Acceptance Criteria:**
- Recommendations generated in <3 seconds
- At least 2 roles with >70% match for 90% of users
- User can select one primary + one secondary role to pursue
- Transparent explanation for each recommendation

**Priority:** P0 (Must Have)

---

### 4.4 Skill Gap Analysis Engine

**Feature Description:**
Identifies precise skill deficiencies by comparing user profile against industry role requirements.

**User Stories:**
- As a user who selected "Full Stack Developer", I want to see exactly which skills I'm missing
- As a student, I want to know which skills are critical vs nice-to-have

**Functional Requirements:**

**Analysis Process:**
1. Load selected role's skill requirements (from role database)
2. Match against user's current skills (from resume + self-assessment)
3. Categorize gaps:
   - **Critical Gaps:** Must-have skills for role (high priority)
   - **Recommended Gaps:** Commonly expected skills (medium priority)
   - **Nice-to-Have:** Differentiating skills (low priority)

**Gap Prioritization Logic:**
```python
for skill in role.required_skills:
  if skill not in user.skills:
    gap_priority = calculate_priority(
      skill_importance=role.skill_weights[skill],
      market_demand=skill_demand_data[skill],
      learning_time=estimated_hours[skill]
    )
    gaps.append({
      'skill': skill,
      'priority': gap_priority,
      'estimated_learning_time': '2-4 weeks'
    })
```

**Output Format:**
```
Critical Gaps (Must Learn):
✗ Docker & Containerization
✗ RESTful API Design
✗ SQL & Database Design

Recommended Gaps:
⚠ AWS/Cloud Basics
⚠ Git Advanced Workflows

Strengths (Already Have):
✓ Python Programming
✓ Data Structures & Algorithms
✓ Problem Solving
```

**Acceptance Criteria:**
- Gap analysis completes in <2 seconds
- Gaps sorted by priority score
- Each gap includes estimated learning time
- Visual progress bar showing completion %

**Priority:** P0 (Must Have)

---

### 4.5 AI-Powered Learning Roadmap Generator

**Feature Description:**
LLM-generated personalized learning plan broken into weekly milestones with specific resources and tasks.

**User Stories:**
- As a user with skill gaps, I want a step-by-step plan so I know what to learn and when
- As a student, I want weekly tasks that fit my schedule (10-15 hours/week commitment)

**Functional Requirements:**

**Input to LLM:**
```json
{
  "user_profile": {
    "current_skills": ["Python", "DSA basics"],
    "target_role": "Backend Engineer",
    "skill_gaps": ["Docker", "REST APIs", "PostgreSQL"],
    "time_commitment": "10-15 hours/week",
    "timeline": "60 days",
    "learning_style": "project-based"
  }
}
```

**LLM Prompt Engineering:**
```
You are PathPilot AI, an expert career mentor. Generate a structured 60-day learning roadmap for a student aiming to become a Backend Engineer.

User Context:
- Current Skills: {skills}
- Skill Gaps: {gaps}
- Time Available: {hours} hours/week
- Learning Preference: {style}

Requirements:
1. Break down into 8 weekly milestones
2. Each week should have:
   - 1 primary learning objective
   - 3-4 specific tasks (tutorials, projects, practice)
   - 2-3 curated resources (courses, docs, articles)
   - 1 hands-on mini-project
3. Ensure progressive difficulty
4. Include checkpoints for self-assessment
5. Format as structured JSON

Output Format:
{
  "roadmap_id": "...",
  "weeks": [
    {
      "week_number": 1,
      "theme": "Docker Fundamentals",
      "objective": "...",
      "tasks": [...],
      "resources": [...],
      "project": "...",
      "time_estimate": "12 hours"
    }
  ]
}
```

**LLM Selection:**
- Primary: Claude 3.5 Sonnet (better structured output)
- Fallback: GPT-4 Turbo
- Budget option: Local Llama 3 8B (for cost control)

**Post-Processing:**
- Parse LLM JSON output
- Validate structure (ensure all required fields present)
- Store roadmap in database linked to user
- Generate unique roadmap_id for tracking

**Output UI:**
- Timeline view showing 8-12 weeks
- Each week expandable to show:
  - Week theme (e.g., "Week 3: Building REST APIs")
  - Learning objectives
  - Task checklist (checkboxes for completion)
  - Resource links (with icons: 📹 video, 📄 article, 💻 hands-on)
  - Mini-project description with expected outcome

**Acceptance Criteria:**
- Roadmap generation completes in <8 seconds (including LLM call)
- Output is coherent and follows logical skill progression
- Each week has 3-5 actionable tasks
- Resources are real, accessible, and relevant (validated via link checker)
- 85%+ users rate roadmap quality as "helpful" or "very helpful"

**Priority:** P0 (Must Have)

---

### 4.6 Progress Tracking & Task Management

**Feature Description:**
Interactive dashboard for users to track roadmap completion, maintain learning streaks, and visualize growth.

**User Stories:**
- As a user following a roadmap, I want to check off completed tasks so I stay motivated
- As a student, I want to see my progress over time so I know I'm improving

**Functional Requirements:**

**Dashboard Components:**

**1. Progress Overview:**
- Overall completion percentage (e.g., "45% complete")
- Current week indicator
- Days until roadmap completion
- Learning streak (consecutive days active)

**2. Weekly Task List:**
- Checkbox for each task
- Task description + estimated time
- Status indicators (Not Started, In Progress, Completed)
- Links to resources inline

**3. Completed Milestones:**
- Visual timeline with checkmarks
- Completed projects showcase
- Skills acquired badge collection

**4. Engagement Metrics:**
- Total hours logged
- Tasks completed this week
- Streak calendar (GitHub-style contribution graph)

**Data Model:**
```python
# Progress tracking
{
  "user_id": "...",
  "roadmap_id": "...",
  "completed_tasks": ["task_1_1", "task_1_2"],
  "in_progress_tasks": ["task_2_1"],
  "weekly_logs": [
    {
      "week": 1,
      "hours_spent": 14,
      "tasks_completed": 4,
      "notes": "Completed Docker basics, struggled with networking"
    }
  ],
  "last_active": "2025-12-06"
}
```

**Gamification Elements (Light):**
- 🔥 Streak counter (motivates daily engagement)
- 🏆 Milestone badges (Week 1 Complete, 50% Progress, etc.)
- 📊 Skill XP bar (fills as tasks completed in that skill area)

**Acceptance Criteria:**
- Task state persists across sessions
- Progress updates in real-time (no page refresh needed)
- Dashboard loads in <2 seconds
- Mobile-responsive design for on-the-go tracking
- Export progress report as PDF

**Priority:** P0 (Must Have)

---

### 4.7 Resource Recommendation System

**Feature Description:**
Curated learning resources (courses, tutorials, projects, books) tailored to each skill gap.

**User Stories:**
- As a user learning Docker, I want recommended tutorials so I don't waste time searching
- As a student, I want project ideas that apply what I'm learning

**Functional Requirements:**

**Resource Database Structure:**
```json
{
  "resource_id": "docker_crash_course",
  "title": "Docker Crash Course for Beginners",
  "type": "video",
  "platform": "YouTube",
  "author": "TechWorld with Nana",
  "duration": "3h 12m",
  "difficulty": "beginner",
  "tags": ["docker", "containers", "devops"],
  "rating": 4.8,
  "url": "...",
  "last_verified": "2025-11-01"
}
```

**Resource Types:**
- 📹 Video Tutorials (YouTube, Udemy)
- 📄 Documentation & Articles (official docs, Medium, Dev.to)
- 💻 Interactive Platforms (Codecademy, freeCodeCamp)
- 📚 Books & eBooks
- 🛠️ Practice Problems (LeetCode, HackerRank)
- 🎯 Project Ideas (with GitHub templates)

**Recommendation Logic:**
1. **Skill-Based Filtering:** Match resources to current week's skills
2. **Difficulty Alignment:** Beginner → Intermediate → Advanced progression
3. **Quality Scoring:** Prioritize high-rated, recently updated resources
4. **Diversity:** Mix video, text, hands-on for different learning styles

**Smart Features:**
- "Already completed?" button to dismiss and suggest alternatives
- "Too advanced?" feedback to adjust difficulty
- Bookmark favorite resources for later
- Track which resources were most helpful (data for improving recs)

**Project Suggestion Engine:**
For each skill, suggest 2-3 hands-on projects:
```
Learning Docker?
→ Project 1: Containerize a Simple Flask App
→ Project 2: Multi-Container App with Docker Compose
→ Project 3: Deploy Dockerized App to AWS ECS
```

**Acceptance Criteria:**
- Each skill gap has ≥3 recommended resources
- Resources are functional (broken links flagged)
- Users can rate resources (👍/👎)
- Top-rated resources bubble to top
- New resources added monthly via admin panel

**Priority:** P0 (Must Have)

---

### 4.8 AI Interview Preparation

**Feature Description:**
Personalized technical interview questions generated by LLM based on user's target role and skill level.

**User Stories:**
- As a user preparing for interviews, I want practice questions so I can test my knowledge
- As a student, I want explanations for answers so I can learn from mistakes

**Functional Requirements:**

**Question Generation:**

**Input:**
- Target role (e.g., "Backend Engineer")
- Skills to focus on (e.g., ["REST APIs", "SQL"])
- Difficulty level (Easy/Medium/Hard)
- Number of questions (5-20)

**LLM Prompt:**
```
Generate 10 technical interview questions for a Backend Engineer role.

Focus Areas: REST API Design, SQL Optimization, Docker
Difficulty: Medium
Format: Mix of conceptual questions (40%), coding problems (40%), system design (20%)

For each question include:
1. The question
2. Key concepts being tested
3. Expected answer outline (don't give away complete answer)
4. Follow-up questions

Output as JSON array.
```

**Question Types:**
- **Conceptual:** "Explain the difference between PUT and PATCH in REST APIs"
- **Coding:** "Write a SQL query to find the 2nd highest salary"
- **System Design:** "Design a URL shortener service"
- **Behavioral:** "Describe a time you debugged a production issue"

**Interactive Features:**
- Timed practice mode (simulate real interview pressure)
- Voice answer recording (for soft skills practice)
- AI feedback on text answers (correctness, clarity, depth)
- Hint system (reveals answer progressively)

**Answer Evaluation (Basic MVP):**
- Keyword matching for conceptual questions
- Code execution for coding problems (using Judge0 API)
- Manual self-assessment for open-ended questions

**Acceptance Criteria:**
- Generate 10 questions in <5 seconds
- Questions are relevant to specified role and skills
- At least 80% of questions are unique (not repetitive)
- Users can save favorite questions for review
- Performance tracked over time (% correct)

**Priority:** P1 (Should Have - can be launched post-MVP if needed)

---

## 5. Advanced Features (Phase 2 - Future Scope)

### 5.1 ATS Resume Scoring & Rewrite Engine

**Description:** Analyze resume against ATS requirements, provide numeric score (0-100), and AI-generated rewrite suggestions.

**Key Capabilities:**
- Keyword density analysis (match against job descriptions)
- Formatting check (bullet points, action verbs, quantifiable results)
- Section completeness (Skills, Projects, Experience)
- One-click apply rewrite suggestions

**Value:** Increases job application success rate by 40-60%

---

### 5.2 GitHub Profile Analyzer

**Description:** Deep analysis of user's GitHub activity to assess code quality, consistency, project depth.

**Metrics Evaluated:**
- Commit frequency and consistency
- Code contribution patterns (frontend vs backend)
- Project complexity (lines of code, language diversity)
- Collaboration (PRs, issues, code reviews)
- Documentation quality (README scores)

**Output:** GitHub strength score + suggestions (e.g., "Contribute to 2-3 open source projects")

---

### 5.3 Portfolio Project Generator

**Description:** AI generates complete project ideas with:
- Project description and features
- Tech stack recommendation
- Step-by-step implementation guide
- Starter code templates
- Deployment checklist

**Example Output:**
```
Project: Real-Time Collaboration Tool
Tech Stack: React, Node.js, Socket.io, MongoDB
Features: Live document editing, user presence, chat
Difficulty: Intermediate
Estimated Time: 3-4 weeks
Learning Outcomes: WebSockets, real-time sync, authentication
```

---

### 5.4 Institutional Admin Dashboard

**Description:** Panel for colleges/placement coordinators to:
- View aggregated student skill data
- Filter students by role readiness
- Track placement preparation progress
- Generate reports for accreditation
- Send targeted resources to specific groups

**Value:** Helps institutions improve placement rates systematically

---

### 5.5 Gamification & Social Features

**Elements:**
- Weekly challenges (e.g., "Complete 5 coding problems this week")
- Leaderboards (college-specific, privacy-respecting)
- Skill badges (Docker Novice → Expert)
- Study groups/peer matching
- Achievement sharing (LinkedIn integration)

**Goal:** Increase engagement and retention by 30%+

---

### 5.6 Long-Term AI Career Mentor Chatbot

**Description:** Persistent conversational AI that:
- Answers career questions ("Should I learn Go or Rust?")
- Provides motivation during learning slumps
- Adjusts roadmap dynamically based on progress
- Suggests industry trends and emerging skills
- Remembers user context across conversations

**Technical:** RAG (Retrieval Augmented Generation) with user profile as context

---

### 5.7 Semantic Resource Search

**Description:** Natural language search for resources
- Query: "Best way to learn system design for beginners"
- Backend: Sentence embeddings + vector similarity search
- Returns: Top 10 most relevant resources with match score

**Tech:** Pinecone/Weaviate vector DB + OpenAI embeddings

---

## 6. User Flows & Journey Maps

### Primary Flow: First-Time User Journey

```
1. Landing Page
   ↓ [Sign Up CTA]
2. Create Account (Email/Google OAuth)
   ↓
3. Profile Setup
   ├─ Enter basic details
   ├─ Select skills (optional)
   └─ Choose interests
   ↓
4. Resume Upload
   ├─ Drag & drop PDF/DOCX
   └─ [Skip for now option]
   ↓
5. Processing (Loading animation)
   ├─ Parsing resume
   ├─ Extracting skills
   └─ Analyzing gaps
   ↓
6. Resume Insights Dashboard
   ├─ Resume score: 67/100
   ├─ Extracted skills displayed
   ├─ Missing sections highlighted
   └─ [Continue to Career Recommendations]
   ↓
7. Career Role Recommendations
   ├─ Top 5 roles with match %
   ├─ Expandable details per role
   └─ [Select Primary Role]
   ↓
8. Skill Gap Analysis
   ├─ Critical gaps listed
   ├─ Estimated learning time
   └─ [Generate Roadmap]
   ↓
9. Roadmap Generation (LLM processing)
   └─ ~8 second wait
   ↓
10. Personalized Roadmap Display
    ├─ 60-day timeline view
    ├─ Weekly breakdown
    ├─ Task checklists
    └─ [Start Week 1]
    ↓
11. Progress Dashboard (Home)
    ├─ Current week tasks
    ├─ Progress metrics
    ├─ Streak counter
    └─ [Daily engagement]
```

**Time to Value:** <5 minutes from signup to actionable roadmap

---

### Secondary Flow: Returning User (Weekly Check-in)

```
1. Login
   ↓
2. Dashboard (Home)
   ├─ Streak: 🔥 7 days
   ├─ This week: 60% complete
   └─ Next task: "Complete Docker Compose tutorial"
   ↓
3. Mark Task Complete ✓
   ├─ Checkbox clicked
   ├─ Celebration micro-animation
   └─ Progress bar updates
   ↓
4. View Resources for Current Task
   ├─ Recommended tutorial links
   ├─ Project template
   └─ [Open in new tab]
   ↓
5. End of Week
   ├─ Weekly summary popup
   ├─ Achievements unlocked
   └─ [Proceed to Week 2]
   ↓
6. Continuous engagement loop
```

---

## 7. LLM Integration Architecture

### Use Cases Summary

| Use Case | LLM Model | Input | Output | Latency Target |
|----------|-----------|-------|--------|----------------|
| Roadmap Generation | Claude 3.5 Sonnet | Skills, gaps, preferences | Structured weekly plan | <8s |
| Resume Feedback | GPT-4 Turbo | Resume text, role | Improvement suggestions | <6s |
| Interview Q Generator | Claude 3.5 Sonnet | Role, skills, difficulty | 10-20 questions | <5s |
| Project Ideas | GPT-4 Turbo | Skill gaps, interests | 3-5 project proposals | <5s |
| Chatbot Mentor | GPT-4o mini | User query + context | Conversational response | <3s |

### Prompt Engineering Best Practices

**Principles:**
1. **Structured Output:** Always specify JSON format for parseable responses
2. **Context Injection:** Include user profile, progress state in every prompt
3. **Few-Shot Examples:** Provide 2-3 examples of expected output format
4. **Safety Guardrails:** Explicit instructions to avoid harmful/incorrect advice
5. **Fallback Handling:** Detect if LLM fails to follow format, retry with simplified prompt

**Example Prompt Template:**
```python
def generate_roadmap_prompt(user_data):
    return f"""
    You are PathPilot AI, an expert career mentor specializing in technical skill development.
    
    **User Context:**
    - Current Role: Student (Year 3, Computer Science)
    - Target Role: {user_data.target_role}
    - Current Skills: {', '.join(user_data.skills)}
    - Skill Gaps: {', '.join(user_data.gaps)}
    - Time Commitment: {user_data.hours_per_week} hours/week
    - Timeline: {user_data.days} days
    
    **Task:**
    Generate a structured, week-by-week learning roadmap that is:
    - Realistic for a student's schedule
    - Focused on closing skill gaps progressively
    - Includes hands-on projects for portfolio building
    - Balances theory and practice (60% hands-on)
    
    **Output Format (JSON):**
    {{
      "roadmap_title": "...",
      "total_weeks": 8,
      "weeks": [
        {{
          "week_number": 1,
          "theme": "...",
          "learning_objectives": ["...", "..."],
          "tasks": [
            {{"task_id": "1_1", "description": "...", "type": "tutorial", "estimated_hours": 3}},
            ...
          ],
          "resources": [
            {{"title": "...", "url": "...", "type": "video"}},
            ...
          ],
          "project": {{"title": "...", "description": "...", "skills_applied": ["..."]}},
          "checkpoint": "Quiz yourself: Can you explain...?"
        }},
        ...
      ]
    }}
    
    **Example Week:**
    {{
      "week_number": 1,
      "theme": "Git & Version Control Fundamentals",
      "learning_objectives": ["Understand Git workflow", "Master basic commands", "Collaborate on GitHub"],
      "tasks": [
        {{"task_id": "1_1", "description": "Complete 'Git & GitHub for Beginners' tutorial", "type": "video", "estimated_hours": 2}},
        {{"task_id": "1_2", "description": "Practice: Create a repo, make 10 commits with meaningful messages", "type": "hands-on", "estimated_hours": 1}},
        {{"task_id": "1_3", "description": "Read: Understanding branches and merging", "type": "article", "estimated_hours": 1}}
      ],
      "resources": [
        {{"title": "Git Tutorial by Traversy Media", "url": "https://youtube.com/...", "type": "video"}},
        {{"title": "Git Cheat Sheet", "url": "https://education.github.com/git-cheat-sheet", "type": "reference"}}
      ],
      "project": {{"title": "Version Control Your First Project", "description": "Take an existing codebase and add Git version control, create branches for features", "skills_applied": ["git", "github", "collaboration"]}},
      "checkpoint": "Can you explain the difference between git pull and git fetch?"
    }}
    
    Generate the complete roadmap now:
    """
```

### Error Handling & Fallbacks

**Scenario 1: LLM Returns Invalid JSON**
```python
try:
    roadmap = json.loads(llm_response)
except JSONDecodeError:
    # Attempt to extract JSON from markdown code blocks
    roadmap = extract_json_from_markdown(llm_response)
    if not roadmap:
        # Fallback: Use template-based roadmap
        roadmap = generate_template_roadmap(user_data)
        log_error("LLM returned invalid JSON", llm_response)
```

**Scenario 2: LLM Service Unavailable**
- Retry with exponential backoff (3 attempts)
- Switch to backup LLM provider
- Ultimate fallback: Rule-based roadmap template

**Scenario 3: LLM Gives Inappropriate Advice**
- Content moderation filter on outputs
- Blacklist dangerous commands/recommendations
- Manual review queue for flagged responses

---

## 8. Technical Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │   Web App   │  │  Mobile PWA │  │  Admin Panel │   │
│  │  (React)    │  │   (React)   │  │   (React)    │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
└────────────┬────────────────────────────────┬──────────┘
             │                                │
             │         HTTPS / REST API       │
             │                                │
┌────────────▼────────────────────────────────▼──────────┐
│                   API Gateway / Load Balancer          │
│                       (Nginx / AWS ALB)                │
└────────────┬───────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│                   Backend Services Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │   User       │  │   Roadmap    │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Resume     │  │  Skill Gap   │  │  Progress    │  │
│  │   Parser     │  │  Analyzer    │  │  Tracker     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Resource   │  │  Interview   │                    │
│  │   Recommender│  │  Generator   │                    │
│  └──────────────┘  └──────────────┘                    │
│               Django REST / Node + Express              │
└────────────┬───────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │ PostgreSQL  │  │    Redis    │  │   AWS S3     │   │
│  │  (Primary)  │  │   (Cache)   │  │  (Resume     │   │
│  │             │  │             │  │   Storage)   │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Claude API  │  │   OpenAI     │  │   Judge0     │  │
│  │   (LLM)      │  │   (LLM)      │  │ (Code Exec)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │    Email     │  │   Analytics  │                    │
│  │  (SendGrid)  │  │ (Mixpanel)   │                    │
│  └──────────────┘  └──────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack (Detailed)

**Frontend:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (faster than Create React App)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand (lightweight, simpler than Redux)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Routing:** React Router v6
- **Charts:** Recharts for progress visualization

**Backend:**
- **Primary Option:** Django 4.2 + Django REST Framework
  - Pros: Batteries-included, great ORM, admin panel, extensive packages
  - Cons: Slightly heavier than Node
- **Alternative Option:** Node.js + Express + TypeScript
  - Pros: JavaScript everywhere, lighter weight, great async handling
  - Cons: More manual setup

**Database:**
- **Primary:** PostgreSQL 15
  - JSON fields for flexible schema (roadmap data)
  - Full-text search for resource matching
  - Robust ACID compliance
- **Caching:** Redis 7
  - Session management
  - LLM response caching (reduce API costs)
  - Rate limiting

**AI/LLM:**
- **Primary:** Anthropic Claude 3.5 Sonnet (best structured outputs)
- **Secondary:** OpenAI GPT-4 Turbo (fallback)
- **Budget:** Llama 3 8B via Ollama (self-hosted for development)
- **Embeddings:** OpenAI text-embedding-3-small (for semantic search Phase 2)

**Resume Parsing:**
- **Library:** pdfplumber (Python) for PDF extraction
- **NLP:** spaCy for entity recognition (skills, dates, etc.)
- **Alternative:** Gemini API (supports native PDF parsing)

**File Storage:**
- **Development:** Local filesystem
- **Production:** AWS S3 / Cloudflare R2 (cheaper egress)

**Authentication:**
- **Method:** JWT tokens (access + refresh)
- **Social Auth:** Google OAuth 2.0
- **Library:** Django Rest Framework SimpleJWT / Passport.js

**DevOps & Deployment:**
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting Options:**
  - **Budget:** Render.com (free tier), Railway
  - **Scalable:** AWS (EC2 + RDS), DigitalOcean
  - **Frontend:** Vercel / Netlify (auto-deploy from GitHub)
- **Monitoring:** Sentry (error tracking), Uptime Robot (availability)

**Code Quality:**
- **Linting:** ESLint (frontend), Pylint/Flake8 (backend)
- **Formatting:** Prettier (frontend), Black (backend)
- **Testing:**
  - Frontend: Vitest + React Testing Library
  - Backend: pytest + factory_boy
  - E2E: Playwright (optional)

---

## 9. Data Models & Database Schema

### Core Entities

**1. User**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    profile_picture_url TEXT,
    
    -- Profile data
    college VARCHAR(255),
    branch VARCHAR(100),
    graduation_year INTEGER,
    cgpa DECIMAL(3,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Settings
    onboarding_complete BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB
);
```

**2. Resume**
```sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- File metadata
    filename VARCHAR(255),
    file_size INTEGER,
    s3_key TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    -- Parsed data
    raw_text TEXT,
    parsed_data JSONB, -- Structured extraction
    
    -- Analysis
    resume_score INTEGER, -- 0-100
    completeness_metrics JSONB,
    
    -- Status
    parsing_status VARCHAR(50), -- 'pending', 'completed', 'failed'
    error_message TEXT
);
```

**3. Skills**
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'frontend', 'backend', 'database', 'cloud', etc.
    aliases TEXT[], -- ['React', 'ReactJS', 'React.js']
    market_demand VARCHAR(20), -- 'high', 'medium', 'low'
    learning_difficulty VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    avg_learning_hours INTEGER
);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    source VARCHAR(50), -- 'resume', 'self_assessed', 'verified'
    acquired_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);
```

**4. Career Roles**
```sql
CREATE TABLE career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Software Engineering', 'Data Science', etc.
    description TEXT,
    
    -- Requirements
    required_skills UUID[], -- Array of skill IDs
    preferred_skills UUID[],
    min_education VARCHAR(50),
    typical_experience_years INTEGER,
    
    -- Market data
    market_demand VARCHAR(20),
    avg_fresher_salary_min INTEGER,
    avg_fresher_salary_max INTEGER,
    growth_trajectory TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**5. Roadmaps**
```sql
CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configuration
    target_role_id UUID REFERENCES career_roles(id),
    timeline_days INTEGER,
    hours_per_week INTEGER,
    
    -- Generated content (from LLM)
    roadmap_data JSONB, -- Full weekly structure
    
    -- Metadata
    generated_at TIMESTAMP DEFAULT NOW(),
    llm_model VARCHAR(100), -- 'claude-3-5-sonnet-20241022'
    generation_time_ms INTEGER,
    
    -- Status
    status VARCHAR(50), -- 'active', 'completed', 'abandoned'
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

**6. Tasks & Progress**
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    
    -- Task details
    week_number INTEGER,
    task_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- 'tutorial', 'project', 'reading', 'practice'
    estimated_hours INTEGER,
    
    -- Associated resources
    resource_links JSONB[], -- [{url, title, type}]
    
    -- Ordering
    display_order INTEGER
);

CREATE TABLE task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    
    status VARCHAR(50), -- 'not_started', 'in_progress', 'completed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- User notes
    notes TEXT,
    hours_spent INTEGER,
    
    UNIQUE(user_id, task_id)
);
```

**7. Resources**
```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Resource details
    title VARCHAR(500) NOT NULL,
    url TEXT UNIQUE NOT NULL,
    resource_type VARCHAR(50), -- 'video', 'article', 'course', 'book', 'interactive'
    platform VARCHAR(100), -- 'YouTube', 'Udemy', 'Medium', etc.
    author VARCHAR(255),
    
    -- Content metadata
    duration_minutes INTEGER,
    difficulty VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    
    -- Categorization
    skill_tags UUID[], -- Array of skill IDs
    description TEXT,
    
    -- Quality metrics
    rating DECIMAL(3,2),
    num_ratings INTEGER DEFAULT 0,
    last_verified TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_resource_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    
    interaction_type VARCHAR(50), -- 'viewed', 'completed', 'bookmarked', 'rated'
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    interacted_at TIMESTAMP DEFAULT NOW()
);
```

**8. Analytics & Engagement**
```sql
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(100), -- 'login', 'task_completed', 'roadmap_generated', etc.
    activity_data JSONB,
    
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE streak_data (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_active_days INTEGER DEFAULT 0
);
```

### Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Resume queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_status ON resumes(parsing_status);

-- Skills
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_skills_category ON skills(category);

-- Roadmaps & Tasks
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_status ON roadmaps(status);
CREATE INDEX idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX idx_task_progress_user_task ON task_progress(user_id, task_id);

-- Resources
CREATE INDEX idx_resources_skill_tags ON resources USING GIN(skill_tags);
CREATE INDEX idx_resources_type ON resources(resource_type);

-- Activity tracking
CREATE INDEX idx_activity_user_time ON user_activity_log(user_id, timestamp DESC);
```

---

## 10. Non-Functional Requirements (NFRs)

### Performance

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dashboard Load Time | <2 seconds | Lighthouse Performance Score >90 |
| Resume Parsing | <5 seconds | Backend logs + user feedback |
| Roadmap Generation | <8 seconds | API response time monitoring |
| API Response Time (p95) | <500ms | APM tool (Sentry/DataDog) |
| Database Query Time | <100ms (p95) | PostgreSQL slow query log |
| Concurrent Users | 500+ without degradation | Load testing with k6/Locust |

**Optimization Strategies:**
- Database query optimization (proper indexing, avoid N+1)
- Redis caching for frequently accessed data
- CDN for static assets
- Lazy loading for React components
- LLM response caching (30-day TTL for common patterns)

---

### Scalability

**Current Scale (MVP):**
- 200-500 active users
- 1000+ roadmaps generated
- 10,000+ API requests/day

**Growth Targets (6 months):**
- 5,000+ active users
- 50,000+ API requests/day
- Multi-tenancy support for 10+ colleges

**Architecture Scalability:**
- **Horizontal Scaling:** Stateless backend services behind load balancer
- **Database:** Read replicas for analytics queries
- **Caching:** Redis cluster for distributed caching
- **Async Processing:** Celery/RQ for resume parsing, roadmap generation (moves heavy work off request-response cycle)
- **Rate Limiting:** 100 requests/minute per user (prevents abuse)

---

### Reliability & Availability

| Requirement | Target | Strategy |
|-------------|--------|----------|
| Uptime | 99% (allows ~7 hours downtime/month) | Health checks, auto-restart |
| Data Durability | 99.99% (no user data loss) | Daily automated backups, replication |
| Error Rate | <1% of requests | Comprehensive error handling |
| Recovery Time (RTO) | <2 hours | Documented runbooks, monitoring alerts |

**Disaster Recovery:**
- Daily database backups retained for 30 days
- Backup restoration tested monthly
- Separate staging environment mirrors production

---

### Security

**Authentication & Authorization:**
- Passwords: bcrypt hashing (min 12 rounds)
- JWT tokens: RS256 signing, 15min access token, 7-day refresh token
- RBAC: User, Admin, Super Admin roles
- OAuth 2.0: Google social login with proper scope restrictions

**Data Protection:**
- HTTPS only (TLS 1.3)
- Sensitive data encrypted at rest (AES-256)
- Resume files: Encrypted in S3, presigned URLs with 1-hour expiry
- PII minimization: Only collect necessary data
- GDPR compliance: Data export/deletion endpoints

**API Security:**
- Rate limiting (100 req/min per user, 1000 req/min global)
- Input validation (Zod schemas, SQL injection prevention)
- CORS: Whitelist allowed origins
- API key rotation for external services

**Vulnerabilities:**
- Dependency scanning (Dependabot)
- OWASP Top 10 mitigations
- Regular security audits

---

### Usability & Accessibility

**Design Principles:**
- Mobile-first responsive design (80% users on mobile)
- Clean, minimalist UI (avoid overwhelming beginners)
- Clear information hierarchy
- Consistent design system (Tailwind + shadcn/ui)

**Accessibility (WCAG 2.1 Level AA):**
- Semantic HTML
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast ratio ≥4.5:1
- Alt text for all images
- Form validation with clear error messages

**User Experience:**
- Loading states for async operations
- Optimistic UI updates (instant feedback)
- Undo actions where appropriate
- Helpful empty states ("No tasks yet - let's get started!")
- Onboarding tooltips for first-time users

---

### Maintainability

**Code Quality:**
- TypeScript for type safety (frontend + backend if Node)
- Linting enforced in CI/CD
- Code coverage target: >70% (focus on critical paths)
- Clear file structure and naming conventions
- Component-driven development

**Documentation:**
- API documentation (Swagger/OpenAPI)
- README with setup instructions
- Architecture decision records (ADRs)
- Inline comments for complex logic
- User-facing help docs

**Monitoring & Observability:**
- Structured logging (JSON format)
- Error tracking (Sentry)
- Performance monitoring (p50, p95, p99 latencies)
- User analytics (Mixpanel/PostHog)
- Custom dashboards (Grafana)