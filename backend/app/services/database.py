from typing import Dict, Any, List
import uuid

# Simple in-memory storage for MVP
# In production, replace with MongoDB/PostgreSQL
class Database:
    def __init__(self):
        self.roadmaps: Dict[str, Any] = {}
        self.users: Dict[str, Any] = {}

    def save_roadmap(self, user_id: str, roadmap_data: Dict[str, Any]) -> str:
        roadmap_id = str(uuid.uuid4())
        roadmap_data["id"] = roadmap_id
        roadmap_data["user_id"] = user_id
        roadmap_data["progress"] = 0
        
        # Initialize task status
        for week in roadmap_data.get("weeks", []):
            week["tasks_status"] = {task: False for task in week.get("tasks", [])}
            
        self.roadmaps[roadmap_id] = roadmap_data
        return roadmap_id

    def get_roadmap(self, roadmap_id: str) -> Dict[str, Any]:
        return self.roadmaps.get(roadmap_id)

    def get_user_roadmap(self, user_id: str) -> Dict[str, Any]:
        # Return the most recent roadmap for the user
        for r_id, r_data in self.roadmaps.items():
            if r_data.get("user_id") == user_id:
                return r_data
        return None

    def update_task_status(self, roadmap_id: str, week_idx: int, task_name: str, status: bool) -> Dict[str, Any]:
        roadmap = self.roadmaps.get(roadmap_id)
        if not roadmap:
            return None
            
        try:
            week = roadmap["weeks"][week_idx]
            if "tasks_status" not in week:
                week["tasks_status"] = {}
            
            week["tasks_status"][task_name] = status
            
            # Recalculate total progress
            total_tasks = 0
            completed_tasks = 0
            for w in roadmap["weeks"]:
                t_status = w.get("tasks_status", {})
                total_tasks += len(t_status)
                completed_tasks += sum(1 for v in t_status.values() if v)
            
            roadmap["progress"] = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
            
            return roadmap
        except IndexError:
            return None

db = Database()
