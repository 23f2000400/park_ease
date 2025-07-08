
from flask_restful import Resource, reqparse, Api
from flask import request, jsonify
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from .database import db
from flask_security import auth_required, roles_required, current_user
from datetime import datetime
import math
from sqlalchemy import func, case ,desc

from datetime import datetime, timedelta, timezone
import pytz
import calendar

IST = pytz.timezone("Asia/Kolkata")
now = datetime.now(IST)

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
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return {'message': 'Reservation not found'}, 404

        if not current_user.has_role('admin') and reservation.user_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        if reservation.status != 'active':
            return {'message': f'Reservation is not active (current = {reservation.status})'}, 400

        try:
            now = datetime.now(IST)

            check_in_time = reservation.check_in
            if check_in_time.tzinfo is None or check_in_time.tzinfo.utcoffset(check_in_time) is None:
                check_in_time = IST.localize(check_in_time)
            else:
                check_in_time = check_in_time.astimezone(IST)

            if now < check_in_time:
                return {
                    'message': 'Cannot release before the scheduled check-in time.',
                    'check_in': check_in_time.isoformat(),
                    'now': now.isoformat()
                }, 400

            reservation.check_out = now
            delta = reservation.check_out - check_in_time
            total_hours = math.ceil(delta.total_seconds() / 3600)
            minutes = round((delta.total_seconds() % 3600) / 60)

            hourly_rate = reservation.spot.lot.price
            reservation.cost = total_hours * hourly_rate
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
            reservation.check_out = None  # 🧹 Remove scheduled check-out time
            reservation.spot.status = 'A'

            # Optional refund logic
            refund_amount = float(reservation.cost or 0.0)
            reservation.cost = 0.0  # 🧹 Reset cost


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

                # Compute duration
                duration_str = 'N/A'
                if res.check_in and res.check_out:
                    delta = res.check_out - res.check_in
                    hours = delta.total_seconds() // 3600
                    minutes = (delta.total_seconds() % 3600) // 60
                    duration_str = f"{int(hours)}h {int(minutes)}m"

                bookings.append({
                    'id': res.id,
                    'status': res.status,
                    'check_in': res.check_in.isoformat(),
                    'check_out': res.check_out.isoformat() if res.check_out else None,
                    'cost': float(res.cost) if res.cost else 0.0,
                    'duration': duration_str,
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
        

from sqlalchemy.orm import joinedload

class AdminUserProfileResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Get all users with role 'user' only"""
        try:
            user_role = Role.query.filter_by(name='user').first()
            if not user_role:
                return {'message': 'User role not found'}, 404

            users = User.query\
                .join(User.roles)\
                .filter(Role.name == 'user')\
                .options(joinedload(User.roles))\
                .all()

            user_list = []
            for user in users:
                # Optional: skip those with multiple roles
                if len(user.roles) != 1 or user.roles[0].name != 'user':
                    continue

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
            import traceback
            traceback.print_exc()
            return {'message': str(e)}, 500
 
        
class AdminUserDetail(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "roles": [role.name for role in user.roles],
            "active": user.active,
            "created_at": user.created_at.isoformat(),

        }

        

class AdminUserBookings(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, user_id):
        bookings = Reservation.query.filter_by(user_id=user_id).order_by(Reservation.check_in.desc()).all()
        result = []
        for res in bookings:
            lot = res.spot.lot
            result.append({
                "id": res.id,
                "status": res.status,
                "check_in": res.check_in.isoformat(),
                "check_out": res.check_out.isoformat() if res.check_out else None,
                "cost": float(res.cost or 0),
                "vehicle_number": res.vehicle_number,
                "parking_lot": {
                    "name": lot.name,
                    "area": lot.area,
                    "city": lot.city,
                }
            })
        return result, 200
        
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
                duration = "Cancelled"
                if r.check_out:
                    delta = r.check_out - r.check_in
                    hours = delta.total_seconds() // 3600
                    minutes = (delta.total_seconds() % 3600) // 60
                    duration = f"{int(hours)}h {int(minutes)}m"

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
                    'status': r.status,
                    'duration': duration
                })
            return data, 200
        except Exception as e:
            return {'message': str(e)}, 500
        

class AdminProfitAnalytics(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            now = datetime.now(IST)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # ---- Today ----
            today_reservations = Reservation.query.filter(
                Reservation.status == 'completed',
                Reservation.check_out >= today_start
            )
            today_profit = float(today_reservations.with_entities(func.sum(Reservation.cost)).scalar() or 0)

            # ---- This Month ----
            month_reservations = Reservation.query.filter(
                Reservation.status == 'completed',
                Reservation.check_out >= month_start
            )
            month_profit = float(month_reservations.with_entities(func.sum(Reservation.cost)).scalar() or 0)

            # ---- Daily Average ----
            days_in_month = now.day
            daily_average = month_profit / days_in_month if days_in_month else 0

            # ---- Top Parking Lots with Avg Occupancy ----
            lots_data = db.session.query(
                ParkingLot.name.label('lot'),
                func.sum(Reservation.cost).label('revenue'),
                func.avg(
                    case((ParkingSpot.status == 'O', 100), else_=0)
                ).label('occupancy')
            ).join(ParkingSpot, ParkingSpot.lot_id == ParkingLot.id) \
             .outerjoin(Reservation, Reservation.spot_id == ParkingSpot.id) \
             .group_by(ParkingLot.name).order_by(desc('revenue')).limit(5).all()

            top_parking_lots = [{
                'lot': row.lot,
                'revenue': float(row.revenue or 0),
                'occupancy': float(row.occupancy or 0)
            } for row in lots_data]

            # ---- Top Users by Revenue ----
            users_data = db.session.query(
                User.id.label('user_id'),
                User.name,
                User.email,
                func.sum(Reservation.cost).label('total_spent')
            ).join(Reservation, Reservation.user_id == User.id) \
             .filter(Reservation.status == 'completed') \
             .group_by(User.id, User.name, User.email) \
             .order_by(desc('total_spent')).limit(5).all()

            top_users = [{
                'user_id': u.user_id,
                'name': u.name,
                'email': u.email,
                'total_spent': float(u.total_spent or 0)
            } for u in users_data]

            # ---- Total Vehicles ----
            total_vehicles = db.session.query(Reservation.vehicle_number).filter(
                Reservation.vehicle_number != None,
                Reservation.status == 'completed'
            ).distinct().count()

            # ---- Avg Duration ----
            durations = db.session.query(
                func.avg(func.strftime('%s', Reservation.check_out) - func.strftime('%s', Reservation.check_in))
            ).filter(
                Reservation.check_in != None,
                Reservation.check_out != None,
                Reservation.status == 'completed'
            ).scalar()
            durations = float(durations or 0)
            hours = int(durations // 3600)
            minutes = int((durations % 3600) // 60)
            avg_duration = f"{hours}h {minutes}m"

            # ---- Overall Occupancy ----
            total_spots = db.session.query(ParkingSpot).count()
            occupied_spots = db.session.query(ParkingSpot).filter(ParkingSpot.status == 'O').count()
            overall_occupancy = (occupied_spots / total_spots) * 100 if total_spots else 0

            return {
                'today_profit': today_profit,
                'month_profit': month_profit,
                'daily_average': round(daily_average, 2),
                'days_in_month': days_in_month,
                'top_parking_lots': top_parking_lots,
                'top_users': top_users,
                'total_vehicles': total_vehicles,
                'avg_duration': avg_duration,
                'overall_occupancy': round(overall_occupancy, 2)
            }, 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'message': 'Failed to generate analytics', 'error': str(e)}, 500
class AdminSummary(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        try:
            now = datetime.now(IST)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # ---- Today ----
            today_reservations = Reservation.query.filter(
                Reservation.status == 'completed',
                Reservation.check_out >= today_start
            )
            today_profit = float(today_reservations.with_entities(func.sum(Reservation.cost)).scalar() or 0)

            # ---- This Month ----
            month_reservations = Reservation.query.filter(
                Reservation.status == 'completed',
                Reservation.check_out >= month_start
            )
            month_profit = float(month_reservations.with_entities(func.sum(Reservation.cost)).scalar() or 0)

            # ---- Daily Average ----
            days_in_month = now.day
            daily_average = month_profit / days_in_month if days_in_month else 0

            # ---- Top Parking Lots with Avg Occupancy ----
            lots_data = db.session.query(
                ParkingLot.name.label('lot'),
                func.sum(Reservation.cost).label('revenue'),
                func.avg(
                    case((ParkingSpot.status == 'O', 100), else_=0)
                ).label('occupancy')
            ).join(ParkingSpot, ParkingSpot.lot_id == ParkingLot.id) \
             .outerjoin(Reservation, Reservation.spot_id == ParkingSpot.id) \
             .group_by(ParkingLot.name).order_by(desc('revenue')).limit(5).all()

            top_parking_lots = [{
                'lot': row.lot,
                'revenue': float(row.revenue or 0),
                'occupancy': float(row.occupancy or 0)
            } for row in lots_data]

            # ---- Top Users by Revenue ----
            users_data = db.session.query(
                User.id.label('user_id'),
                User.name,
                User.email,
                func.sum(Reservation.cost).label('total_spent')
            ).join(Reservation, Reservation.user_id == User.id) \
             .filter(Reservation.status == 'completed') \
             .group_by(User.id, User.name, User.email) \
             .order_by(desc('total_spent')).limit(5).all()

            top_users = [{
                'user_id': u.user_id,
                'name': u.name,
                'email': u.email,
                'total_spent': float(u.total_spent or 0)
            } for u in users_data]

            # ---- Total Vehicles ----
            total_vehicles = db.session.query(Reservation.vehicle_number).filter(
                Reservation.vehicle_number != None,
                Reservation.status == 'completed'
            ).distinct().count()

            # ---- Avg Duration ----
            durations = db.session.query(
                func.avg(func.strftime('%s', Reservation.check_out) - func.strftime('%s', Reservation.check_in))
            ).filter(
                Reservation.check_in != None,
                Reservation.check_out != None,
                Reservation.status == 'completed'
            ).scalar()
            durations = float(durations or 0)
            hours = int(durations // 3600)
            minutes = int((durations % 3600) // 60)
            avg_duration = f"{hours}h {minutes}m"

            # ---- Overall Occupancy ----
            total_spots = db.session.query(ParkingSpot).count()
            occupied_spots = db.session.query(ParkingSpot).filter(ParkingSpot.status == 'O').count()
            overall_occupancy = (occupied_spots / total_spots) * 100 if total_spots else 0

            # ---- Revenue by Lot (for chart) ----
            revenue_by_lot = db.session.query(
                ParkingLot.name.label('name'),
                func.sum(Reservation.cost).label('revenue')
            ).join(ParkingSpot, ParkingSpot.lot_id == ParkingLot.id) \
            .join(Reservation, Reservation.spot_id == ParkingSpot.id) \
            .filter(Reservation.status == 'completed') \
            .group_by(ParkingLot.name).all()

            revenue_chart_data = [{
                'name': r.name,
                'revenue': float(r.revenue or 0)
            } for r in revenue_by_lot]

            # ---- Occupancy Summary (for chart) ----
            occupancy_data = db.session.query(
                ParkingLot.name.label('lot'),
                func.count(ParkingSpot.id).label('total'),
                func.count(case((ParkingSpot.status == 'O', 1))).label('occupied')
            ).join(ParkingSpot, ParkingLot.id == ParkingSpot.lot_id) \
            .group_by(ParkingLot.name).all()

            occupancy_chart_data = [{
                'lot': row.lot,
                'occupied': row.occupied,
                'available': row.total - row.occupied
            } for row in occupancy_data]


            return {
                'today_profit': today_profit,
                'month_profit': month_profit,
                'daily_average': round(daily_average, 2),
                'days_in_month': days_in_month,
                'top_parking_lots': top_parking_lots,
                'top_users': top_users,
                'total_vehicles': total_vehicles,
                'avg_duration': avg_duration,
                'overall_occupancy': round(overall_occupancy, 2),
                'revenue_by_lot': revenue_chart_data,
                'occupancy_summary': occupancy_chart_data
            }, 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'message': 'Failed to generate analytics', 'error': str(e)}, 500





# Register resources
api.add_resource(ParkingLotResource, '/api/lots', '/api/lots/<int:lot_id>')
api.add_resource(ParkingSpotResource, '/api/spots/<int:spot_id>')
api.add_resource(CityListResource, '/api/cities')
api.add_resource(ReservationResource, '/api/reservations', '/api/reservations/<int:reservation_id>')
api.add_resource(UserBookingsResource, '/api/user/bookings')
api.add_resource(UserProfileResource, '/api/user/profile')
api.add_resource(AdminProfileResource, '/api/admin/profile')
api.add_resource(AdminUserProfileResource, '/api/admin/users')
api.add_resource(AdminUserDetail, '/api/admin/users/<int:user_id>')
api.add_resource(AdminReservationHistoryResource, '/api/admin/reservations')
api.add_resource(AdminUserBookings, '/api/admin/users/<int:user_id>/bookings')
api.add_resource(AdminProfitAnalytics, '/api/admin/profit-analytics')
api.add_resource(AdminSummary, '/api/admin/summary')



