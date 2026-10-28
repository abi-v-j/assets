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

      setMessage(`Customer ${customerCode} added successfully!`);
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
      setMessage(`Customer ${id} deleted successfully`);
      fetchCustomers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete customer';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const customerColumns: ColumnDefinition<Customer>[] = [
    { header: 'ID', key: 'customer_id' },
    {
      header: 'Customer Code',
      render: (row) => <strong>{row.customer_code}</strong>,
    },
    { header: 'Customer Name', key: 'customer_name' },
    {
      header: 'Phone',
      render: (row) => row.phone || '-',
    },
    {
      header: 'Email',
      render: (row) => row.email || '-',
    },
    {
      header: 'Address',
      render: (row) => row.address || '-',
    },
    {
      header: 'Active',
      render: (row) => (row.is_active ? 'Yes' : 'No'),
    },
    {
      header: 'Created At',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : '-'),
    },
    {
      header: 'Action',
      render: (row) => (
        <CustomButton
          name="Delete"
          onClick={() => handleDeleteCustomer(row.customer_id)}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Customer Master Management</h1>
      <p>Add and view client organizations stored in the <code>customer_master</code> PostgreSQL table.</p>

      {message && <div><strong>Success: </strong>{message}</div>}
      {error && <div><strong>Error: </strong>{error}</div>}

      <hr />
      <h2>Add New Customer</h2>
      <form onSubmit={handleCreateCustomer}>
        <div>
          <label htmlFor="customerCode">Customer Code (unique):</label>
          <br />
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
        <br />
        <div>
          <label htmlFor="customerName">Customer Name:</label>
          <br />
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
        <br />
        <div>
          <label htmlFor="phone">Phone Number:</label>
          <br />
          <CustomInput
            id="phone"
            type="tel"
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1-555-0123"
          />
        </div>
        <br />
        <div>
          <label htmlFor="email">Email Address:</label>
          <br />
          <CustomInput
            id="email"
            type="email"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@globex.com"
          />
        </div>
        <br />
        <div>
          <label htmlFor="address">Billing Address:</label>
          <br />
          <CustomTextarea
            id="address"
            rows={3}
            cols={40}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="456 Corporate Way, Tech Park"
          />
        </div>
        <br />
        <CustomButton
          name={submitting ? 'Adding Customer...' : 'Add Customer'}
          type="submit"
          disabled={submitting}
        />
      </form>

      <hr />
      <h2>Customer Master List ({customers.length})</h2>
      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <CustomTable
          columns={customerColumns}
          data={customers}
          keyExtractor={(row) => row.customer_id}
          emptyMessage="No customers found. Add a customer using the form above."
        />
      )}
    </div>
  );
};

export default CustomersPage;
