import React, { useEffect, useState } from 'react';
import type { Item, ColumnDefinition } from '../../types';
import { getItems, createItem, deleteItem } from '../../api/itemsApi';
import { CustomInput, CustomSelect, CustomButton, CustomTable } from '../../utilities';

const uomOptions = [
  { value: 'NOS', label: 'NOS (Numbers)' },
  { value: 'PCS', label: 'PCS (Pieces)' },
  { value: 'KG', label: 'KG (Kilograms)' },
  { value: 'MTR', label: 'MTR (Meters)' },
  { value: 'BOX', label: 'BOX (Boxes)' },
  { value: 'SET', label: 'SET (Sets)' },
  { value: 'PKT', label: 'PKT (Packets)' },
];

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form fields
  const [itemCode, setItemCode] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [uom, setUom] = useState<string>('NOS');
  const [unitPrice, setUnitPrice] = useState<string>('0.00');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getItems();
      setItems(data);
    } catch (err: any) {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await createItem({
        item_code: itemCode.trim().toUpperCase(),
        item_name: itemName.trim(),
        uom: uom.trim().toUpperCase(),
        unit_price: parseFloat(unitPrice) || 0,
      });

      setMessage(`Item ${itemCode.toUpperCase()} created successfully!`);
      setItemCode('');
      setItemName('');
      setUom('NOS');
      setUnitPrice('0.00');
      fetchItems();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create item';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete item ID ${id}?`)) return;
    try {
      await deleteItem(id);
      setMessage(`Item ID ${id} deleted successfully`);
      fetchItems();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete item';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const itemColumns: ColumnDefinition<Item>[] = [
    {
      header: 'Item ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.item_id}</span>,
    },
    {
      header: 'Item Code',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.item_code}
        </span>
      ),
    },
    {
      header: 'Item Name',
      render: (row) => <span className="font-medium text-slate-800">{row.item_name}</span>,
    },
    {
      header: 'UOM',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
          {row.uom}
        </span>
      ),
    },
    {
      header: 'Unit Price ($)',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          ${parseFloat(String(row.unit_price)).toFixed(2)}
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
          onClick={() => handleDeleteItem(row.item_id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Item Master Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Catalog inventory items, standard units, and default sales pricing
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
          <span>Total Catalog Items:</span>
          <span className="font-bold text-indigo-600">{items.length}</span>
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

      {/* Add New Item Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add New Item</h2>
            <p className="text-xs text-slate-500">Specify SKU identifier, item name, measurement unit and standard rate</p>
          </div>
        </div>

        <form onSubmit={handleCreateItem}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="itemCode" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Item Code (SKU) *
              </label>
              <CustomInput
                id="itemCode"
                type="text"
                required
                maxLength={20}
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g. ITM-002"
              />
            </div>

            <div>
              <label htmlFor="itemName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Item Name *
              </label>
              <CustomInput
                id="itemName"
                type="text"
                required
                maxLength={100}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Ergonomic Keyboard"
              />
            </div>

            <div>
              <label htmlFor="uom" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Unit of Measure (UOM)
              </label>
              <CustomSelect
                id="uom"
                value={uom}
                options={uomOptions}
                onChange={(e) => setUom(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Unit Price ($) *
              </label>
              <CustomInput
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <CustomButton
              name={submitting ? 'Creating Item...' : 'Create Item'}
              type="submit"
              disabled={submitting}
              className="px-6"
            />
          </div>
        </form>
      </div>

      {/* Item Master List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Master Item Catalog</h2>
            <p className="text-xs text-slate-500">All registered items available for sales order line items</p>
          </div>
          <button
            onClick={fetchItems}
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
            Loading inventory items...
          </div>
        ) : (
          <CustomTable
            columns={itemColumns}
            data={items}
            keyExtractor={(row) => row.item_id}
            emptyMessage="No items found in the item master. Create your first item above."
          />
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
