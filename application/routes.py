import uuid

from flask_login import logout_user
from .database import db
from flask import current_app as app, jsonify, render_template, request
from flask_security import login_required, auth_required, roles_required, current_user, hash_password, login_user as slogin_user
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash


@app.route('/', methods=['GET'])
def index():
    """Home route."""
    return render_template('index.html')

@app.route('/admin')
@auth_required('token')  # Ensure only admin can access this route
@roles_required('admin')
def admin_dashboard():
    """Admin dashboard route."""
    return "<h1>Welcome to the Admin Dashboard!</h1>"

#app.route('/user')
@app.route('/user')
@auth_required('token')  # Ensure only authenticated users can access this route
@roles_required('user')
def user_dashboard():
    """User dashboard route."""
    return jsonify({"name": current_user.name, "email": current_user.email, "phone": current_user.phone}), 200
 
@app.route('/api/register', methods=['POST'])
def register_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email=credentials['email']) or not app.security.datastore.find_user(username=credentials['username']):
            app.security.datastore.create_user(
                email= credentials['email'],
                name= credentials['name'], 
                username= credentials['username'], 
                password= generate_password_hash(credentials['password']),
                roles= ['user'],  # Use the role object
                phone= credentials['phone'],
                active=True,
                fs_uniquifier=str(uuid.uuid4())
            )
            db.session.commit()
            return jsonify({"message": "User registered successfully"}), 201
    else:
        return jsonify({"message": "User already exists"}), 400

@app.route('/api/login', methods=['POST'])
def login_user():
    credentials = request.get_json()
    email = credentials['email']
    password = credentials['password']

    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400
    
    user = app.security.datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user:
        if check_password_hash(user.password, password):
            # if current_user:
            #     return jsonify({"message": "Already logged in"}), 400
            slogin_user(user)
            return jsonify({"id":user.id,
                            "username": user.username,
                            "auth-token":user.get_auth_token(),
                            "name":user.name,
                                "roles": [role.name for role in user.roles]  # Return a list of roles
                }), 200
        else:
            return jsonify({"message": "Invalid password"}), 401
        
@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out"}), 200

@app.route('/api/user/home', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_user_info():
    """Get the current user's information."""
    if not current_user.is_authenticated:
        return jsonify({"message": "User is not logged in"}), 401
    
    user = current_user
    return jsonify({
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "roles": [role.name for role in user.roles],  # Return a list of roles
        "active": user.active
    }), 200
@app.route('/api/admin/home', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_admin_info():
    """Get the current user's information."""
    if not current_user.is_authenticated:
        return jsonify({"message": "User is not logged in"}), 401
    
    user = current_user
    return jsonify({
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "roles": [role.name for role in user.roles],  # Return a list of roles
        "active": user.active
    }), 200