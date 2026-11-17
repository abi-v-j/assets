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
  description: string;
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
    {
      header: 'Module Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.module}</span>
          <p className="text-xs text-slate-400 mt-0.5">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Active Records',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {loading ? '...' : row.count} records
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <Link
          to={row.link}
          className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 gap-1 hover:underline"
        >
          {row.linkText} &rarr;
        </Link>
      ),
    },
  ];

  const statsData: StatRow[] = [
    {
      module: 'Item Master',
      count: stats.items,
      description: 'SKUs, pricing, units of measurement, catalog definitions',
      link: '/admin/items',
      linkText: 'Open Items',
    },
    {
      module: 'Customer Directory',
      count: stats.customers,
      description: 'Corporate client accounts, billing addresses, contacts',
      link: '/admin/customers',
      linkText: 'Open Customers',
    },
    {
      module: 'Sales Orders',
      count: stats.sales,
      description: 'Purchase orders, multi-item line reservations, order lifecycle',
      link: '/admin/sales',
      linkText: 'Open Sales',
    },
    {
      module: 'Invoices Ledger',
      count: stats.invoices,
      description: 'Generated tax invoices, payment statuses, financial accounts',
      link: '/admin/invoices',
      linkText: 'Open Invoices',
    },
  ];

  const kpis = [
    {
      label: 'Inventory Items',
      value: stats.items,
      link: '/admin/items',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: 'bg-indigo-50 border-indigo-100',
      badge: 'Master Catalog',
    },
    {
      label: 'Registered Customers',
      value: stats.customers,
      link: '/admin/customers',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50 border-emerald-100',
      badge: 'Active Accounts',
    },
    {
      label: 'Sales Orders',
      value: stats.sales,
      link: '/admin/sales',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      bg: 'bg-amber-50 border-amber-100',
      badge: 'Transactions',
    },
    {
      label: 'Generated Invoices',
      value: stats.invoices,
      link: '/admin/invoices',
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
      bg: 'bg-violet-50 border-violet-100',
      badge: 'Billing Ledger',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-medium text-indigo-200 mb-3">
            <span>Enterprise Session Active</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Administrator'}!
          </h1>
          <p className="mt-1 text-sm text-indigo-200 max-w-xl">
            You are logged in as <span className="font-semibold text-white">{user?.role}</span> ({user?.email}). All enterprise transactional services are running smoothly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/sales"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-md transition-colors"
          >
            + New Sales Order
          </Link>
          <Link
            to="/admin/items"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors border border-white/20"
          >
            Add New Item
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.link}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl border ${kpi.bg}`}>
                {kpi.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {kpi.badge}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                {loading ? '...' : kpi.value}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
              <span>View details</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Workflows / Pipeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-1">Enterprise Operations Pipeline</h2>
        <p className="text-xs text-slate-500 mb-6">Standard end-to-end transaction lifecycle across integrated modules</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Step 01</span>
            <h3 className="text-sm font-semibold text-slate-800">1. Item Master</h3>
            <p className="text-xs text-slate-500 mt-1">Register items with SKU codes, standard UOM, and unit prices.</p>
            <Link to="/admin/items" className="text-xs font-semibold text-indigo-600 mt-3 inline-block hover:underline">
              Manage Items &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Step 02</span>
            <h3 className="text-sm font-semibold text-slate-800">2. Customers</h3>
            <p className="text-xs text-slate-500 mt-1">Create client organizations, shipping information, and billing emails.</p>
            <Link to="/admin/customers" className="text-xs font-semibold text-emerald-600 mt-3 inline-block hover:underline">
              Manage Customers &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Step 03</span>
            <h3 className="text-sm font-semibold text-slate-800">3. Sales Orders</h3>
            <p className="text-xs text-slate-500 mt-1">Assemble orders with line items, calculate totals, and set status.</p>
            <Link to="/admin/sales" className="text-xs font-semibold text-amber-600 mt-3 inline-block hover:underline">
              Create Orders &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block mb-1">Step 04</span>
            <h3 className="text-sm font-semibold text-slate-800">4. Invoicing</h3>
            <p className="text-xs text-slate-500 mt-1">Convert confirmed orders into tax invoices and track payment states.</p>
            <Link to="/admin/invoices" className="text-xs font-semibold text-violet-600 mt-3 inline-block hover:underline">
              Billing Ledger &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Module Overview Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Database Module Status</h2>
            <p className="text-xs text-slate-500">Live counts synchronized directly from backend services</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Status: Connected</span>
        </div>

        <CustomTable
          columns={statsColumns}
          data={statsData}
          keyExtractor={(row) => row.module}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
