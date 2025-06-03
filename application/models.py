from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash
from datetime import datetime
import uuid  # Needed for generating unique fs_uniquifier
 
from .database import db  # Importing db from the database module


class User(UserMixin, db.Model):
    """User model for both admin and regular users"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)  # Made nullable
    role = db.Column(db.String(20), default='user')  # 'admin' or 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reservations = db.relationship('Reservation', backref='user', lazy=True)
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))  # Auto-generated UUID
    active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class ParkingLot(db.Model):
    """Parking lot model"""
    __tablename__ = 'parking_lot'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price per hour
    total_spots = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    spots = db.relationship('ParkingSpot', backref='lot', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<ParkingLot {self.name}>'
    
    def create_spots(self):
        """Create parking spots when a new lot is added"""
        for i in range(1, self.total_spots + 1):
            spot = ParkingSpot(
                lot_id=self.id,
                spot_number=i,
                status='A'  # Available
            )
            db.session.add(spot)

class ParkingSpot(db.Model):
    """Individual parking spot model"""
    __tablename__ = 'parking_spot'
    
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    spot_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(1), default='A')  # 'A' = Available, 'O' = Occupied
    reservation = db.relationship('Reservation', backref='spot', uselist=False, lazy=True)
    
    def __repr__(self):
        return f'<ParkingSpot {self.spot_number} in Lot {self.lot_id}>'

class Reservation(db.Model):
    """Parking spot reservation model"""
    __tablename__ = 'reservation'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable=False)
    check_in = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    check_out = db.Column(db.DateTime)
    cost = db.Column(db.Float)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'cancelled'
    
    def __repr__(self):
        return f'<Reservation {self.id} for User {self.user_id}>'
    
    def calculate_cost(self):
        """Calculate parking cost based on time spent"""
        if self.check_out:
            duration = (self.check_out - self.check_in).total_seconds() / 3600  # hours
            return round(duration * self.spot.lot.price, 2)
        return 0

def init_db(app):
    """Initialize the database with required tables and admin user"""
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        if not User.query.filter_by(role='admin').first():
            admin = User(
                username='admin',
                email='admin@parking.com',
                password=generate_password_hash('admin123'),
                role='admin',
                phone='+1234567890',
                fs_uniquifier=str(uuid.uuid4())  # Added fs_uniquifier for admin
            )
            db.session.add(admin)
            db.session.commit()
            print("Created admin user with username 'admin' and password 'admin123'")

        # Create test user if not exists (fixed username mismatch)
        if not User.query.filter_by(username='testuser').first():
            test_user = User(
                username='testuser',  # Consistent username
                email='user@test.com',  # Changed from piyush@gmail.com to match test context
                password=generate_password_hash('test123'),
                phone='+9876543210',
                role='user',
                active=True,
                fs_uniquifier=str(uuid.uuid4())  # Auto-generated UUID
            )
            db.session.add(test_user)
            db.session.commit()
        
        print("Database initialized. Admin and test users created if not exists.")

def seed_test_data(app):
    """Seed the database with test data (optional, for development)"""
    with app.app_context():
        # Check if we already have test data
        if ParkingLot.query.count() > 2:  # If more than our test lots exist
            print("Test data already exists. Skipping seeding.")
            return
            
        # Add test parking lots if none exist
        if not ParkingLot.query.first():
            lot1 = ParkingLot(
                name="Downtown Parking",
                address="123 Main Street",
                pincode="100001",
                price=50.0,
                total_spots=20
            )
            db.session.add(lot1)
            
            lot2 = ParkingLot(
                name="Mall Parking",
                address="456 Shopping Avenue",
                pincode="100002",
                price=30.0,
                total_spots=30
            )
            db.session.add(lot2)
            
            db.session.commit()
            
            # Create spots for the lots
            lot1.create_spots()
            lot2.create_spots()
            
            print("Added test data: 2 parking lots with spots")