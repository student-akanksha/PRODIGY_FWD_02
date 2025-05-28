import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../App.css';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = currentEmployee 
      ? `http://localhost:5000/api/employees/${currentEmployee.id}`
      : 'http://localhost:5000/api/employees';
    const method = currentEmployee ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchEmployees();
        toast.success(currentEmployee ? 'Employee updated successfully!' : 'Employee added successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Failed to save employee. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('An error occurred. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchEmployees();
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
        toast.success('Employee deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Failed to delete employee. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('An error occurred. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const confirmDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: ''
    });
    setCurrentEmployee(null);
  };

  return (
    <div className="employee-list-container">
      <div className="employee-header">
        <h2>Employees</h2>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i> Add Employee
        </button>
      </div>

      <div className="employee-grid">
        {employees.map(employee => (
          <div key={employee.id} className="employee-card">
            <div className="employee-card-header">
              <h3>{employee.name}</h3>
              <div className="employee-actions">
                <button 
                  className="btn-icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(employee);
                  }}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="btn-icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(employee);
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="employee-card-body">
              <p><i className="fas fa-briefcase"></i> {employee.position}</p>
              <p><i className="fas fa-building"></i> {employee.department}</p>
              <p><i className="fas fa-envelope"></i> {employee.email}</p>
              <p><i className="fas fa-phone"></i> {employee.phone}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">Select Position</option>
                  <option value="Developer">Developer</option>
                  <option value="Tester">Tester</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Enter department"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setFormData({
                      ...formData,
                      phone: value
                    });
                  }}
                  pattern="[0-9]{10}"
                  title="Please enter exactly 10 digits"
                  required
                  className="form-control"
                  placeholder="Enter 10-digit phone number"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && employeeToDelete && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {employeeToDelete.name}?</p>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setEmployeeToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => handleDelete(employeeToDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList; 