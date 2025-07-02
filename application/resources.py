from flask_restful import Resource, reqparse, Api
from flask import request, jsonify
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from .database import db
from flask_security import auth_required, roles_required, current_user
from datetime import datetime
import math

from datetime import datetime, timedelta, timezone
import pytz

IST = pytz.timezone("Asia/Kolkata")
from .models import Reservation, ParkingLot
import random
 # Install via pip if not already: pip install python-dateutil


api = Api()

def roles_list(roles):
    return [role.name for role in roles]

class ParkingLotResource(Resource):
    # Common parser for request data
    parser = reqparse.RequestParser()
    parser.add_argument('id', type=int, required=False, help='Parking lot ID is optional for updates')
    parser.add_argument('name', type=str, required=True, help='Parking lot name is required')
    parser.add_argument('city', type=str, required=True, help='City is required')
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
                city=args['city'],
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
                    'city': new_lot.city,
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
            city = request.args.get('city')
            query = ParkingLot.query

            if city:
                query = query.filter_by(city=city)

            lots = query.all()
            result = []


            for lot in lots:
                spots = []
                for s in lot.spots:
                    spot_data = {
                        'id': s.id,
                        'spot_number': s.spot_number,
                        'status': s.status
                    }

                    if s.status == 'O':
                        reservation = Reservation.query.filter_by(spot_id=s.id, status='active').first()
                        if reservation:
                            user = User.query.get(reservation.user_id)
                            user_name= user.name if user else 'Unknown',
                            spot_data['reservation'] = {
                                'user_id': reservation.user_id,
                                'user_name': user_name if user else 'Unknown',
                                'vehicle_number': reservation.vehicle_number,
                                'check_in': reservation.check_in.isoformat(),
                                'check_out': reservation.check_out.isoformat() if reservation.check_out else None,
                                'status': reservation.status,
                                'cost': float(reservation.cost or 0.0)
                            }

                    spots.append(spot_data)

                this_lot = {
                    'id': lot.id,
                    'name': lot.name,
                    'city': lot.city,
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

            return result if result else {'message': 'No parking lots found'}, 200

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
        
class CityListResource(Resource):
    def get(self):
        try:
            cities = db.session.query(ParkingLot.city).distinct().all()
            city_list = [c[0] for c in cities]
            return jsonify(city_list)
        except Exception as e:
            return {'message': str(e)}, 500


class ParkingSpotResource(Resource):
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, spot_id):
        from .models import ParkingSpot, ParkingLot
        spot = ParkingSpot.query.get(spot_id)
        if not spot:
            return {'message': 'Spot not found'}, 404

        if spot.status == 'O':
            return {'message': 'Occupied spot cannot be deleted'}, 400

        try:
            lot = ParkingLot.query.get(spot.lot_id)
            db.session.delete(spot)
            db.session.commit()

            # Update the total_spots to reflect actual spot count
            actual_spots = ParkingSpot.query.filter_by(lot_id=lot.id).count()
            lot.total_spots = actual_spots
            db.session.commit()

            return {'message': 'Spot deleted successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete spot: {str(e)}'}, 500
        
class ReservationResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('spot_id', type=int, required=True)
    parser.add_argument('vehicle_number', type=str, required=True, help='Vehicle number is required')
    parser.add_argument('hours', type=int, required=False)
    parser.add_argument('check_in', type=str, required=False)
    parser.add_argument('check_out', type=str, required=False)

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
            # Use Indian Standard Time instead of UTC
            check_in_time = datetime.now(IST)

            if args.get('check_in'):
                check_in_time = datetime.fromisoformat(args['check_in']).astimezone(IST)

            check_out_time = None
            if args.get('check_out'):
                check_out_time = datetime.fromisoformat(args['check_out']).astimezone(IST)

            cost = 0.0
            if check_out_time and check_out_time > check_in_time:
                delta_hours = math.ceil((check_out_time - check_in_time).total_seconds() / 3600)
                cost = spot.lot.price * delta_hours

            reservation = Reservation(
                user_id=current_user.id,
                spot_id=spot.id,
                vehicle_number=args['vehicle_number'],
                check_in=check_in_time,
                check_out=check_out_time,
                cost=cost
            )

            spot.status = 'O'
            db.session.add(reservation)
            db.session.commit()

            return {
                'message': 'Reservation created successfully',
                'reservation_id': reservation.id,
                'check_in': reservation.check_in.isoformat(),
                'check_out': reservation.check_out.isoformat() if reservation.check_out else None,
                'estimated_cost': float(reservation.cost or 0.0)
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400

    @auth_required('token')
    def put(self, reservation_id):
        """Check out (release) a parking reservation early or late"""
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404

        # Check ownership or admin
        if not current_user.has_role('admin') and reservation.user_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        if reservation.status != 'active':
            return {'message': f'Reservation is not active (current = {reservation.status})'}, 400

        try:
            now = datetime.now(IST)

            # Cannot release before check-in
            if now < reservation.check_in:
                return {
                    'message': 'Cannot release before the scheduled check-in time.',
                    'check_in': reservation.check_in.isoformat(),
                    'now': now.isoformat()
                }, 400

            # If actual release time is after original check_out, update the check_out
            reservation.check_out = now
            # Else, retain the user-scheduled checkout

            # Calculate cost based on actual time
            delta = reservation.check_out - reservation.check_in
            total_hours = math.ceil(delta.total_seconds() / 3600)
            minutes = round((delta.total_seconds() % 3600) / 60)

            hourly_rate = reservation.spot.lot.price
            reservation.cost = total_hours * hourly_rate

            # Update status
            reservation.status = 'completed'
            reservation.spot.status = 'A'

            db.session.commit()

            return {
                'message': 'Checked out successfully',
                'final_cost': float(reservation.cost),
                'total_hours': total_hours,
                'duration': f"{total_hours}h {minutes}m",
                'check_out_updated': now.isoformat()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500


    @auth_required('token')
    def delete(self, reservation_id):
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404

        # Ensure user is owner or admin
        if not current_user.has_role('admin') and reservation.user_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        if reservation.status != 'active':
            return {'message': 'Only active reservations can be cancelled'}, 400

        try:
            now = datetime.utcnow()
            if reservation.check_in and now >= reservation.check_in:
                return {'message': 'Cannot cancel after check-in time'}, 400

            reservation.status = 'cancelled'
            reservation.spot.status = 'A'

            # Optional refund logic
            refund_amount = float(reservation.cost or 0.0)

            db.session.commit()

            return {
                'message': 'Reservation cancelled',
                'refund_amount': refund_amount
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500





        

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
                        'city': lot.city,
                        'area': lot.area,
                        'address': lot.address,
                        'pincode': lot.pincode,
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
        
# admin_resources.py
class AdminReservationHistoryResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            reservations = Reservation.query.order_by(Reservation.check_in.desc()).all()
            data = []
            for r in reservations:
                user = User.query.get(r.user_id)
                data.append({
                    'id': r.id,
                    'spot_id': r.spot_id,
                    'user_id': r.user_id,
                    'user_name': user.name if user else 'Unknown',
                    'city': r.spot.lot.city if r.spot and r.spot.lot else 'Unknown',
                    'area': r.spot.lot.area if r.spot and r.spot.lot else 'Unknown',
                    'lot_name': r.spot.lot.name if r.spot and r.spot.lot else 'Unknown',
                    'vehicle_number': r.vehicle_number,
                    'check_in': r.check_in.isoformat(),
                    'check_out': r.check_out.isoformat() if r.check_out else None,
                    'cost': float(r.cost or 0.0),
                    'status': r.status
                })
            return data, 200
        except Exception as e:
            return {'message': str(e)}, 500


# Register resources
api.add_resource(ParkingLotResource, '/api/lots', '/api/lots/<int:lot_id>')
api.add_resource(ParkingSpotResource, '/api/spots/<int:spot_id>')
api.add_resource(CityListResource, '/api/cities')
api.add_resource(ReservationResource, '/api/reservations', '/api/reservations/<int:reservation_id>')
api.add_resource(UserBookingsResource, '/api/user/bookings')
api.add_resource(UserProfileResource, '/api/user/profile')
api.add_resource(AdminProfileResource, '/api/admin/profile')
api.add_resource(AdminUserProfileResource, '/api/admin/users')
api.add_resource(AdminReservationHistoryResource, '/api/admin/reservations')


