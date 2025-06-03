from flask import Flask
from application.database import db
from application.models import User, ParkingLot, ParkingSpot
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    # Initialize database
    db.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, ParkingSpot)
    app.security = Security(app, datastore)

    app.app_context().push()

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)  # Run the Flask application in debug mode 
