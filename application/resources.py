from flask_restful import Resource, reqparse, Api
from flask import request, jsonify
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from .database import db
from flask_security import auth_required, roles_required, current_user
from datetime import datetime
import math

from datetime import datetime, timedelta
from .models import Reservation, ParkingLot
import random


api = Api()

def roles_list(roles):
    return [role.name for role in roles]

class ParkingLotResource(Resource):
    # Common parser for request data
    parser = reqparse.RequestParser()
    parser.add_argument('id', type=int, required=False, help='Parking lot ID is optional for updates')
    parser.add_argument('name', type=str, required=True, help='Parking lot name is required')
    parser.add_argument('area', type=str, required=True, help='Parking lot area is required')
    parser.add_argument('address', type=str, required=True)
    parser.add_argument('pincode', type=str, required=True)
    parser.add_argument('price', type=float, required=True)
    parser.add_argument('total_spots', type=int, required=True)
    parser.add_argument('status', type=str, choices=['A', 'O'], default='A', help='Status must be A (Available) or O (Occupied)')
    parser.add_argument('spot_number', type=int, required=False, help='Spot number is optional for updates')

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            args = self.parser.parse_args()

            # Create a new ParkingLot instance
            new_lot = ParkingLot(
                name=args['name'],
                area=args['area'],
                address=args['address'],
                pincode=args['pincode'],
                price=args['price'],
                total_spots=args['total_spots']
            )

            db.session.add(new_lot)
            db.session.commit()

            # Optional: auto-generate spots if your model supports it
            if hasattr(new_lot, 'create_spots'):
                new_lot.create_spots()

            return {
                'message': 'Parking lot created successfully',
                'lot': {
                    'id': new_lot.id,
                    'name': new_lot.name,
                    'area': new_lot.area,
                    'address': new_lot.address,
                    'pincode': new_lot.pincode,
                    'price': float(new_lot.price),
                    'total_spots': new_lot.total_spots,
                    'available_spots': new_lot.total_spots  # assuming all spots are initially available
                }
            }, 201

        except Exception as e:
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return {'error': str(e)}, 400


    # @auth_required('token')
    # def get(self, lot_id=None):
    #     """Get parking lot(s)"""
    #     if lot_id:
    #         lot = ParkingLot.query.get(lot_id)
    #         if not lot:
    #             return {'message': 'Parking lot not found'}, 404
                
    #         return jsonify({
    #             'id': lot.id,
    #             'name': lot.name,
    #             'area': lot.area,
    #             'address': lot.address,
    #             'pincode': lot.pincode,
    #             'price': lot.price,
    #             'total_spots': lot.total_spots,
    #             'available_spots': lot.spots.filter_by(status='A').count(),
    #         })
    #     else:
            # Get all parking lots with availability info

            # lots = []
            # result = []
            # if 'admin' in roles_list(current_user.roles):
            #     # Admin can see all lots
            #     lots = ParkingLot.query.all()
            # else:
            #     lots = current_user.parking_lots  # User can see their own lots
    
    def get(self):
        try:
            lots = ParkingLot.query.all()
            result = []
            for lot in lots:
                spots = [{
                'id': s.id,
                'spot_number': s.spot_number,
                'status': s.status
                } for s in lot.spots]
                this_lot = {
                    'id': lot.id,
                    'name': lot.name,
                    'area': lot.area,
                    'address': lot.address,
                    'pincode': lot.pincode,
                    'price': float(lot.price), 
                    'total_spots': lot.total_spots,
                    'available_spots': lot.spots.filter_by(status='A').count() if hasattr(lot, 'spots') else 0,
                    'occupied_spots': lot.spots.filter_by(status='O').count() if hasattr(lot, 'spots') else 0,
                    'spots': spots
                }
                result.append(this_lot)

            if result:
                return result, 200
            else:
                return {'message': 'No parking lots found'}, 404
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500



    @auth_required('token')
    @roles_required('admin')
    def put(self, lot_id):
        """Update parking lot details"""
        lot = ParkingLot.query.get(lot_id)
        if not lot:
            return {'message': 'Parking lot not found'}, 404
            
        args = self.parser.parse_args()
        
        try:
            # Check if we're reducing spots (only allowed if spots are available)
            if args['total_spots'] < lot.total_spots:
                occupied_spots = lot.spots.filter_by(status='O').count()
                if occupied_spots > args['total_spots']:
                    return {
                        'message': f'Cannot reduce spots below {occupied_spots} currently occupied spots'
                    }, 400
            
            lot.name = args['name']
            lot.area = args['area']
            lot.address = args['address']
            lot.pincode = args['pincode']
            lot.price = args['price']
            
            # Handle spot count changes
            if args['total_spots'] != lot.total_spots:
                lot.update_spots(args['total_spots'])
            
            db.session.commit()
            return {'message': 'Parking lot updated successfully'}
            
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, lot_id):
        """Delete a parking lot"""
        lot = ParkingLot.query.get(lot_id)
        if not lot:
            return {'message': 'Parking lot not found'}, 404
            
        # Check if any spots are occupied
        if lot.spots.filter_by(status='O').count() > 0:
            return {'message': 'Cannot delete lot with occupied spots'}, 400
            
        try:
            # Delete associated spots first
            ParkingSpot.query.filter_by(lot_id=lot_id).delete()
            db.session.delete(lot)
            db.session.commit()
            return {'message': 'Parking lot deleted successfully'}
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400


