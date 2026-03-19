"use client";
import { useEffect, useState } from 'react';

const TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
const TYPE_COLORS = { Asset: 'badge-info', Liability: 'badge-warning', Equity: 'badge-muted', Income: 'badge-success', Expense: 'badge-danger' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'Asset', description: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = () => fetch('/api/accounts').then(r => r.json()).then(setAccounts);
  useEffect(() => { load(); }, []);

  const grouped = TYPES.reduce((acc, t) => {
    acc[t] = accounts.filter(a => a.type === t);
    return acc;
  }, {});

  const visible = filter === 'All' ? accounts : accounts.filter(a => a.type === filter);

  const save = async () => {
    if (!form.code || !form.name) return;
    setSaving(true);
    await fetch('/api/accounts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ code: '', name: '', type: 'Asset', description: '' });
    load();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom: '4px'}}>Chart of Accounts</h1>
          <p style={{margin: 0}}>Manage your accounting structure</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Account</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '12px'}}>
        {['All', ...TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: filter === t ? 'var(--accent-primary)' : 'white', color: filter === t ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem'}}>
            {t}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card mb-6" style={{border: '2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">Add New Account</h3>
          <div className="grid grid-cols-4" style={{gap: '1rem'}}>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Account Code *</label>
              <input className="form-input" placeholder="e.g. 1005" value={form.code}
                onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom: 0, gridColumn: 'span 2'}}>
              <label className="form-label">Account Name *</label>
              <input className="form-input" placeholder="e.g. Office Equipment" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Type *</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group mt-4" style={{marginBottom: 0}}>
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="Optional description" value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Account'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 mb-6">
        {TYPES.map(t => (
          <div key={t} className="card" style={{marginBottom: 0, padding: '16px'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)'}}>{grouped[t]?.length || 0}</div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600}}>{t} Accounts</div>
          </div>
        ))}
        <div className="card" style={{marginBottom: 0, padding: '16px'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)'}}>{accounts.length}</div>
          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600}}>Total Accounts</div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card" style={{padding: 0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>No accounts found</td></tr>
              ) : visible.map(a => (
                <tr key={a.id}>
                  <td><code style={{background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem'}}>{a.code}</code></td>
                  <td style={{fontWeight: 500}}>{a.name}</td>
                  <td><span className={`badge ${TYPE_COLORS[a.type]}`}>{a.type}</span></td>
                  <td style={{color: 'var(--text-secondary)'}}>{a.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
