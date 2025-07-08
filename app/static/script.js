class TaskManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentUser = localStorage.getItem('currentUser');
        this.tasks = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.initTheme();
    }

    setupEventListeners() {
        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('showLogin').addEventListener('click', () => this.showLoginForm());

        // Task management
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleCreateTask(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('change', (e) => this.toggleTheme(e));

        // Auto-refresh tasks every 30 seconds
        setInterval(() => {
            if (this.token) {
                this.loadTasks();
            }
        }, 30000);
    }

    checkAuthStatus() {
        if (this.token) {
            this.showTaskManager();
            this.loadTasks();
        } else {
            this.showAuth();
        }
    }

    showAuth() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('taskManager').style.display = 'none';
    }

    showTaskManager() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('taskManager').style.display = 'block';
        document.getElementById('userWelcome').textContent = `Welcome, ${this.currentUser}!`;
    }

    showRegisterForm() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('registerContainer').style.display = 'block';
        this.clearMessages();
    }

    showLoginForm() {
        document.getElementById('registerContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'block';
        this.clearMessages();
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access_token;
                this.currentUser = username;
                localStorage.setItem('token', this.token);
                localStorage.setItem('currentUser', this.currentUser);
                this.showTaskManager();
                this.loadTasks();
                this.clearMessages();
            } else {
                this.showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                this.showLoginForm();
                document.getElementById('registerForm').reset();
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleCreateTask(e) {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;

        if (!title.trim()) {
            this.showMessage('Task title is required', 'error');
            return;
        }

        try {
            const response = await fetch('/api/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Task created successfully!', 'success');
                document.getElementById('taskForm').reset();
                this.loadTasks();
            } else {
                this.showMessage(data.error || 'Failed to create task', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks/', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
            } else if (response.status === 401) {
                this.logout();
            } else {
                this.showMessage('Failed to load tasks', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        const taskCountElement = document.getElementById('taskCount');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No tasks yet</h4>
                    <p>Create your first task to get started!</p>
                </div>
            `;
            taskCountElement.textContent = '0';
            return;
        }

        taskCountElement.textContent = this.tasks.length;

        container.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <h4 class="task-title ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.title)}</h4>
                    <div class="task-actions">
                        <button class="btn btn-success" onclick="taskManager.toggleTask(${task.id}, ${!task.completed})">
                            <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn btn-danger" onclick="taskManager.deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="task-status">
                    <span class="status-badge ${task.completed ? 'completed' : 'pending'}">
                        ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async toggleTask(taskId, completed) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({ completed }),
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(`Task ${completed ? 'completed' : 'marked as incomplete'}!`, 'success');
                this.loadTasks();
            } else {
                this.showMessage(data.error || 'Failed to update task', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Task deleted successfully!', 'success');
                this.loadTasks();
            } else {
                this.showMessage(data.error || 'Failed to delete task', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.showAuth();
        this.clearMessages();
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());

        // Add new alert
        const container = document.getElementById('authContainer').style.display !== 'none' 
            ? document.getElementById('authContainer')
            : document.getElementById('taskManager');
        
        container.insertBefore(alertDiv, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    clearMessages() {
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Theme management methods
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeToggle = document.getElementById('themeToggle');
        
        // Default to light mode if no theme is saved
        if (savedTheme === 'dark') {
            document.body.classList.remove('light-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.add('light-mode');
            themeToggle.checked = false;
        }
    }

    toggleTheme(e) {
        const isDarkMode = e.target.checked;
        
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    }
}

// Initialize the task manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
