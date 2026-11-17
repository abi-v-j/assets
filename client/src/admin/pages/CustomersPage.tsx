import React, { useEffect, useState } from 'react';
import type { Customer, ColumnDefinition } from '../../types';
import { getCustomers, createCustomer, deleteCustomer } from '../../api/customersApi';
import { CustomInput, CustomTextarea, CustomButton, CustomTable } from '../../utilities';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form fields
  const [customerCode, setCustomerCode] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await createCustomer({
        customer_code: customerCode.trim().toUpperCase(),
        customer_name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      setMessage(`Customer ${customerCode.toUpperCase()} added successfully!`);
      setCustomerCode('');
      setCustomerName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchCustomers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create customer';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete customer ID ${id}?`)) return;
    try {
      await deleteCustomer(id);
      setMessage(`Customer ID ${id} deleted successfully`);
      fetchCustomers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete customer';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const customerColumns: ColumnDefinition<Customer>[] = [
    {
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.customer_id}</span>,
    },
    {
      header: 'Customer Code',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.customer_code}
        </span>
      ),
    },
    {
      header: 'Organization Name',
      render: (row) => <span className="font-semibold text-slate-800">{row.customer_name}</span>,
    },
    {
      header: 'Phone',
      render: (row) => (
        <span className="text-slate-600 text-xs">
          {row.phone ? row.phone : <span className="text-slate-400 italic">None</span>}
        </span>
      ),
    },
    {
      header: 'Email',
      render: (row) => (
        <span className="text-slate-600 text-xs font-mono">
          {row.email ? row.email : <span className="text-slate-400 italic">None</span>}
        </span>
      ),
    },
    {
      header: 'Address',
      render: (row) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block" title={row.address || ''}>
          {row.address || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              row.is_active ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          ></span>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created At',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <CustomButton
          name="Delete"
          size="sm"
          variant="danger"
          onClick={() => handleDeleteCustomer(row.customer_id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage client accounts, contact profiles, and billing configurations
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
          <span>Registered Organizations:</span>
          <span className="font-bold text-indigo-600">{customers.length}</span>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Add New Customer Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Register New Customer</h2>
            <p className="text-xs text-slate-500">Add client details for invoicing and order dispatching</p>
          </div>
        </div>

        <form onSubmit={handleCreateCustomer}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="customerCode" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Customer Code *
              </label>
              <CustomInput
                id="customerCode"
                type="text"
                required
                maxLength={20}
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder="e.g. CUST-002"
              />
            </div>

            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Organization / Name *
              </label>
              <CustomInput
                id="customerName"
                type="text"
                required
                maxLength={150}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Globex Global Inc."
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <CustomInput
                id="phone"
                type="tel"
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0123"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <CustomInput
                id="email"
                type="email"
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@globex.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Billing &amp; Delivery Address
            </label>
            <CustomTextarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 456 Corporate Way, Suite 300, San Francisco, CA"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <CustomButton
              name={submitting ? 'Registering Customer...' : 'Add Customer'}
              type="submit"
              disabled={submitting}
              className="px-6"
            />
          </div>
        </form>
      </div>

      {/* Customers List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Customer Master Directory</h2>
            <p className="text-xs text-slate-500">All registered organizations eligible for sales orders</p>
          </div>
          <button
            onClick={fetchCustomers}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading customer list...
          </div>
        ) : (
          <CustomTable
            columns={customerColumns}
            data={customers}
            keyExtractor={(row) => row.customer_id}
            emptyMessage="No customers found in master directory. Register your first customer above."
          />
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
