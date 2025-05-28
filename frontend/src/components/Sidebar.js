import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../App.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>EMS</h3>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-users"></i>
          <span>Employees</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-link logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar; 