class ParkingSpotResource(Resource):
    @auth_required('token')
    def get(self, lot_id):
        """Get all spots for a parking lot"""
        spots = ParkingSpot.query.filter_by(lot_id=lot_id).all()
        return jsonify([{
            'id': spot.id,
            'spot_number': spot.spot_number,
            'status': spot.status,
            'reserved': spot.reservation is not None if hasattr(spot, 'reservation') else False
        } for spot in spots])


class ReservationResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('spot_id', type=int, required=True)
    parser.add_argument('hours', type=int, required=False)

    @auth_required('token')
    @roles_required('user')
    def post(self):
        """Create a new reservation"""
        args = self.parser.parse_args()
        spot = ParkingSpot.query.get(args['spot_id'])
        
        if not spot:
            return {'message': 'Parking spot not found'}, 404
            
        if spot.status == 'O':
            return {'message': 'Spot is already occupied'}, 400
            
        try:
            # Calculate cost if hours are provided (for pre-booking)
            cost = None
            if args.get('hours'):
                cost = spot.parking_lot.price * args['hours']
            
            reservation = Reservation(
                user_id=current_user.id,
                spot_id=spot.id,
                cost=cost
            )
            
            spot.status = 'O'
            
            db.session.add(reservation)
            db.session.commit()
            
            return {
                'message': 'Reservation created successfully',
                'reservation_id': reservation.id,
                'check_in': reservation.check_in.isoformat(),
                'estimated_cost': cost
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400

    @auth_required('token')
    def put(self, reservation_id):
        """Check out from a reservation"""
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404
            
        # Authorization check
        if not current_user.has_role('admin') and reservation.user_id != current_user.id:
            return {'message': 'Unauthorized'}, 403
            
        if reservation.status != 'active':
            return {'message': 'Reservation is not active'}, 400
            
        try:
            reservation.check_out = datetime.utcnow()
            
            # Calculate final cost based on time spent
            if not reservation.cost:
                hours = (reservation.check_out - reservation.check_in).total_seconds() / 3600
                reservation.cost = math.ceil(hours) * reservation.parking_spot.parking_lot.price
            
            reservation.status = 'completed'
            reservation.parking_spot.status = 'A'
            
            db.session.commit()
            
            return {
                'message': 'Checked out successfully',
                'final_cost': reservation.cost,
                'total_hours': round((reservation.check_out - reservation.check_in).total_seconds() / 3600, 2)
            }
            
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400
        

class UserBookingsResource(Resource):
    @auth_required('token')
    def get(self):
        """Get all bookings for the current user with activity feed"""
        try:
            # Get user's reservations ordered by check-in date (newest first)
            reservations = Reservation.query.filter_by(user_id=current_user.id)\
                .order_by(Reservation.check_in.desc())\
                .all()
            
            bookings = []
            for res in reservations:
                # Get associated parking lot details
                lot = ParkingLot.query.get(res.spot.lot_id)
                
                bookings.append({
                    'id': res.id,
                    'status': res.status,
                    'check_in': res.check_in.isoformat(),
                    'check_out': res.check_out.isoformat() if res.check_out else None,
                    'cost': float(res.cost) if res.cost else 0.0,
                    'parking_lot': {
                        'name': lot.name,
                        'address': lot.address,
                        'price': float(lot.price)
                    },
                    'vehicle_number': res.vehicle_number
                })
            
            # Generate recent activities (mix of real and sample data)
            recent_activities = self.generate_activities(bookings)
            
            return jsonify({
                'bookings': bookings,
                'recent_activities': recent_activities
            })
            
        except Exception as e:
            return {'message': str(e)}, 500
    
    def generate_activities(self, bookings):
        """Generate a mix of real and sample activities"""
        activities = []
        
        # Add real booking completions
        for booking in bookings:
            if booking['status'] == 'completed':
                activities.append({
                    'id': f"act-{booking['id']}",
                    'type': 'success',
                    'icon': 'fa-check',
                    'message': f"Booking completed at {booking['parking_lot']['name']}",
                    'timestamp': booking['check_out'],
                    'amount': -float(booking['cost'])
                })
        
        # Add sample activities (in a real app, these would come from a database)
        sample_activities = [
            {
                'id': 'act-payment',
                'type': 'primary',
                'icon': 'fa-plus',
                'message': 'Added new payment method',
                'timestamp': (datetime.utcnow() - timedelta(days=1)).isoformat()
            },
            {
                'id': 'act-promo',
                'type': 'info',
                'icon': 'fa-tag',
                'message': 'Used promo code PARK20',
                'timestamp': (datetime.utcnow() - timedelta(days=3)).isoformat(),
                'amount': -5.00
            },
            {
                'id': 'act-reminder',
                'type': 'warning',
                'icon': 'fa-exclamation',
                'message': 'Received parking reminder',
                'timestamp': (datetime.utcnow() - timedelta(days=5)).isoformat()
            }
        ]
        
        # Merge and sort by timestamp (newest first)
        activities.extend(sample_activities)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return activities[:5]  # Return only 5 most recent


class UserProfileResource(Resource):
    @auth_required('token')
    def get(self):
        """Get profile details for the current user"""
        try:
            # Get the current user's details
            user_data = {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'username': current_user.username,
                'phone': current_user.phone,
                'created_at': current_user.created_at.isoformat(),
                'membership_tier': self.get_membership_tier(current_user),
                'stats': self.get_user_stats(current_user.id)
            }
            
            return jsonify(user_data)
            
        except Exception as e:
            return {'message': str(e)}, 500
    
    def get_membership_tier(self, user):
        """Determine membership tier based on user's activity"""
        # In a real app, this would query the database for actual usage
        if user.has_role('premium'):
            return 'Premium'
        elif user.has_role('vip'):
            return 'VIP'
        else:
            # Default tier logic based on account age
            account_age = (datetime.utcnow() - user.created_at).days
            if account_age > 365:
                return 'Gold'
            elif account_age > 180:
                return 'Silver'
            else:
                return 'Basic'
    
    def get_user_stats(self, user_id):
        """Get user statistics (bookings, spending, etc.)"""
        from .models import Reservation
        from sqlalchemy import func
        
        # Get booking counts
        total_bookings = Reservation.query.filter_by(user_id=user_id).count()
        active_bookings = Reservation.query.filter_by(
            user_id=user_id, 
            status='active'
        ).count()
        completed_bookings = Reservation.query.filter_by(
            user_id=user_id, 
            status='completed'
        ).count()
        
        # Get total spending
        total_spent_result = db.session.query(
            func.sum(Reservation.cost)
        ).filter(
            Reservation.user_id == user_id,
            Reservation.status == 'completed'
        ).first()
        
        total_spent = float(total_spent_result[0]) if total_spent_result[0] else 0.0
        
        return {
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'completed_bookings': completed_bookings,
            'total_spent': total_spent,
            'favorite_lot': self.get_favorite_parking_lot(user_id)
        }
    
    def get_favorite_parking_lot(self, user_id):
        """Determine user's most frequently used parking lot"""
        from .models import Reservation, ParkingSpot, ParkingLot
        from sqlalchemy import func, desc
        
        favorite = db.session.query(
            ParkingLot.name,
            func.count(Reservation.id).label('reservation_count')
        ).join(
            ParkingSpot, ParkingSpot.id == Reservation.spot_id
        ).join(
            ParkingLot, ParkingLot.id == ParkingSpot.lot_id
        ).filter(
            Reservation.user_id == user_id
        ).group_by(
            ParkingLot.name
        ).order_by(
            desc('reservation_count')
        ).first()
        
        return favorite[0] if favorite else None

class AdminProfileResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Get admin profile details"""
        try:
            # Get the current admin's details
            user_data = {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'username': current_user.username,
                'phone': current_user.phone,
                'created_at': current_user.created_at.isoformat(),
                'roles': roles_list(current_user.roles)
            }
            
            return jsonify(user_data)
            
        except Exception as e:
            return {'message': str(e)}, 500
        

class AdminUserProfileResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Get all users' profiles for admin"""
        try:
            users = User.query.all()
            user_list = []
            for user in users:
                user_list.append({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'username': user.username,
                    'phone': user.phone,
                    'created_at': user.created_at.isoformat(),
                    'roles': roles_list(user.roles),
                    'active': user.active
                })
            return jsonify(user_list)
        except Exception as e:
            return {'message': str(e)}, 500

# Register resources
api.add_resource(ParkingLotResource, '/api/lots', '/api/lots/<int:lot_id>')
api.add_resource(ParkingSpotResource, '/api/lots/<int:lot_id>/spots')
api.add_resource(ReservationResource, '/api/reservations', '/api/reservations/<int:reservation_id>')
api.add_resource(UserBookingsResource, '/api/user/bookings')
api.add_resource(UserProfileResource, '/api/user/profile')
api.add_resource(AdminProfileResource, '/api/admin/profile')
api.add_resource(AdminUserProfileResource, '/api/admin/users')

