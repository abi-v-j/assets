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

      setMessage(`Item ${itemCode} created successfully!`);
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
      setMessage(`Item ${id} deleted successfully`);
      fetchItems();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete item';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const itemColumns: ColumnDefinition<Item>[] = [
    { header: 'Item ID', key: 'item_id' },
    {
      header: 'Item Code',
      render: (row) => <strong>{row.item_code}</strong>,
    },
    { header: 'Item Name', key: 'item_name' },
    { header: 'UOM', key: 'uom' },
    {
      header: 'Unit Price ($)',
      render: (row) => `$${parseFloat(String(row.unit_price)).toFixed(2)}`,
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
          onClick={() => handleDeleteItem(row.item_id)}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Item Master Management</h1>
      <p>Add and view inventory items stored in the <code>item_master</code> PostgreSQL table.</p>

      {message && <div><strong>Success: </strong>{message}</div>}
      {error && <div><strong>Error: </strong>{error}</div>}

      <hr />
      <h2>Add New Item</h2>
      <form onSubmit={handleCreateItem}>
        <div>
          <label htmlFor="itemCode">Item Code (unique):</label>
          <br />
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
        <br />
        <div>
          <label htmlFor="itemName">Item Name:</label>
          <br />
          <CustomInput
            id="itemName"
            type="text"
            required
            maxLength={100}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Mechanical Keyboard"
          />
        </div>
        <br />
        <div>
          <label htmlFor="uom">Unit of Measure (UOM):</label>
          <br />
          <CustomSelect
            id="uom"
            value={uom}
            options={uomOptions}
            onChange={(e) => setUom(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="unitPrice">Unit Price ($):</label>
          <br />
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
        <br />
        <CustomButton
          name={submitting ? 'Creating Item...' : 'Create Item'}
          type="submit"
          disabled={submitting}
        />
      </form>

      <hr />
      <h2>Item Master List ({items.length})</h2>
      {loading ? (
        <p>Loading items...</p>
      ) : (
        <CustomTable
          columns={itemColumns}
          data={items}
          keyExtractor={(row) => row.item_id}
          emptyMessage="No items found. Create one using the form above."
        />
      )}
    </div>
  );
};

export default ItemsPage;
