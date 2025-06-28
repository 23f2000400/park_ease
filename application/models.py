from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from werkzeug.security import generate_password_hash
from datetime import datetime
import uuid
from enum import Enum

from .database import db  # Importing db from the database module

# Enum for status values
class SpotStatus(Enum):
    AVAILABLE = 'A'
    OCCUPIED = 'O'

class ReservationStatus(Enum):
    ACTIVE = 'active'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    active = db.Column(db.Boolean, default=True)
    reservations = db.relationship('Reservation', backref='reserved_by', lazy='dynamic')
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
    __tablename__ = 'parking_lot'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    area = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    total_spots = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    spots = db.relationship('ParkingSpot', backref='lot', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<ParkingLot {self.name}>'

    def create_spots(self):
        """Create parking spots for this lot based on total_spots"""
        from .database import db
        for n in range(1, self.total_spots + 1):
            spot = ParkingSpot(lot_id=self.id, spot_number=n, status='A')
            db.session.add(spot)
        db.session.commit()
    
    def update_spots(self, new_total):
        """Safely update parking spot count — without deleting occupied spots"""
        from .database import db
        current_total = self.total_spots

        if new_total < current_total:
            # Ensure no occupied spot lies beyond the new total
            occupied = ParkingSpot.query.filter(
                ParkingSpot.lot_id == self.id,
                ParkingSpot.spot_number > new_total,
                ParkingSpot.status == 'O'
            ).count()

            if occupied > 0:
                raise Exception("Cannot reduce total_spots — some spots beyond that are occupied.")

            # Delete only unoccupied spots beyond the new total
            excess_spots = ParkingSpot.query.filter(
                ParkingSpot.lot_id == self.id,
                ParkingSpot.spot_number > new_total,
                ParkingSpot.status != 'O'
            ).all()
            for spot in excess_spots:
                db.session.delete(spot)

        elif new_total > current_total:
            for n in range(current_total + 1, new_total + 1):
                spot = ParkingSpot(lot_id=self.id, spot_number=n, status='A')
                db.session.add(spot)

        self.total_spots = new_total
        db.session.commit()



class ParkingSpot(db.Model):
    """Individual parking spot model"""
    __tablename__ = 'parking_spot'
    
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    spot_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(1), default='Available')
    reservation = db.relationship('Reservation', backref='spot', uselist=False, 
                                lazy='select', cascade='all, delete-orphan')
    
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
    vehicle_number = db.Column(db.String(20), nullable=False)
    cost = db.Column(db.Numeric(10, 2))  # More precise for monetary values
    status = db.Column(db.String(20), default=ReservationStatus.ACTIVE.value)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Reservation {self.id} for User {self.user_id}>'