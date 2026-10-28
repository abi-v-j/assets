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

      setMessage(`Sales order ${salesNo} created successfully!`);
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
      setMessage(`Order ID ${id} status changed to ${newStatus}`);
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
    label: `${itm.item_code} - ${itm.item_name} (${itm.uom})`,
  }));

  // Column definitions for order line items in creation form
  const dynamicLineColumns: ColumnDefinition<LineItemFormState>[] = [
    {
      header: 'Line #',
      render: (_, index) => index + 1,
    },
    {
      header: 'Select Item',
      render: (line, index) => (
        <CustomSelect
          value={line.item_id}
          options={itemOptions}
          onChange={(e) => handleLineItemChange(index, Number(e.target.value))}
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
        />
      ),
    },
    {
      header: 'Line Amount ($)',
      render: (line) => `$${((line.quantity || 0) * (line.unit_price || 0)).toFixed(2)}`,
    },
    {
      header: 'Action',
      render: (_, index) => (
        <CustomButton
          name="Remove"
          onClick={() => handleRemoveLine(index)}
        />
      ),
    },
  ];

  // Column definitions for main sales orders list table
  const salesOrderColumns: ColumnDefinition<SalesOrder>[] = [
    { header: 'ID', key: 'sales_id' },
    {
      header: 'Sales No',
      render: (row) => <strong>{row.sales_no}</strong>,
    },
    { header: 'Date', key: 'sales_date' },
    {
      header: 'Customer',
      render: (row) =>
        row.customer_details
          ? `${row.customer_details.customer_name} (${row.customer_details.customer_code})`
          : `Customer ID ${row.sales_id}`,
    },
    {
      header: 'Total Amount ($)',
      render: (row) => `$${parseFloat(String(row.total_amount)).toFixed(2)}`,
    },
    {
      header: 'Status',
      render: (row) => (
        <div>
          <strong>{row.status}</strong>{' '}
          {row.status === 'DRAFT' && (
            <CustomButton
              name="Confirm"
              onClick={() => handleStatusUpdate(row.sales_id, 'CONFIRMED')}
            />
          )}
          {row.status === 'CONFIRMED' && (
            <CustomButton
              name="Cancel"
              onClick={() => handleStatusUpdate(row.sales_id, 'CANCELLED')}
            />
          )}
        </div>
      ),
    },
    {
      header: 'Invoiced?',
      render: (row) =>
        row.has_invoice ? (
          <span>Yes ({row.invoice_no})</span>
        ) : (
          <span>
            No{' '}
            <Link to={`/admin/invoices?sales_id=${row.sales_id}&sales_no=${row.sales_no}`}>
              [Create Invoice]
            </Link>
          </span>
        ),
    },
    {
      header: 'Line Items',
      render: (row) => (
        <div>
          {row.lines ? `${row.lines.length} lines` : '-'}{' '}
          <CustomButton
            name="View Lines"
            onClick={() => setSelectedOrder(row)}
          />
        </div>
      ),
    },
    {
      header: 'Remarks',
      render: (row) => (row.remarks ? <small>{row.remarks}</small> : '-'),
    },
  ];

  // Column definitions for selected order detail line items
  const selectedOrderLineColumns: ColumnDefinition<SalesDetailItem>[] = [
    { header: 'Line #', key: 'line_no' },
    {
      header: 'Item Code',
      render: (row) => row.item_details?.item_code || row.item_id,
    },
    {
      header: 'Item Name',
      render: (row) => row.item_details?.item_name || '-',
    },
    {
      header: 'UOM',
      render: (row) => row.item_details?.uom || '-',
    },
    { header: 'Quantity', key: 'quantity' },
    {
      header: 'Unit Price ($)',
      render: (row) => `$${parseFloat(String(row.unit_price)).toFixed(2)}`,
    },
    {
      header: 'Line Amount ($)',
      render: (row) => `$${parseFloat(String(row.line_amount)).toFixed(2)}`,
    },
  ];

  return (
    <div>
      <h1>Sales Orders Management</h1>
      <p>Create and manage sales orders with line items in <code>sales_header</code> and <code>sales_details</code>.</p>

      {message && <div><strong>Success: </strong>{message}</div>}
      {error && <div><strong>Error: </strong>{error}</div>}

      <hr />
      <h2>Create New Sales Order</h2>

      {customers.length === 0 || items.length === 0 ? (
        <div>
          <p><strong>Notice:</strong> You need at least one customer and one item to create a sales order.</p>
          <ul>
            {customers.length === 0 && <li><Link to="/admin/customers">Add Customer First</Link></li>}
            {items.length === 0 && <li><Link to="/admin/items">Add Item First</Link></li>}
          </ul>
        </div>
      ) : (
        <form onSubmit={handleCreateOrder}>
          <div>
            <label htmlFor="salesNo">Sales Order Number (unique):</label>
            <br />
            <CustomInput
              id="salesNo"
              type="text"
              required
              maxLength={20}
              value={salesNo}
              onChange={(e) => setSalesNo(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="salesDate">Sales Date:</label>
            <br />
            <CustomInput
              id="salesDate"
              type="date"
              required
              value={salesDate}
              onChange={(e) => setSalesDate(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="customerId">Select Customer:</label>
            <br />
            <CustomSelect
              id="customerId"
              required
              value={customerId}
              options={customerOptions}
              onChange={(e) => setCustomerId(Number(e.target.value))}
            />
          </div>
          <br />
          <div>
            <label htmlFor="orderStatus">Initial Status:</label>
            <br />
            <CustomSelect
              id="orderStatus"
              value={orderStatus}
              options={orderStatusOptions}
              onChange={(e) => setOrderStatus(e.target.value)}
            />
          </div>
          <br />
          <div>
            <label htmlFor="remarks">Remarks:</label>
            <br />
            <CustomInput
              id="remarks"
              type="text"
              maxLength={250}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Expedited delivery requested"
            />
          </div>

          <br />
          <h3>Order Line Items</h3>
          <CustomTable
            columns={dynamicLineColumns}
            data={lines}
            keyExtractor={(_, index) => index}
            cellPadding={6}
          />

          <br />
          <CustomButton
            name="+ Add Another Line Item"
            onClick={handleAddLine}
          />
          <br />
          <br />
          <p>
            <strong>Order Total Preview: ${calculatedTotal.toFixed(2)}</strong>
          </p>

          <CustomButton
            name={submitting ? 'Creating Sales Order...' : 'Submit Sales Order'}
            type="submit"
            disabled={submitting}
          />
        </form>
      )}

      <hr />
      <h2>Sales Orders List ({salesOrders.length})</h2>
      {loading ? (
        <p>Loading sales orders...</p>
      ) : (
        <CustomTable
          columns={salesOrderColumns}
          data={salesOrders}
          keyExtractor={(row) => row.sales_id}
          emptyMessage="No sales orders created yet."
        />
      )}

      {selectedOrder && (
        <div>
          <hr />
          <h3>Order Details: {selectedOrder.sales_no}</h3>
          <p>
            Customer: <strong>{selectedOrder.customer_details?.customer_name}</strong> |{' '}
            Date: <strong>{selectedOrder.sales_date}</strong> |{' '}
            Status: <strong>{selectedOrder.status}</strong> |{' '}
            Total: <strong>${parseFloat(String(selectedOrder.total_amount)).toFixed(2)}</strong>
          </p>
          <CustomTable
            columns={selectedOrderLineColumns}
            data={selectedOrder.lines || []}
            keyExtractor={(row, index) => row.sales_detail_id || row.line_no || index}
            cellPadding={6}
          />
          <br />
          <CustomButton
            name="Close Details"
            onClick={() => setSelectedOrder(null)}
          />
        </div>
      )}
    </div>
  );
};

export default SalesOrdersPage;
