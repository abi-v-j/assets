import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { CustomButton } from '../utilities';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div>
      <header>
        <h2>Enterprise Management System</h2>
        <nav>
          <Link to="/admin/dashboard">Dashboard</Link>
          {' | '}
          <Link to="/admin/items">Item Master</Link>
          {' | '}
          <Link to="/admin/customers">Customer Master</Link>
          {' | '}
          <Link to="/admin/sales">Sales Orders</Link>
          {' | '}
          <Link to="/admin/invoices">Invoices</Link>
          {' | '}
          <span>Logged in as: <strong>{user?.email}</strong> ({user?.role})</span>
          {' '}
          <CustomButton name="Logout" onClick={handleLogout} />
        </nav>
        <hr />
      </header>

      <main>
        {children}
      </main>

      <footer>
        <hr />
        <p><small>Enterprise Multi-National Architecture &copy; 2026. PostgreSQL Stored Procedures + Django REST + React.</small></p>
      </footer>
    </div>
  );
};
