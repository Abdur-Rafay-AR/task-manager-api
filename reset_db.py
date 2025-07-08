#!/usr/bin/env python3
"""
Database Reset Script for Task Manager API
This script will reset the database by dropping all tables and recreating them.
"""

import os
import sys
from app import create_app, db

def reset_database():
    """Reset the database by dropping all tables and recreating them."""
    app = create_app()
    
    with app.app_context():
        try:
            # Drop all tables
            print("Dropping all tables...")
            db.drop_all()
            
            # Create all tables
            print("Creating all tables...")
            db.create_all()
            
            print("✅ Database reset successfully!")
            print("All tables have been dropped and recreated.")
            print("You can now run the application with: python run.py")
            
        except Exception as e:
            print(f"❌ Error resetting database: {e}")
            sys.exit(1)

if __name__ == '__main__':
    # Confirm before resetting
    confirm = input("⚠️  This will delete ALL data in the database. Are you sure? (y/N): ")
    if confirm.lower() == 'y':
        reset_database()
    else:
        print("Database reset cancelled.")
