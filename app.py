
from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash, check_password_hash
from application.database import db
from application.models import User, Role, ParkingLot, ParkingSpot, UserRoles
from application.resources import *
from application.resources import api
from application.config import LocalDevelopmentConfig
import uuid
import sqlalchemy.exc
from application.celery_init import celery_init_app
from celery.schedules import crontab
from flask_caching import Cache

from application.task import monthly_report , send_daily_reminders

from application.extensions import cache  # ✅ Use this




def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    # Initialize database
    db.init_app(app)
    api.init_app(app)
    cache.init_app(app)



    # Initialize Flask-Security with correct User and Role models
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    # Register blueprints or routes here if needed

    return app


app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()

with app.app_context():
    # Create all database tables
    db.create_all()
    print("Tables created:", db.metadata.tables.keys())

    try:
        # Create roles if they don't exist
       
        app.security.datastore.find_or_create_role(name='admin', description='Administrator role')
        
        app.security.datastore.find_or_create_role(name='user', description='Regular user role')

        # Commit the roles to the database
        db.session.commit()

        # Create default admin user if it doesn't exist
        if not app.security.datastore.find_user(email="admin@gmail.com"):
            app.security.datastore.create_user(
                email="admin@gmail.com",
                name="Admin User",
                username="admin",
                password=generate_password_hash("admin123"),
                roles=['admin'],  # Use the role object
                phone="1234567890",
                active=True,
                fs_uniquifier=str(uuid.uuid4())
            )

        # Create default regular user if it doesn't exist
        if not app.security.datastore.find_user(email="user@gmail.com"):
            app.security.datastore.create_user(
                email="user@gmail.com",
                name="Regular User",
                username="user",
                password=generate_password_hash("user123"),
                roles=['user'],  # Use the role object
                phone="1234567800",
                active=True,
                fs_uniquifier=str(uuid.uuid4())
            )

        db.session.commit()
        print("Database initialized and default roles/users created.")
    except sqlalchemy.exc.IntegrityError as e:
        db.session.rollback()
        print(f"Database error occurred: {str(e)}")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {str(e)}")


from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Schedule the monthly report task to run on the first day of every month at 00:00
    sender.add_periodic_task(
        # crontab(hour=7, minute=0, day_of_month='1'),
        crontab(minute = '*/2'),
        monthly_report.s(),
    )



@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        # crontab(hour=18, minute=0),  # 6:00 PM
        crontab(minute = '*/2'),

        send_daily_reminders.s()
    )


if __name__ == '__main__':
    app.run(debug=True)