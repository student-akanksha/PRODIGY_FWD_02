import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Dashboard() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch employee count
    fetch('http://localhost:5000/api/employees/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setEmployeeCount(data.count))
      .catch(err => console.error('Error fetching employee count:', err));
  }, [navigate]);

  const handleEmployeeCardClick = () => {
    navigate('/employees');
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>
      <div className="dashboard-cards">
        <div className="card employee-card" onClick={handleEmployeeCardClick}>
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="card-info">
            <h3>Total Employees</h3>
            <p>{employeeCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="card-info">
            <h3>Departments</h3>
            <p>5</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="card-info">
            <h3>Active Projects</h3>
            <p>3</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 