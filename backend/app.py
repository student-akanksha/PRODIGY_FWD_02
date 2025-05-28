from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import hashlib
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''  # Password must be a string
app.config['MYSQL_DB'] = 'employee_management'
app.config['SECRET_KEY'] = 'your-secret-key-here'

mysql = MySQL(app)

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            cur = mysql.connection.cursor()
            cur.execute('SELECT * FROM users WHERE id = %s', (data['user_id'],))
            current_user = cur.fetchone()
            cur.close()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    hashed_password = generate_password_hash(password)
    
    cur = mysql.connection.cursor()
    try:
        cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                   (username, email, hashed_password))
        mysql.connection.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cur.close()

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    auth = request.get_json()
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM users WHERE username = %s', (auth.get('username'),))
    user = cur.fetchone()
    cur.close()

    if not user:
        return jsonify({'message': 'User not found'}), 401

    # Verify password using the same hashing method as registration
    if not check_password_hash(user[3], auth.get('password')):  # Assuming password is the 4th column
        return jsonify({'message': 'Invalid password'}), 401

    # Generate token
    token = jwt.encode({
        'user_id': user[0],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])

    return jsonify({
        'token': token,
        'user': {
            'id': user[0],
            'username': user[1],
            'email': user[2]
        }
    })

# Get all employees
@app.route('/api/employees', methods=['GET'])
@token_required
def get_employees(current_user):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM employees")
    employees = cur.fetchall()
    cur.close()
    
    employee_list = []
    for employee in employees:
        employee_list.append({
            'id': employee[0],
            'name': employee[1],
            'position': employee[2],
            'department': employee[3],
            'email': employee[4],
            'phone': employee[5]
        })
    
    return jsonify(employee_list)

# Get single employee
@app.route('/api/employees/<int:id>', methods=['GET'])
@token_required
def get_employee(current_user, id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM employees WHERE id = %s", (id,))
    employee = cur.fetchone()
    cur.close()
    
    if employee:
        return jsonify({
            'id': employee[0],
            'name': employee[1],
            'position': employee[2],
            'department': employee[3],
            'email': employee[4],
            'phone': employee[5]
        })
    return jsonify({'message': 'Employee not found'}), 404

# Add new employee
@app.route('/api/employees', methods=['POST'])
@token_required
def add_employee(current_user):
    data = request.get_json()
    
    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            INSERT INTO employees (name, position, department, email, phone)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['name'], data['position'], data['department'], data['email'], data['phone']))
        mysql.connection.commit()
        return jsonify({'message': 'Employee added successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cur.close()

# Update employee
@app.route('/api/employees/<int:id>', methods=['PUT'])
@token_required
def update_employee(current_user, id):
    data = request.get_json()
    
    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            UPDATE employees
            SET name = %s, position = %s, department = %s, email = %s, phone = %s
            WHERE id = %s
        """, (data['name'], data['position'], data['department'], data['email'], data['phone'], id))
        mysql.connection.commit()
        return jsonify({'message': 'Employee updated successfully'})
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cur.close()

# Delete employee
@app.route('/api/employees/<int:id>', methods=['DELETE'])
@token_required
def delete_employee(current_user, id):
    cur = mysql.connection.cursor()
    try:
        cur.execute("DELETE FROM employees WHERE id = %s", (id,))
        mysql.connection.commit()
        return jsonify({'message': 'Employee deleted successfully'})
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cur.close()

# Get total employee count
@app.route('/api/employees/count', methods=['GET'])
@token_required
def get_employee_count(current_user):
    cur = mysql.connection.cursor()
    cur.execute("SELECT COUNT(*) FROM employees")
    count = cur.fetchone()[0]
    cur.close()
    return jsonify({'count': count})

# Get user profile
@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'username': current_user[1],  # Assuming username is at index 1
        'email': current_user[2]      # Assuming email is at index 2
    })

# Update user profile
@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    cur = mysql.connection.cursor()
    
    try:
        # If changing password
        if data.get('newPassword'):
            # Verify current password
            if not check_password_hash(current_user[3], data['currentPassword']):  # Assuming password hash is at index 3
                return jsonify({'message': 'Current password is incorrect'}), 400
            
            # Update username and password
            cur.execute("""
                UPDATE users 
                SET username = %s, password = %s
                WHERE id = %s
            """, (data['username'], generate_password_hash(data['newPassword']), current_user[0]))
        else:
            # Update only username
            cur.execute("""
                UPDATE users 
                SET username = %s
                WHERE id = %s
            """, (data['username'], current_user[0]))
        
        mysql.connection.commit()
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cur.close()

if __name__ == '__main__':
    app.run(debug=True)