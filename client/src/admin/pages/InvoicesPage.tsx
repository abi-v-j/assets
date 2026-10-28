import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Invoice, SalesOrder, ColumnDefinition } from '../../types';
import { getInvoices, createInvoice, updateInvoicePaymentStatus } from '../../api/invoiceApi';
import { getSalesOrders } from '../../api/salesApi';
import { CustomInput, CustomSelect, CustomButton, CustomTable } from '../../utilities';

const paymentOptions = [
  { value: 'UNPAID', label: 'UNPAID' },
  { value: 'PARTIAL', label: 'PARTIAL' },
  { value: 'PAID', label: 'PAID' },
];

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [searchParams] = useSearchParams();

  // Form fields
  const [selectedSalesId, setSelectedSalesId] = useState<number>(0);
  const [invoiceNo, setInvoiceNo] = useState<string>(`INV-${Date.now().toString().slice(-4)}`);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [taxRate, setTaxRate] = useState<string>('0.05');
  const [paymentStatus, setPaymentStatus] = useState<string>('UNPAID');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, soData] = await Promise.all([
        getInvoices(),
        getSalesOrders(),
      ]);
      setInvoices(invData);
      setSalesOrders(soData);

      // Check URL query param for preselected sales order
      const paramSalesId = searchParams.get('sales_id');
      if (paramSalesId) {
        setSelectedSalesId(Number(paramSalesId));
      } else {
        // default to first uninvoiced sales order
        const uninvoiced = soData.find((so) => !so.has_invoice);
        if (uninvoiced) {
          setSelectedSalesId(uninvoiced.sales_id);
        }
      }
    } catch (err: any) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders that don't have invoices yet
  const uninvoicedOrders = salesOrders.filter((so) => !so.has_invoice);

  const selectedOrder = salesOrders.find((so) => so.sales_id === selectedSalesId);
  const subTotalPreview = selectedOrder ? parseFloat(String(selectedOrder.total_amount)) : 0;
  const taxPreview = subTotalPreview * (parseFloat(taxRate) || 0);
  const netPreview = subTotalPreview + taxPreview;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedSalesId) {
      setError('Please select an eligible sales order.');
      return;
    }

    setSubmitting(true);
    try {
      await createInvoice({
        sales_id: selectedSalesId,
        invoice_no: invoiceNo.trim().toUpperCase(),
        invoice_date: invoiceDate,
        tax_rate: parseFloat(taxRate) || 0.05,
        payment_status: paymentStatus,
      });

      setMessage(`Invoice ${invoiceNo} generated successfully!`);
      setInvoiceNo(`INV-${Date.now().toString().slice(-4)}`);
      loadData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create invoice';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePaymentStatus = async (invoiceId: number, status: string) => {
    try {
      await updateInvoicePaymentStatus(invoiceId, status);
      setMessage(`Invoice ID ${invoiceId} payment status updated to ${status}`);
      loadData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update payment status';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const salesOrderSelectOptions = [
    { value: '', label: '-- Choose Sales Order --' },
    ...uninvoicedOrders.map((so) => ({
      value: so.sales_id,
      label: `${so.sales_no} | ${so.customer_details?.customer_name} | Amount: $${parseFloat(String(so.total_amount)).toFixed(2)}`,
    })),
  ];

  const invoiceColumns: ColumnDefinition<Invoice>[] = [
    { header: 'Invoice ID', key: 'invoice_id' },
    {
      header: 'Invoice No',
      render: (row) => <strong>{row.invoice_no}</strong>,
    },
    { header: 'Date', key: 'invoice_date' },
    {
      header: 'Sales No',
      render: (row) => row.sales_no || `Order ${row.sales_id}`,
    },
    {
      header: 'Customer',
      render: (row) => row.customer_name || '-',
    },
    {
      header: 'Subtotal ($)',
      render: (row) => `$${parseFloat(String(row.sub_total)).toFixed(2)}`,
    },
    {
      header: 'Tax ($)',
      render: (row) => `$${parseFloat(String(row.tax_amount)).toFixed(2)}`,
    },
    {
      header: 'Net Amount ($)',
      render: (row) => <strong>${parseFloat(String(row.net_amount)).toFixed(2)}</strong>,
    },
    { header: 'Payment Status', key: 'payment_status' },
    {
      header: 'Update Payment',
      render: (row) => (
        <CustomSelect
          value={row.payment_status}
          options={paymentOptions}
          onChange={(e) => handleUpdatePaymentStatus(row.invoice_id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Invoices Management</h1>
      <p>Generate and manage official billing invoices in the <code>invoice</code> PostgreSQL table.</p>

      {message && <div><strong>Success: </strong>{message}</div>}
      {error && <div><strong>Error: </strong>{error}</div>}

      <hr />
      <h2>Generate New Invoice</h2>

      {uninvoicedOrders.length === 0 ? (
        <p>No pending sales orders available for invoicing. All sales orders have already been invoiced.</p>
      ) : (
        <form onSubmit={handleCreateInvoice}>
          <div>
            <label htmlFor="salesId">Select Sales Order:</label>
            <br />
            <CustomSelect
              id="salesId"
              required
              value={selectedSalesId}
              options={salesOrderSelectOptions}
              onChange={(e) => setSelectedSalesId(Number(e.target.value))}
            />
          </div>
          <br />
          <div>
            <label htmlFor="invoiceNo">Invoice Number (unique):</label>
            <br />
            <CustomInput
              id="invoiceNo"
              type="text"
              required
              maxLength={20}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="invoiceDate">Invoice Date:</label>
            <br />
            <CustomInput
              id="invoiceDate"
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="taxRate">Tax Rate (e.g., 0.05 for 5%, 0.18 for 18%):</label>
            <br />
            <CustomInput
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              required
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="paymentStatus">Payment Status:</label>
            <br />
            <CustomSelect
              id="paymentStatus"
              value={paymentStatus}
              options={paymentOptions}
              onChange={(e) => setPaymentStatus(e.target.value)}
            />
          </div>

          <br />
          <div>
            <strong>Calculation Breakdown Preview:</strong>
            <ul>
              <li>Subtotal: ${subTotalPreview.toFixed(2)}</li>
              <li>Tax ({(parseFloat(taxRate) * 100).toFixed(1)}%): ${taxPreview.toFixed(2)}</li>
              <li><strong>Net Invoice Total: ${netPreview.toFixed(2)}</strong></li>
            </ul>
          </div>

          <CustomButton
            name={submitting ? 'Generating Invoice...' : 'Generate Invoice'}
            type="submit"
            disabled={submitting}
          />
        </form>
      )}

      <hr />
      <h2>Invoices List ({invoices.length})</h2>
      {loading ? (
        <p>Loading invoices...</p>
      ) : (
        <CustomTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(row) => row.invoice_id}
          emptyMessage="No invoices generated yet."
        />
      )}
    </div>
  );
};

export default InvoicesPage;
