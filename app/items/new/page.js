"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', description: '', rate: '', gst_rate: '18' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
         router.push('/items');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary mb-4" onClick={() => router.push('/items')}>← Back</button>
      <h1>Add New Item / Service</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Item / Service Name *</label>
            <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Base Rate (₹) *</label>
            <input required type="number" step="0.01" className="form-input" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Description</label>
            <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">GST Rate (%)</label>
            <select className="form-input" style={{width: '100%'}} value={formData.gst_rate} onChange={e => setFormData({...formData, gst_rate: e.target.value})}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
