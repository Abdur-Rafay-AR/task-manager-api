# Task Manager API

A RESTful API for managing tasks with user authentication built with Flask, now featuring an interactive web frontend.

## Features

- User registration and authentication
- JWT-based authentication
- CRUD operations for tasks
- SQLite database with Flask-SQLAlchemy
- Database migrations with Flask-Migrate
- **Interactive Web Frontend** - Modern, responsive web interface
- Beautiful Material Design-inspired UI
- Real-time task management
- Mobile-friendly responsive design

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize Database**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

3. **Run the Application**
   ```bash
   python run.py
   ```

4. **Access the Web Interface**
   Open your browser and go to: `http://localhost:5000`

## Web Interface Features

### Authentication
- **Register**: Create a new account with username and password
- **Login**: Access your tasks with existing credentials
- **Logout**: Securely end your session

### Task Management
- **Create Tasks**: Add new tasks with title and optional description
- **View Tasks**: See all your tasks in a clean, organized interface
- **Mark Complete**: Toggle task completion status
- **Delete Tasks**: Remove tasks you no longer need
- **Auto-refresh**: Tasks automatically refresh every 30 seconds

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant feedback on all actions
- **Error Handling**: Clear error messages and success notifications
- **Secure Storage**: JWT tokens stored securely in browser localStorage
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## How to Use the Web Interface

1. **First Time Setup**:
   - Visit `http://localhost:5000`
   - Click "Don't have an account? Register"
   - Enter a username and password
   - Click "Register"

2. **Login**:
   - Enter your username and password
   - Click "Login"

3. **Managing Tasks**:
   - Use the "Create New Task" form to add tasks
   - Click "Mark Complete" to finish tasks
   - Click "Delete" to remove tasks
   - View task status with color-coded badges

4. **Logout**:
   - Click the "Logout" button in the top right corner

## API Endpoints

### Authentication

#### Register a new user
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

Response:
```json
{
    "access_token": "your_jwt_token_here"
}
```

### Tasks

All task endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

#### Get all tasks
```
GET /api/tasks/
```

#### Create a new task
```
POST /api/tasks/
Content-Type: application/json

{
    "title": "Task title",
    "description": "Task description (optional)"
}
```

#### Update a task
```
PUT /api/tasks/<task_id>
Content-Type: application/json

{
    "title": "Updated title",
    "description": "Updated description",
    "completed": true
}
```

#### Delete a task
```
DELETE /api/tasks/<task_id>
```

## Database Management

### Clearing Database Records

If you just want to delete all user accounts and tasks (keeping the database structure intact):

#### Option 1: Using Clear Records Script (Recommended)
```bash
python clear_records.py
```

#### Option 2: Manual SQL (Advanced)
```bash
# Connect to the database and run:
# DELETE FROM task;
# DELETE FROM user;
```

### Full Database Reset

If you need to completely reset the database structure and data:

#### Option 1: Complete Reset
```bash
# Stop the Flask app first, then:
Remove-Item "instance\tasks.db" -Force
Remove-Item "migrations" -Recurse -Force
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

#### Option 2: Quick Reset (Keep migrations)
```bash
# Stop the Flask app first, then:
Remove-Item "instance\tasks.db" -Force
flask db upgrade
```

#### Option 3: Using Reset Script
```bash
python reset_db.py
```

### Database Backup
To backup your database before clearing/resetting:
```bash
Copy-Item "instance\tasks.db" "instance\tasks_backup.db"
```

## Testing

Run the test script to verify all endpoints work correctly:

```bash
python test_api.py
```

Make sure the Flask app is running before running the tests.

## Example Usage

1. **Register a user:**
   ```bash
   curl -X POST http://127.0.0.1:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://127.0.0.1:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass123"}'
   ```

3. **Create a task (replace TOKEN with the actual token from login):**
   ```bash
   curl -X POST http://127.0.0.1:5000/api/tasks/ \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"title": "My First Task", "description": "This is my first task"}'
   ```

4. **Get all tasks:**
   ```bash
   curl -X GET http://127.0.0.1:5000/api/tasks/ \
     -H "Authorization: Bearer TOKEN"
   ```

## Database Schema

### User
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `password_hash` (String)

### Task
- `id` (Integer, Primary Key)
- `title` (String, Required)
- `description` (String, Optional)
- `completed` (Boolean, Default: False)
- `user_id` (Integer, Foreign Key to User)

## Security Features

- Passwords are hashed using Werkzeug's security functions
- JWT tokens for secure authentication
- User isolation (users can only access their own tasks)
- Input validation and error handling

## Development Notes

- The app runs in debug mode for development
- SQLite database is used for simplicity
- Database migrations are set up with Flask-Migrate
- All sensitive operations require authentication
