"use client";
import { useEffect, useState } from 'react';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];

export default function PaymentsReceivedPage() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], bill_id: '', amount: '', payment_mode: 'Cash', reference: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/payments/received').then(r => r.json()).then(d => setPayments(Array.isArray(d) ? d : []));
    fetch('/api/bills').then(r => r.json()).then(d => setBills(Array.isArray(d) ? d : []));
  };
  useEffect(() => { load(); }, []);

  const selectedBill = bills.find(b => String(b.id) === String(form.bill_id));

  const save = async () => {
    if (!form.bill_id || !form.amount) return;
    setSaving(true);
    await fetch('/api/payments/received', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, customer_id: selectedBill?.customer_id, amount: parseFloat(form.amount) })
    });
    setSaving(false);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], bill_id: '', amount: '', payment_mode: 'Cash', reference: '', notes: '' });
    load();
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Payments Received</h1>
          <p style={{margin:0}}>Track collections from customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record Payment</button>
      </div>

      {showForm && (
        <div className="card mb-6" style={{border:'2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">Record Payment Received</h3>
          <div className="grid grid-cols-3" style={{gap:'1rem'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
              <label className="form-label">Invoice *</label>
              <select className="form-input" value={form.bill_id} onChange={e => {
                const b = bills.find(b => String(b.id) === e.target.value);
                setForm({...form, bill_id: e.target.value, amount: b ? b.total : ''});
              }}>
                <option value="">— Select Invoice —</option>
                {bills.filter(b => b.status !== 'paid').map(b => <option key={b.id} value={b.id}>{b.bill_number} — ₹{b.total.toLocaleString('en-IN')}</option>)}
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
          <div className="stat-val" style={{fontSize:'1.6rem', color:'var(--success)'}}>₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label">Total Collected</div>
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
              <tr><th>Date</th><th>Invoice</th><th>Customer</th><th>Mode</th><th>Reference</th><th style={{textAlign:'right'}}>Amount</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No payments recorded yet</td></tr>
              ) : payments.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{p.bill_number}</code></td>
                  <td style={{fontWeight:500}}>{p.customer_name}</td>
                  <td>{p.payment_mode}</td>
                  <td style={{color:'var(--text-secondary)'}}>{p.reference || '—'}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'var(--success)'}}>₹{p.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
