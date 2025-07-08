from app import create_app
import os

app = create_app()

# Set Flask app for CLI commands
os.environ['FLASK_APP'] = 'wsgi.py'

if __name__ == "__main__":
    app.run()
