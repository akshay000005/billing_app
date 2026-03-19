"use client";
import { useEffect, useState } from 'react';

const CATEGORIES = [
  'Salaries & Wages', 'Rent', 'Utilities', 'Office Supplies',
  'Travel & Transport', 'Marketing & Advertising', 'Professional Fees',
  'Cost of Goods Sold', 'Depreciation', 'Miscellaneous'
];
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Office Supplies', description: '', amount: '', vendor_id: '', payment_mode: 'Cash', reference: '' });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const load = () => {
    fetch('/api/expenses').then(r => r.json()).then(d => setExpenses(Array.isArray(d) ? d : []));
    fetch('/api/vendors').then(r => r.json()).then(d => setVendors(Array.isArray(d) ? d : []));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.date || !form.amount || !form.category) return;
    setSaving(true);
    await fetch('/api/expenses', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, amount: parseFloat(form.amount)}) });
    setSaving(false);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Office Supplies', description: '', amount: '', vendor_id: '', payment_mode: 'Cash', reference: '' });
    load();
  };

  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const byCat = CATEGORIES.map(c => ({ cat: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0);
  const maxCat = Math.max(...byCat.map(c => c.total), 1);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom: '4px'}}>Expenses</h1>
          <p style={{margin: 0}}>Track and categorize business expenses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Expense</button>
      </div>

      {showForm && (
        <div className="card mb-6" style={{border: '2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">Record Expense</h3>
          <div className="grid grid-cols-3" style={{gap: '1rem'}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom: 0, gridColumn: 'span 2'}}>
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Expense details" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Vendor (optional)</label>
              <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
                <option value="">— None —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Payment Mode</label>
              <select className="form-input" value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
                {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Reference #</label>
              <input className="form-input" placeholder="Bill / receipt no." value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Expense'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{padding: '16px', marginBottom: 0}}>
          <div className="stat-val" style={{fontSize: '1.6rem'}}>₹{expenses.reduce((s,e) => s+e.amount, 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="card" style={{padding: '16px', marginBottom: 0}}>
          <div className="stat-val" style={{fontSize: '1.6rem'}}>{expenses.length}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="card" style={{padding: '16px', marginBottom: 0}}>
          <div className="stat-val" style={{fontSize: '1.6rem'}}>{byCat.length}</div>
          <div className="stat-label">Categories Used</div>
        </div>
      </div>

      {byCat.length > 0 && (
        <div className="card mb-6">
          <h3 className="mb-4">Expenses by Category</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {byCat.sort((a,b) => b.total-a.total).map(c => (
              <div key={c.cat}>
                <div className="flex justify-between align-center mb-2" style={{fontSize:'0.85rem'}}>
                  <span style={{fontWeight:500}}>{c.cat}</span>
                  <span style={{fontWeight:600}}>₹{c.total.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                </div>
                <div style={{height:'8px', background:'var(--bg-tertiary)', borderRadius:'4px', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${(c.total/maxCat)*100}%`, background:'linear-gradient(90deg, var(--accent-blue), #8b5cf6)', borderRadius:'4px', transition:'width 0.8s ease'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 align-center" style={{flexWrap:'wrap'}}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{padding:'4px 10px', borderRadius:'20px', border:'1px solid var(--border-color)', background: filterCat===c ? 'var(--accent-primary)':'white', color: filterCat===c ? 'white':'var(--text-secondary)', cursor:'pointer', fontSize:'0.8rem', fontWeight:500}}>
            {c}
          </button>
        ))}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th>Mode</th><th style={{textAlign:'right'}}>Amount</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>No expenses recorded yet</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td><span className="badge badge-warning">{e.category}</span></td>
                  <td style={{color:'var(--text-secondary)'}}>{e.description || '—'}</td>
                  <td>{e.vendor_name || '—'}</td>
                  <td>{e.payment_mode}</td>
                  <td style={{textAlign:'right', fontWeight:600}}>₹{e.amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              ))}
              {filtered.length > 0 && (
                <tr style={{background:'var(--bg-tertiary)'}}>
                  <td colSpan={5} style={{fontWeight:600}}>Total</td>
                  <td style={{textAlign:'right', fontWeight:700, fontSize:'1rem'}}>₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
