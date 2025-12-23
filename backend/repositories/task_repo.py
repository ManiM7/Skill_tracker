from db import get_connection

class TaskRepo:
    def get_by_user(self, user_id: int):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, category, status FROM tasks WHERE user_id=%s ORDER BY id;",
            (user_id,),
        )
        rows = cur.fetchall()
        cur.close(); conn.close()
        return rows

    def insert(self, user_id: int, title: str, category: str, status: str):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO tasks (user_id,title,category,status)
            VALUES (%s,%s,%s,%s)
            RETURNING id;
            """,
            (user_id, title, category, status),
        )
        task_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return task_id

    def update(self, task_id: int, user_id: int, title: str | None, category: str | None, status: str | None):
        fields = []
        values = []
        if title is not None:
            fields.append("title=%s"); values.append(title)
        if category is not None:
            fields.append("category=%s"); values.append(category)
        if status is not None:
            fields.append("status=%s"); values.append(status)
        if not fields:
            return None

        values.extend([task_id, user_id])
        set_clause = ", ".join(fields)

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            f"""
            UPDATE tasks SET {set_clause}
            WHERE id=%s AND user_id=%s
            RETURNING id,title,category,status;
            """,
            tuple(values),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return row

    def delete(self, task_id: int, user_id: int) -> int:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM tasks WHERE id=%s AND user_id=%s;", (task_id, user_id))
        count = cur.rowcount
        conn.commit()
        cur.close(); conn.close()
        return count
