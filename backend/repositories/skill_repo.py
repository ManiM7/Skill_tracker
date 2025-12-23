from db import get_connection

class SkillRepo:
    def list_all(self):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM categories ORDER BY name;")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return rows

    def create(self, name: str):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO categories (name) VALUES (%s) RETURNING id;",
            (name,),
        )
        skill_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return skill_id

    def update(self, skill_id: int, name: str):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE categories SET name=%s WHERE id=%s RETURNING id,name;",
            (name, skill_id),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return row

    def delete(self, skill_id: int) -> int:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM categories WHERE id=%s;", (skill_id,))
        count = cur.rowcount
        conn.commit()
        cur.close(); conn.close()
        return count
