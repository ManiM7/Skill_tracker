from repositories.task_repo import TaskRepo
from common.exceptions import ValidationError, NotFoundError

class TaskService:
    def __init__(self):
        self.repo = TaskRepo()

    def list_for_user(self, user_id: int):
        rows = self.repo.get_by_user(user_id)
        return [
            {"id": r[0], "title": r[1], "category": r[2], "status": r[3]}
            for r in rows
        ]

    def create(self, user_id: int, data: dict):
        title = data.get("title")
        category = data.get("category")
        status = data.get("status", "todo")

        if not title or not category:
            raise ValidationError("title and category are required")

        if status not in ("todo", "in_progress", "done"):
            raise ValidationError("invalid status")

        task_id = self.repo.insert(user_id, title, category, status)
        return {"id": task_id, "title": title, "category": category, "status": status}

    def update(self, user_id: int, task_id: int, data: dict):
        status = data.get("status")
        title = data.get("title")
        category = data.get("category")

        if status is not None and status not in ("todo", "in_progress", "done"):
            raise ValidationError("invalid status")

        row = self.repo.update(task_id, user_id, title, category, status)
        if not row:
            raise NotFoundError("Task not found")
        return {"id": row[0], "title": row[1], "category": row[2], "status": row[3]}

    def delete(self, user_id: int, task_id: int):
        count = self.repo.delete(task_id, user_id)
        if count == 0:
            raise NotFoundError("Task not found")
        return True
