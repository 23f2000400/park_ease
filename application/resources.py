from flask_restful import Resource, reqparse, Api
from flask import request, jsonify
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from .database import db
from flask_security import auth_required, roles_required, current_user
from datetime import datetime
import math

api = Api()

def roles_list(roles):
    return [role.name for role in roles]

class ParkingLotResource(Resource):
    # Common parser for request data
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='Parking lot name is required')
    parser.add_argument('address', type=str, required=True)
    parser.add_argument('pincode', type=str, required=True)
    parser.add_argument('price', type=float, required=True)
    parser.add_argument('total_spots', type=int, required=True)

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Create a new parking lot"""
        args = self.parser.parse_args()
        
        try:
            new_lot = ParkingLot(
                name=args['name'],
                address=args['address'],
                pincode=args['pincode'],
                price=args['price'],
                total_spots=args['total_spots']
            )
            
            db.session.add(new_lot)
            db.session.commit()
            
            # Create the parking spots
            new_lot.create_spots()
            
            return {
                'message': 'Parking lot created successfully',
                'lot_id': new_lot.id
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 400

    @auth_required('token')
    def get(self, lot_id=None):
        """Get parking lot(s)"""
        if lot_id:
            lot = ParkingLot.query.get(lot_id)
            if not lot:
                return {'message': 'Parking lot not found'}, 404
                
            return jsonify({
                'id': lot.id,
                'name': lot.name,
                'address': lot.address,
                'pincode': lot.pincode,
                'price': lot.price,
                'total_spots': lot.total_spots,
                'available_spots': lot.spots.filter_by(status='A').count(),
                'created_at': lot.created_at.isoformat()
            })
        else:
            # Get all parking lots with availability info
            lots = ParkingLot.query.all()
            result = []
            for lot in lots:
                result.append({
                    'id': lot.id,
                    'name': lot.name,
                    'address': lot.address,
                    'price': lot.price,
                    'available_spots': lot.spots.filter_by(status='A').count(),
                    'total_spots': lot.total_spots
                })
            return jsonify(result)

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


# Register resources
api.add_resource(ParkingLotResource, '/api/lots', '/api/lots/<int:lot_id>')
api.add_resource(ParkingSpotResource, '/api/lots/<int:lot_id>/spots')
api.add_resource(ReservationResource, '/api/reservations', '/api/reservations/<int:reservation_id>')