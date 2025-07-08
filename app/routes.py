from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Task, db

task_bp = Blueprint('tasks', __name__)

@task_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed
    } for task in tasks])

@task_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    task = Task(
        title=data['title'], 
        description=data.get('description', ''), 
        user_id=user_id
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"message": "Task created successfully"}), 201

@task_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.completed = data.get('completed', task.completed)
    db.session.commit()
    return jsonify({"message": "Task updated successfully"})

@task_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"})
