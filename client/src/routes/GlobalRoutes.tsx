import React from 'react';
import { Route, Routes, Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import Login from '../auth/pages/Login';
import AdminRoutes from './AdminRoutes';

const GlobalRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth/login" element={<Login />} />

        {/* Protected Admin Routes (No Outlet) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Fallback routes */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default GlobalRoutes;