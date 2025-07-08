#!/usr/bin/env python3
"""
Simple test script to verify the Task Manager API endpoints work correctly.
Run this after starting the Flask app with: python run.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_user_registration():
    """Test user registration endpoint"""
    print("Testing user registration...")
    
    user_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    
    if response.status_code == 201:
        print("✓ User registration successful")
        return True
    elif response.status_code == 400 and "User exists" in response.json().get("error", ""):
        print("✓ User already exists (this is expected on repeated runs)")
        return True
    else:
        print(f"✗ User registration failed: {response.status_code} - {response.text}")
        return False

def test_user_login():
    """Test user login endpoint"""
    print("Testing user login...")
    
    user_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=user_data)
    
    if response.status_code == 200:
        print("✓ User login successful")
        return response.json()["access_token"]
    else:
        print(f"✗ User login failed: {response.status_code} - {response.text}")
        return None

def test_task_operations(token):
    """Test task CRUD operations"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test creating a task
    print("Testing task creation...")
    task_data = {
        "title": "Test Task",
        "description": "This is a test task"
    }
    
    response = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
    
    if response.status_code == 201:
        print("✓ Task creation successful")
    else:
        print(f"✗ Task creation failed: {response.status_code} - {response.text}")
        return False
    
    # Test getting tasks
    print("Testing task retrieval...")
    response = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    
    if response.status_code == 200:
        tasks = response.json()
        print(f"✓ Task retrieval successful - Found {len(tasks)} tasks")
        if tasks:
            task_id = tasks[0]["id"]
            print(f"  First task: {tasks[0]['title']}")
            
            # Test updating a task
            print("Testing task update...")
            update_data = {
                "completed": True
            }
            
            response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
            
            if response.status_code == 200:
                print("✓ Task update successful")
            else:
                print(f"✗ Task update failed: {response.status_code} - {response.text}")
            
            # Test deleting a task
            print("Testing task deletion...")
            response = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
            
            if response.status_code == 200:
                print("✓ Task deletion successful")
            else:
                print(f"✗ Task deletion failed: {response.status_code} - {response.text}")
        
        return True
    else:
        print(f"✗ Task retrieval failed: {response.status_code} - {response.text}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Task Manager API Test Suite")
    print("=" * 50)
    
    try:
        # Test user registration
        if not test_user_registration():
            return
        
        # Test user login
        token = test_user_login()
        if not token:
            return
        
        # Test task operations
        test_task_operations(token)
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("✗ Connection failed. Make sure the Flask app is running on http://127.0.0.1:5000")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")

if __name__ == "__main__":
    main()
