"use client";
import { useEffect, useState } from 'react';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];

export default function PaymentsMadePage() {
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], purchase_id: '', vendor_id: '', amount: '', payment_mode: 'Cash', reference: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/payments/made').then(r => r.json()).then(d => setPayments(Array.isArray(d) ? d : []));
    fetch('/api/purchases').then(r => r.json()).then(d => setPurchases(Array.isArray(d) ? d : []));
    fetch('/api/vendors').then(r => r.json()).then(d => setVendors(Array.isArray(d) ? d : []));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.amount) return;
    setSaving(true);
    await fetch('/api/payments/made', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
    });
    setSaving(false);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], purchase_id: '', vendor_id: '', amount: '', payment_mode: 'Cash', reference: '', notes: '' });
    load();
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Payments Made</h1>
          <p style={{margin:0}}>Track payments to vendors and suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record Payment</button>
      </div>

      {showForm && (
        <div className="card mb-6" style={{border:'2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">Record Payment Made</h3>
          <div className="grid grid-cols-3" style={{gap:'1rem'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
              <label className="form-label">Purchase Order (optional)</label>
              <select className="form-input" value={form.purchase_id} onChange={e => {
                const p = purchases.find(p => String(p.id) === e.target.value);
                setForm({...form, purchase_id: e.target.value, vendor_id: p?.vendor_id || form.vendor_id, amount: p ? p.total : form.amount});
              }}>
                <option value="">— Select PO (optional) —</option>
                {purchases.filter(p => p.status !== 'paid').map(p => <option key={p.id} value={p.id}>{p.purchase_number} — {p.vendor_name} — ₹{p.total.toLocaleString('en-IN')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Vendor</label>
              <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
                <option value="">— Select Vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Payment Mode</label>
              <select className="form-input" value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
                {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Reference #</label>
              <input className="form-input" placeholder="UTR / Cheque no." value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Payment'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{padding:'16px', marginBottom:0}}>
          <div className="stat-val" style={{fontSize:'1.6rem', color:'var(--danger)'}}>₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label">Total Paid Out</div>
        </div>
        <div className="card" style={{padding:'16px', marginBottom:0}}>
          <div className="stat-val" style={{fontSize:'1.6rem'}}>{payments.length}</div>
          <div className="stat-label">Payment Records</div>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>PO Number</th><th>Vendor</th><th>Mode</th><th>Reference</th><th style={{textAlign:'right'}}>Amount</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No outgoing payments recorded yet</td></tr>
              ) : payments.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{p.purchase_number || '—'}</code></td>
                  <td style={{fontWeight:500}}>{p.vendor_name || '—'}</td>
                  <td>{p.payment_mode}</td>
                  <td style={{color:'var(--text-secondary)'}}>{p.reference || '—'}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'var(--danger)'}}>₹{p.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
