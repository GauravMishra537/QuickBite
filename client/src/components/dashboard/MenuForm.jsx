import { useState, useEffect } from 'react';

const CATEGORIES = ['Appetizer', 'Main Course', 'Biryani', 'Bread', 'Dessert', 'Beverages', 'Snacks', 'Thali', 'Street Food', 'Other'];

const MenuForm = ({ item = null, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Main Course',
    image: '', isVeg: true, isBestseller: false, preparationTime: '20',
  });

  useEffect(() => {
    if (item) setForm({
      name: item.name || '', description: item.description || '', price: item.price || '',
      category: item.category || 'Main Course', image: item.image || '',
      isVeg: item.isVeg !== false, isBestseller: !!item.isBestseller,
      preparationTime: item.preparationTime || '20',
    });
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>{item ? '✏️ Edit Item' : '➕ Add Item'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Item Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Price (₹) *</label>
          <input className="form-input" type="number" min="1" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Prep Time (min)</label>
          <input className="form-input" type="number" value={form.preparationTime} onChange={(e) => setForm({...form, preparationTime: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Image URL</label>
          <input className="form-input" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="https://..." />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({...form, isVeg: e.target.checked})} /> Vegetarian
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm({...form, isBestseller: e.target.checked})} /> Bestseller
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        <button type="submit" className="btn btn-primary">{item ? 'Update Item' : 'Add Item'}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default MenuForm;
