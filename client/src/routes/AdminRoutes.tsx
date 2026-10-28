import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AdminLayout } from '../admin/AdminLayout';
import DashboardPage from '../admin/pages/DashboardPage';
import ItemsPage from '../admin/pages/ItemsPage';
import CustomersPage from '../admin/pages/CustomersPage';
import SalesOrdersPage from '../admin/pages/SalesOrdersPage';
import InvoicesPage from '../admin/pages/InvoicesPage';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        }
      />
      <Route
        path="dashboard"
        element={
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        }
      />
      <Route
        path="items"
        element={
          <AdminLayout>
            <ItemsPage />
          </AdminLayout>
        }
      />
      <Route
        path="customers"
        element={
          <AdminLayout>
            <CustomersPage />
          </AdminLayout>
        }
      />
      <Route
        path="sales"
        element={
          <AdminLayout>
            <SalesOrdersPage />
          </AdminLayout>
        }
      />
      <Route
        path="invoices"
        element={
          <AdminLayout>
            <InvoicesPage />
          </AdminLayout>
        }
      />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
