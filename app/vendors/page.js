"use client";
import { useEffect, useState } from 'react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gstin: '', address: '', opening_balance: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => fetch('/api/vendors').then(r => r.json()).then(d => setVendors(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    await fetch('/api/vendors', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: '', email: '', phone: '', gstin: '', address: '', opening_balance: '' });
    load();
  };

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.custom_id.includes(search));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Vendors / Suppliers</h1>
          <p style={{margin:0}}>Manage your supplier master data</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Vendor</button>
      </div>

      {showForm && (
        <div className="card mb-6" style={{border:'2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">Add New Vendor</h3>
          <div className="grid grid-cols-3" style={{gap:'1rem'}}>
            <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
              <label className="form-label">Vendor Name *</label>
              <input className="form-input" placeholder="Full business name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">GSTIN</label>
              <input className="form-input" placeholder="27AAPFU0939F1ZV" value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="vendor@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 00000 00000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Opening Balance (₹)</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.opening_balance} onChange={e => setForm({...form, opening_balance: e.target.value})} />
            </div>
            <div className="form-group mt-4" style={{marginBottom:0, gridColumn:'span 3'}}>
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} placeholder="Full address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Vendor'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{padding:'12px 16px', marginBottom:'16px'}}>
        <input className="form-input" style={{border:'none', padding:'8px 0', boxShadow:'none', fontSize:'0.95rem'}}
          placeholder="🔍  Search vendors by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>GSTIN</th><th>Phone</th><th>Email</th><th style={{textAlign:'right'}}>Opening Bal.</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>{vendors.length === 0 ? 'No vendors added yet' : 'No results found'}</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id}>
                  <td><code style={{background:'var(--bg-tertiary)', padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem'}}>{v.custom_id}</code></td>
                  <td style={{fontWeight:500}}>{v.name}</td>
                  <td style={{fontFamily:'monospace', fontSize:'0.85rem'}}>{v.gstin || '—'}</td>
                  <td>{v.phone || '—'}</td>
                  <td>{v.email || '—'}</td>
                  <td style={{textAlign:'right'}}>₹{(v.opening_balance||0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
