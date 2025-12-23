from repositories.skill_repo import SkillRepo
from common.exceptions import ValidationError, NotFoundError

class SkillService:
    def __init__(self):
        self.repo = SkillRepo()

    def list_all(self):
        rows = self.repo.list_all()
        return [{"id": r[0], "name": r[1]} for r in rows]

    def create(self, name: str):
        if not name:
            raise ValidationError("name is required")
        skill_id = self.repo.create(name)
        return {"id": skill_id, "name": name}

    def update(self, skill_id: int, name: str):
        if not name:
            raise ValidationError("name is required")
        row = self.repo.update(skill_id, name)
        if not row:
            raise NotFoundError("Skill not found")
        return {"id": row[0], "name": row[1]}

    def delete(self, skill_id: int):
        count = self.repo.delete(skill_id)
        if count == 0:
            raise NotFoundError("Skill not found")
        return True
