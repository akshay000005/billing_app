"use client";
import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [formData, setFormData] = useState({ company_name: '', company_address: '', gstin: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d && !d.error) setFormData(d);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMsg("Settings updated successfully!");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h1>Company Settings</h1>
      
      {msg && <div style={{padding: '12px', background: 'var(--success)', color: 'white', borderRadius: '6px', marginBottom: '20px'}}>{msg}</div>}
      
      <div className="card glass">
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Company Name *</label>
            <input required type="text" className="form-input" value={formData.company_name || ""} onChange={e => setFormData({...formData, company_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">GSTIN</label>
            <input type="text" className="form-input" value={formData.gstin || ""} onChange={e => setFormData({...formData, gstin: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">Company Address</label>
            <textarea className="form-input" rows="3" value={formData.company_address || ""} onChange={e => setFormData({...formData, company_address: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
