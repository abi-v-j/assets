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
      setError('Failed to load invoices or orders');
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

      setMessage(`Invoice ${invoiceNo.toUpperCase()} generated successfully!`);
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
    { value: '', label: '-- Choose Confirmed Sales Order --' },
    ...uninvoicedOrders.map((so) => ({
      value: so.sales_id,
      label: `${so.sales_no} | ${so.customer_details?.customer_name || 'Customer'} | Amount: $${parseFloat(String(so.total_amount)).toFixed(2)}`,
    })),
  ];

  const invoiceColumns: ColumnDefinition<Invoice>[] = [
    {
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.invoice_id}</span>,
    },
    {
      header: 'Invoice No',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.invoice_no}
        </span>
      ),
    },
    {
      header: 'Invoice Date',
      render: (row) => <span className="text-xs text-slate-600">{row.invoice_date}</span>,
    },
    {
      header: 'Linked Order',
      render: (row) => (
        <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {row.sales_no || `Order #${row.sales_id}`}
        </span>
      ),
    },
    {
      header: 'Customer',
      render: (row) => <span className="font-medium text-slate-800">{row.customer_name || '-'}</span>,
    },
    {
      header: 'Subtotal ($)',
      render: (row) => (
        <span className="font-mono text-slate-600">
          ${parseFloat(String(row.sub_total)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Tax ($)',
      render: (row) => (
        <span className="font-mono text-slate-500 text-xs">
          ${parseFloat(String(row.tax_amount)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Net Total ($)',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          ${parseFloat(String(row.net_amount)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      render: (row) => {
        const isPaid = row.payment_status === 'PAID';
        const isPartial = row.payment_status === 'PARTIAL';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isPartial
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {row.payment_status}
          </span>
        );
      },
    },
    {
      header: 'Update Status',
      render: (row) => (
        <CustomSelect
          value={row.payment_status}
          options={paymentOptions}
          onChange={(e) => handleUpdatePaymentStatus(row.invoice_id, e.target.value)}
          className="w-32 py-1 text-xs"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices &amp; Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate official tax invoices, apply regional tax rates, and manage payment settlements
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
          <span>Invoices Generated:</span>
          <span className="font-bold text-indigo-600">{invoices.length}</span>
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

      {/* Generate Invoice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Generate New Tax Invoice</h2>
            <p className="text-xs text-slate-500">Transform sales orders into formal accounting invoices with automated tax</p>
          </div>
        </div>

        {uninvoicedOrders.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-500 text-sm">
            <p className="font-medium text-slate-700">No pending sales orders available for invoicing.</p>
            <p className="text-xs text-slate-400 mt-1">
              All active orders already have corresponding invoices issued.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="salesId" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Eligible Sales Order *
                </label>
                <CustomSelect
                  id="salesId"
                  required
                  value={selectedSalesId}
                  options={salesOrderSelectOptions}
                  onChange={(e) => setSelectedSalesId(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="invoiceNo" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Invoice Number *
                </label>
                <CustomInput
                  id="invoiceNo"
                  type="text"
                  required
                  maxLength={20}
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="invoiceDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Invoice Date *
                </label>
                <CustomInput
                  id="invoiceDate"
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="taxRate" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tax Rate (0.05 = 5%)
                </label>
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

              <div>
                <label htmlFor="paymentStatus" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Initial Status
                </label>
                <CustomSelect
                  id="paymentStatus"
                  value={paymentStatus}
                  options={paymentOptions}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                />
              </div>
            </div>

            {/* Financial Preview Summary Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Subtotal</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    ${subTotalPreview.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Tax ({(parseFloat(taxRate) * 100 || 0).toFixed(1)}%)
                  </span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    ${taxPreview.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">Net Payable</span>
                  <span className="text-xl font-extrabold text-indigo-700 font-mono">
                    ${netPreview.toFixed(2)}
                  </span>
                </div>
              </div>

              <CustomButton
                name={submitting ? 'Generating Invoice...' : 'Generate Invoice'}
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 font-semibold text-sm shadow-md w-full md:w-auto"
              />
            </div>
          </form>
        )}
      </div>

      {/* Invoices List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Generated Invoices Ledger</h2>
            <p className="text-xs text-slate-500">Official tax invoices recorded in database</p>
          </div>
          <button
            onClick={loadData}
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
            Loading invoices...
          </div>
        ) : (
          <CustomTable
            columns={invoiceColumns}
            data={invoices}
            keyExtractor={(row) => row.invoice_id}
            emptyMessage="No invoices generated yet. Create an invoice from an eligible sales order above."
          />
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
