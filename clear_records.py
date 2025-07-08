#!/usr/bin/env python3
"""
Clear Database Records Script for Task Manager API
This script will delete all records from the database tables without dropping the tables themselves.
"""

import sys
from app import create_app, db
from app.models import User, Task

def clear_records():
    """Clear all records from database tables without dropping the tables."""
    app = create_app()
    
    with app.app_context():
        try:
            # Delete all tasks first (due to foreign key constraint)
            tasks_deleted = Task.query.delete()
            print(f"Deleted {tasks_deleted} tasks")
            
            # Delete all users
            users_deleted = User.query.delete()
            print(f"Deleted {users_deleted} users")
            
            # Commit the changes
            db.session.commit()
            
            print("✅ Database records cleared successfully!")
            print("All user accounts and tasks have been deleted.")
            print("Database tables remain intact.")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error clearing records: {e}")
            sys.exit(1)

if __name__ == '__main__':
    # Confirm before clearing
    confirm = input("⚠️  This will delete ALL user accounts and tasks. Are you sure? (y/N): ")
    if confirm.lower() == 'y':
        clear_records()
    else:
        print("Operation cancelled.")
