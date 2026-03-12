import { useState, useEffect } from 'react';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Grains', 'Spices', 'Frozen', 'Personal Care', 'Household', 'Other'];

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Vegetables',
    image: '', unit: 'kg', stock: '100', discount: '0',
  });

  useEffect(() => {
    if (product) setForm({
      name: product.name || '', description: product.description || '',
      price: product.price || '', category: product.category || 'Vegetables',
      image: product.image || '', unit: product.unit || 'kg',
      stock: product.stock || '100', discount: product.discount || '0',
    });
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price), stock: Number(form.stock), discount: Number(form.discount) });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>{product ? '✏️ Edit Product' : '➕ Add Product'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Product Name *</label>
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
          <label className="form-label">Unit</label>
          <select className="form-input" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})}>
            {['kg', 'g', 'ltr', 'ml', 'pcs', 'pack', 'dozen'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Stock</label>
          <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Discount (%)</label>
          <input className="form-input" type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({...form, discount: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Image URL</label>
          <input className="form-input" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="https://..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        <button type="submit" className="btn btn-primary">{product ? 'Update Product' : 'Add Product'}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default ProductForm;
