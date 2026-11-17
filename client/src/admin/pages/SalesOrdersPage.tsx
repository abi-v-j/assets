import React, { useEffect, useState } from 'react';
import type { SalesOrder, Customer, Item, LineItemFormState, ColumnDefinition, SalesDetailItem } from '../../types';
import { getSalesOrders, createSalesOrder, updateSalesStatus } from '../../api/salesApi';
import { getCustomers } from '../../api/customersApi';
import { getItems } from '../../api/itemsApi';
import { CustomInput, CustomSelect, CustomButton, CustomTable } from '../../utilities';
import { Link } from 'react-router';

const orderStatusOptions = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'CONFIRMED', label: 'CONFIRMED' },
];

const SalesOrdersPage: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Selected order for viewing details
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // Form state
  const [salesNo, setSalesNo] = useState<string>(`SO-${Date.now().toString().slice(-4)}`);
  const [salesDate, setSalesDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<number>(0);
  const [orderStatus, setOrderStatus] = useState<string>('CONFIRMED');
  const [remarks, setRemarks] = useState<string>('');
  const [lines, setLines] = useState<LineItemFormState[]>([
    { item_id: 0, quantity: 1, unit_price: 0 },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, customersData, itemsData] = await Promise.all([
        getSalesOrders(),
        getCustomers(),
        getItems(),
      ]);
      setSalesOrders(ordersData);
      setCustomers(customersData);
      setItems(itemsData);
      if (customersData.length > 0 && customerId === 0) {
        setCustomerId(customersData[0].customer_id);
      }
      if (itemsData.length > 0 && lines[0].item_id === 0) {
        setLines([{ item_id: itemsData[0].item_id, quantity: 1, unit_price: parseFloat(String(itemsData[0].unit_price)) || 0 }]);
      }
    } catch (err: any) {
      setError('Failed to load sales or master data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddLine = () => {
    const defaultItem = items[0];
    setLines([
      ...lines,
      {
        item_id: defaultItem ? defaultItem.item_id : 0,
        quantity: 1,
        unit_price: defaultItem ? parseFloat(String(defaultItem.unit_price)) || 0 : 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      alert('A sales order must have at least one line item.');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, itemId: number) => {
    const matchedItem = items.find((itm) => itm.item_id === itemId);
    const updated = [...lines];
    updated[index].item_id = itemId;
    if (matchedItem) {
      updated[index].unit_price = parseFloat(String(matchedItem.unit_price)) || 0;
    }
    setLines(updated);
  };

  const handleLineQtyChange = (index: number, qty: number) => {
    const updated = [...lines];
    updated[index].quantity = qty;
    setLines(updated);
  };

  const handleLinePriceChange = (index: number, price: number) => {
    const updated = [...lines];
    updated[index].unit_price = price;
    setLines(updated);
  };

  // Calculate order total preview
  const calculatedTotal = lines.reduce((acc, curr) => {
    return acc + (curr.quantity || 0) * (curr.unit_price || 0);
  }, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (lines.some((l) => !l.item_id || l.quantity <= 0)) {
      setError('All line items must have a valid item selected and quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      await createSalesOrder({
        sales_no: salesNo.trim().toUpperCase(),
        sales_date: salesDate,
        customer_id: customerId,
        status: orderStatus,
        remarks: remarks.trim(),
        lines: lines.map((l) => ({
          item_id: Number(l.item_id),
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
        })),
      });

      setMessage(`Sales order ${salesNo.toUpperCase()} created successfully!`);
      setSalesNo(`SO-${Date.now().toString().slice(-4)}`);
      setRemarks('');
      loadData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create sales order';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await updateSalesStatus(id, newStatus);
      setMessage(`Order ID ${id} status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update order status';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const customerOptions = customers.map((c) => ({
    value: c.customer_id,
    label: `${c.customer_code} - ${c.customer_name}`,
  }));

  const itemOptions = items.map((itm) => ({
    value: itm.item_id,
    label: `${itm.item_code} - ${itm.item_name} (${itm.uom}) - $${parseFloat(String(itm.unit_price)).toFixed(2)}`,
  }));

  // Column definitions for order line items in creation form
  const dynamicLineColumns: ColumnDefinition<LineItemFormState>[] = [
    {
      header: '#',
      render: (_, index) => <span className="font-mono text-xs text-slate-500">{index + 1}</span>,
    },
    {
      header: 'Select Item',
      render: (line, index) => (
        <CustomSelect
          value={line.item_id}
          options={itemOptions}
          onChange={(e) => handleLineItemChange(index, Number(e.target.value))}
          className="min-w-[220px]"
        />
      ),
    },
    {
      header: 'Quantity',
      render: (line, index) => (
        <CustomInput
          type="number"
          min="0.001"
          step="1"
          value={line.quantity}
          onChange={(e) => handleLineQtyChange(index, parseFloat(e.target.value) || 0)}
          className="w-24 text-right"
        />
      ),
    },
    {
      header: 'Unit Price ($)',
      render: (line, index) => (
        <CustomInput
          type="number"
          min="0"
          step="0.01"
          value={line.unit_price}
          onChange={(e) => handleLinePriceChange(index, parseFloat(e.target.value) || 0)}
          className="w-28 text-right font-mono"
        />
      ),
    },
    {
      header: 'Line Total ($)',
      render: (line) => (
        <span className="font-semibold text-slate-800 font-mono">
          ${((line.quantity || 0) * (line.unit_price || 0)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (_, index) => (
        <CustomButton
          name="Remove"
          size="sm"
          variant="danger"
          onClick={() => handleRemoveLine(index)}
        />
      ),
    },
  ];

  // Column definitions for main sales orders list table
  const salesOrderColumns: ColumnDefinition<SalesOrder>[] = [
    {
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.sales_id}</span>,
    },
    {
      header: 'Sales Order No',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.sales_no}
        </span>
      ),
    },
    {
      header: 'Order Date',
      render: (row) => <span className="text-xs text-slate-600">{row.sales_date}</span>,
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">
            {row.customer_details ? row.customer_details.customer_name : `Customer ID ${row.sales_id}`}
          </span>
          {row.customer_details && (
            <span className="block text-[11px] text-slate-400 font-mono">
              {row.customer_details.customer_code}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Total ($)',
      render: (row) => (
        <span className="font-bold text-slate-900 font-mono">
          ${parseFloat(String(row.total_amount)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const isConfirmed = row.status === 'CONFIRMED';
        const isDraft = row.status === 'DRAFT';
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                isConfirmed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDraft
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {row.status}
            </span>
            {isDraft && (
              <CustomButton
                name="Confirm"
                size="sm"
                variant="success"
                onClick={() => handleStatusUpdate(row.sales_id, 'CONFIRMED')}
              />
            )}
            {isConfirmed && (
              <CustomButton
                name="Cancel"
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row.sales_id, 'CANCELLED')}
              />
            )}
          </div>
        );
      },
    },
    {
      header: 'Invoiced Status',
      render: (row) =>
        row.has_invoice ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {row.invoice_no || 'Invoiced'}
          </span>
        ) : (
          <Link
            to={`/admin/invoices?sales_id=${row.sales_id}&sales_no=${row.sales_no}`}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline gap-1"
          >
            <span>+ Create Invoice</span>
          </Link>
        ),
    },
    {
      header: 'Lines',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {row.lines ? `${row.lines.length} lines` : '-'}
          </span>
          <CustomButton
            name="View"
            size="sm"
            variant="secondary"
            onClick={() => setSelectedOrder(row)}
          />
        </div>
      ),
    },
    {
      header: 'Remarks',
      render: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-[140px] block" title={row.remarks || ''}>
          {row.remarks || '-'}
        </span>
      ),
    },
  ];

  // Column definitions for selected order detail line items
  const selectedOrderLineColumns: ColumnDefinition<SalesDetailItem>[] = [
    {
      header: 'Line #',
      render: (row) => <span className="font-mono text-xs">{row.line_no}</span>,
    },
    {
      header: 'Item Code',
      render: (row) => (
        <span className="font-mono font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {row.item_details?.item_code || row.item_id}
        </span>
      ),
    },
    {
      header: 'Item Name',
      render: (row) => <span className="font-medium text-slate-800">{row.item_details?.item_name || '-'}</span>,
    },
    {
      header: 'UOM',
      render: (row) => <span className="text-xs text-slate-600 font-semibold">{row.item_details?.uom || '-'}</span>,
    },
    {
      header: 'Quantity',
      render: (row) => <span className="font-mono text-slate-800 font-semibold">{row.quantity}</span>,
    },
    {
      header: 'Unit Price ($)',
      render: (row) => (
        <span className="font-mono text-slate-700">
          ${parseFloat(String(row.unit_price)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Line Amount ($)',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          ${parseFloat(String(row.line_amount)).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Orders Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create multi-line sales orders, track fulfillment states, and generate invoices
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
          <span>Total Orders:</span>
          <span className="font-bold text-indigo-600">{salesOrders.length}</span>
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

      {/* Create Order Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Create New Sales Order</h2>
            <p className="text-xs text-slate-500">Construct order with dynamic item lines and automated pricing</p>
          </div>
        </div>

        {customers.length === 0 || items.length === 0 ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-amber-800 text-sm">
            <div className="font-semibold flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prerequisites Needed
            </div>
            <p className="text-xs text-amber-700 mb-3">
              You must register at least one customer and one item in the system before creating sales orders.
            </p>
            <div className="flex gap-3">
              {customers.length === 0 && (
                <Link to="/admin/customers" className="text-xs font-semibold text-amber-900 underline">
                  &rarr; Register Customer
                </Link>
              )}
              {items.length === 0 && (
                <Link to="/admin/items" className="text-xs font-semibold text-amber-900 underline">
                  &rarr; Add Inventory Item
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateOrder} className="space-y-6">
            {/* Header Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="salesNo" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Order Number *
                </label>
                <CustomInput
                  id="salesNo"
                  type="text"
                  required
                  maxLength={20}
                  value={salesNo}
                  onChange={(e) => setSalesNo(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="salesDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sales Date *
                </label>
                <CustomInput
                  id="salesDate"
                  type="date"
                  required
                  value={salesDate}
                  onChange={(e) => setSalesDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="customerId" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Customer *
                </label>
                <CustomSelect
                  id="customerId"
                  required
                  value={customerId}
                  options={customerOptions}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="orderStatus" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Initial Status
                </label>
                <CustomSelect
                  id="orderStatus"
                  value={orderStatus}
                  options={orderStatusOptions}
                  onChange={(e) => setOrderStatus(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Remarks / Delivery Instructions
              </label>
              <CustomInput
                id="remarks"
                type="text"
                maxLength={250}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Express shipping requested, deliver to Bay 4"
              />
            </div>

            {/* Dynamic Lines Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Order Line Items</h3>
                <CustomButton
                  name="+ Add Another Item"
                  size="sm"
                  variant="outline"
                  onClick={handleAddLine}
                />
              </div>

              <CustomTable
                columns={dynamicLineColumns}
                data={lines}
                keyExtractor={(_, index) => index}
              />
            </div>

            {/* Order Total Callout Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Order Subtotal Estimate</span>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  ${calculatedTotal.toFixed(2)}
                </p>
              </div>

              <CustomButton
                name={submitting ? 'Creating Order...' : 'Submit Sales Order'}
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 font-semibold text-sm shadow-md"
              />
            </div>
          </form>
        )}
      </div>

      {/* Sales Orders List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Sales Orders History</h2>
            <p className="text-xs text-slate-500">Review status, lines, and billable orders</p>
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
            Loading sales orders...
          </div>
        ) : (
          <CustomTable
            columns={salesOrderColumns}
            data={salesOrders}
            keyExtractor={(row) => row.sales_id}
            emptyMessage="No sales orders recorded yet. Submit your first order above."
          />
        )}
      </div>

      {/* Selected Order Lines Detail Drawer / Modal */}
      {selectedOrder && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedOrder.sales_no}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <strong>{selectedOrder.customer_details?.customer_name}</strong> | Date: <strong>{selectedOrder.sales_date}</strong> | Total: <strong className="text-slate-900">${parseFloat(String(selectedOrder.total_amount)).toFixed(2)}</strong>
              </p>
            </div>
            <CustomButton
              name="Close Lines View"
              size="sm"
              variant="secondary"
              onClick={() => setSelectedOrder(null)}
            />
          </div>

          <div className="mt-4">
            <CustomTable
              columns={selectedOrderLineColumns}
              data={selectedOrder.lines || []}
              keyExtractor={(row, index) => row.sales_detail_id || row.line_no || index}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrdersPage;
