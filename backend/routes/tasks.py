from flask import Blueprint, request, jsonify
from db import get_connection

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")


def get_user_id_from_header():
    user_id = request.headers.get("X-User-Id")
    try:
        return int(user_id)
    except (TypeError, ValueError):
        return None


@tasks_bp.route("", methods=["GET"])
def get_tasks():
    user_id = get_user_id_from_header()
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, category, status FROM tasks WHERE user_id = %s ORDER BY id;",
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    tasks = [
        {"id": r[0], "title": r[1], "category": r[2], "status": r[3]} for r in rows
    ]
    return jsonify(tasks)


@tasks_bp.route("", methods=["POST"])
def add_task():
    user_id = get_user_id_from_header()
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    data = request.get_json()
    title = data.get("title")
    category = data.get("category")
    status = data.get("status", "todo")

    if not title or not category:
        return jsonify({"error": "title and category are required"}), 400

    if status not in ("todo", "in_progress", "done"):
        return jsonify({"error": "invalid status"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO tasks (user_id, title, category, status)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
        """,
        (user_id, title, category, status),
    )
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return (
        jsonify(
            {"id": task_id, "title": title, "category": category, "status": status}
        ),
        201,
    )
    
    
@tasks_bp.route("/<int:task_id>/status", methods=["PUT"])
def update_task_status(task_id):
    user_id = get_user_id_from_header()
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    data = request.get_json()
    status = data.get("status")

    if status not in ("todo", "in_progress", "done"):
        return jsonify({"error": "invalid status"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE tasks
        SET status = %s
        WHERE id = %s AND user_id = %s
        RETURNING id, title, category, status;
        """,
        (status, task_id, user_id),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if row is None:
        return jsonify({"error": "Task not found"}), 404

    updated = {
        "id": row[0],
        "title": row[1],
        "category": row[2],
        "status": row[3],
    }
    return jsonify(updated), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    user_id = get_user_id_from_header()
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM tasks WHERE id = %s AND user_id = %s;",
        (task_id, user_id),
    )
    deleted_count = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    if deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404

    # Can be 204 (no body) or 200 with message
    return jsonify({"message": "Task deleted"}), 200

