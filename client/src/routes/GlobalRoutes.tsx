import React from 'react';
import { Route, Routes, Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import Login from '../auth/pages/Login';
import AdminRoutes from './AdminRoutes';
import HomePage from '../landing/pages/HomePage';
import About from '../landing/pages/About';
import Contact from '../landing/pages/Contact';

const GlobalRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}
        <Route path="/auth/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default GlobalRoutes;
