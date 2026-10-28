import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getItems } from '../../api/itemsApi';
import { getCustomers } from '../../api/customersApi';
import { getSalesOrders } from '../../api/salesApi';
import { getInvoices } from '../../api/invoiceApi';
import { CustomTable } from '../../utilities';
import type { ColumnDefinition } from '../../types';

interface StatRow {
  module: string;
  count: number;
  link: string;
  linkText: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    items: 0,
    customers: 0,
    sales: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      getItems().catch(() => []),
      getCustomers().catch(() => []),
      getSalesOrders().catch(() => []),
      getInvoices().catch(() => []),
    ]).then(([items, customers, sales, invoices]) => {
      setStats({
        items: items.length,
        customers: customers.length,
        sales: sales.length,
        invoices: invoices.length,
      });
      setLoading(false);
    });
  }, []);

  const statsColumns: ColumnDefinition<StatRow>[] = [
    { header: 'Module', key: 'module' },
    { header: 'Total Count', key: 'count' },
    {
      header: 'Quick Link',
      render: (row) => <Link to={row.link}>{row.linkText}</Link>,
    },
  ];

  const statsData: StatRow[] = [
    { module: 'Items in Master', count: stats.items, link: '/admin/items', linkText: 'Manage Items' },
    { module: 'Customers Registered', count: stats.customers, link: '/admin/customers', linkText: 'Manage Customers' },
    { module: 'Sales Orders Created', count: stats.sales, link: '/admin/sales', linkText: 'Manage Sales Orders' },
    { module: 'Invoices Generated', count: stats.invoices, link: '/admin/invoices', linkText: 'Manage Invoices' },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome back, <strong>{user?.full_name}</strong> ({user?.role})!</p>
      <p>Email: {user?.email}</p>

      <h2>System Statistics</h2>
      {loading ? (
        <p>Loading system statistics...</p>
      ) : (
        <CustomTable
          columns={statsColumns}
          data={statsData}
          keyExtractor={(row) => row.module}
        />
      )}

      <h2>Quick Operations</h2>
      <ul>
        <li><Link to="/admin/items">Add New Items to Item Master</Link></li>
        <li><Link to="/admin/customers">Register New Customers</Link></li>
        <li><Link to="/admin/sales">Create Sales Order with Multiple Line Items</Link></li>
        <li><Link to="/admin/invoices">Generate Invoices from Confirmed Orders</Link></li>
      </ul>
    </div>
  );
};

export default DashboardPage;
