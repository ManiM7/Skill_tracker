from flask import Blueprint, request, jsonify
from services.skill_service import SkillService
from middleware.jwt_middleware import jwt_required
from common.exceptions import ValidationError, NotFoundError

skill_bp = Blueprint("skills", __name__, url_prefix="/skills")
service = SkillService()

@skill_bp.route("", methods=["GET"])
@jwt_required()
def list_skills():
    skills = service.list_all()
    return jsonify(skills), 200


@skill_bp.route("/<int:skill_id>", methods=["DELETE"])
@jwt_required()
def delete_skill(skill_id):
    try:
        service.delete(skill_id)
        return jsonify({"message": "Skill deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404




# @skill_bp.route("", methods=["POST"])
# @jwt_required("admin")  
# def create_skill():
#     data = request.get_json() or {}
#     try:
#         skill = service.create(data.get("name"))
#         return jsonify(skill), 201
#     except ValidationError as e:
#         return jsonify({"error": str(e)}), 400

# @skill_bp.route("/<int:skill_id>", methods=["PUT"])
# @jwt_required("admin")
# def update_skill(skill_id):
#     data = request.get_json() or {}
#     try:
#         skill = service.update(skill_id, data.get("name"))
#         return jsonify(skill), 200
#     except (ValidationError, NotFoundError) as e:
#         code = 404 if isinstance(e, NotFoundError) else 400
#         return jsonify({"error": str(e)}), code