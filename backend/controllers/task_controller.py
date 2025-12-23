from flask import Blueprint, request, jsonify
from services.task_service import TaskService
from middleware.jwt_middleware import jwt_required
from common.exceptions import ValidationError, NotFoundError

task_bp = Blueprint("tasks", __name__, url_prefix="/tasks")
service = TaskService()
# http
@task_bp.route("", methods=["GET"])
@jwt_required()
def list_tasks():
    tasks = service.list_for_user(request.user_id)
    return jsonify(tasks), 200

@task_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    data = request.get_json() or {}
    try:
        task = service.create(request.user_id, data)
        return jsonify(task), 201
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    data = request.get_json() or {}
    try:
        task = service.update(request.user_id, task_id, data)
        return jsonify(task), 200
    except (ValidationError, NotFoundError) as e:
        code = 404 if isinstance(e, NotFoundError) else 400
        return jsonify({"error": str(e)}), code

@task_bp.route("/<int:task_id>/status", methods=["PUT"])
@jwt_required()
def update_status(task_id):
    data = request.get_json() or {}
    try:
        task = service.update(request.user_id, task_id, {"status": data.get("status")})
        return jsonify(task), 200
    except (ValidationError, NotFoundError) as e:
        code = 404 if isinstance(e, NotFoundError) else 400
        return jsonify({"error": str(e)}), code

@task_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    try:
        service.delete(request.user_id, task_id)
        return jsonify({"message": "Task deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404
