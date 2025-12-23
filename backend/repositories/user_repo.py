from db import get_connection

class UserRepo:
    def get_by_email(self, email: str):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, password_hash, role FROM users WHERE email=%s;", (email,))
        row = cur.fetchone()
        cur.close(); conn.close()
        return row

    def get_by_id(self, user_id: int):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, role FROM users WHERE id=%s;", (user_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        return row

    def create(self, username: str, email: str, password_hash: str, role: str = "user") -> int:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, role)
            VALUES (%s,%s,%s,%s)
            RETURNING id;
            """,
            (username, email, password_hash, role),
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return user_id
