from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from werkzeug.security import generate_password_hash
from datetime import datetime
import uuid

from .database import db  # Importing db from the database module


class User(UserMixin, db.Model):
    """User model for both admin and regular users"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)  # Made nullable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reservations = db.relationship('Reservation', backref='reserved_by', lazy='dynamic')
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))  # Auto-generated UUID
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

    def __repr__(self):
        return f'<User {self.email}>'


class Role(RoleMixin, db.Model):
    """Role model for user roles"""
    __tablename__ = 'role'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    
    def __repr__(self):
        return f'<Role {self.name}>'


class UserRoles(db.Model):
    """Association table for many-to-many relationship between users and roles"""
    __tablename__ = 'user_roles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), primary_key=True)
    
    def __repr__(self):
        return f'<UserRoles User {self.user_id} Role {self.role_id}>'


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
    spots = db.relationship('ParkingSpot', backref='parking_lot', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<ParkingLot {self.name}>'

    def create_spots(self):
        """Create parking spots when a new lot is added"""
        if not isinstance(self.total_spots, int) or self.total_spots <= 0:
            raise ValueError("total_spots must be a positive integer")
        for i in range(1, self.total_spots + 1):
            spot = ParkingSpot(
                lot_id=self.id,
                spot_number=i,
                status='A'
            )
            db.session.add(spot)
        db.session.commit()


class ParkingSpot(db.Model):
    """Individual parking spot model"""
    __tablename__ = 'parking_spot'
    
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    spot_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(1), default='A')  # 'A' = Available, 'O' = Occupied
    reservation = db.relationship('Reservation', backref='parking_spot', uselist=False, lazy='select')
    
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