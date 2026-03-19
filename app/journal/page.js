"use client";
import { useEffect, useState } from 'react';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], reference: '', description: '', narration: '' });
  const [lines, setLines] = useState([
    { account_id: '', debit: '', credit: '', description: '' },
    { account_id: '', debit: '', credit: '', description: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/journal').then(r => r.json()).then(d => setEntries(Array.isArray(d) ? d : []));
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []));
  };
  useEffect(() => { load(); }, []);

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const updateLine = (idx, field, val) => {
    const updated = [...lines];
    updated[idx][field] = val;
    setLines(updated);
  };

  const save = async () => {
    setError('');
    if (!form.description) { setError('Description is required'); return; }
    if (!isBalanced) { setError('Entry is not balanced. Debits must equal Credits.'); return; }
    setSaving(true);
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, lines: lines.filter(l => l.account_id && (l.debit || l.credit)) })
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], reference: '', description: '', narration: '' });
    setLines([{ account_id:'', debit:'', credit:'', description:'' }, { account_id:'', debit:'', credit:'', description:'' }]);
    load();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Journal Entries</h1>
          <p style={{margin:0}}>Double-entry bookkeeping ledger</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>+ New Entry</button>
      </div>

      {showForm && (
        <div className="card mb-6" style={{border:'2px solid var(--accent-blue)'}}>
          <h3 className="mb-4">New Journal Entry</h3>
          <div className="grid grid-cols-3 mb-4" style={{gap:'1rem'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Reference</label>
              <input className="form-input" placeholder="Ref #" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
              <label className="form-label">Description *</label>
              <input className="form-input" placeholder="Entry description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>

          <table style={{width:'100%', marginBottom:'12px'}}>
            <thead>
              <tr style={{background:'var(--bg-tertiary)'}}>
                <th>Account</th><th>Description</th><th style={{width:'120px'}}>Debit (₹)</th><th style={{width:'120px'}}>Credit (₹)</th><th style={{width:'40px'}}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td>
                    <select className="form-input" value={l.account_id} onChange={e => updateLine(idx, 'account_id', e.target.value)}>
                      <option value="">— Select Account —</option>
                      {['Asset','Liability','Equity','Income','Expense'].map(type => (
                        <optgroup key={type} label={type}>
                          {accounts.filter(a => a.type === type).map(a => (
                            <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td><input className="form-input" placeholder="Note" value={l.description} onChange={e => updateLine(idx, 'description', e.target.value)} /></td>
                  <td><input type="number" className="form-input" placeholder="0.00" value={l.debit} onChange={e => updateLine(idx, 'debit', e.target.value)} /></td>
                  <td><input type="number" className="form-input" placeholder="0.00" value={l.credit} onChange={e => updateLine(idx, 'credit', e.target.value)} /></td>
                  <td><button onClick={() => setLines(lines.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--danger)',fontSize:'1.2rem'}}>×</button></td>
                </tr>
              ))}
              <tr style={{background:'var(--bg-tertiary)', fontWeight:600}}>
                <td colSpan={2} style={{padding:'10px 14px'}}>Totals</td>
                <td style={{padding:'10px 14px', color: isBalanced ? 'var(--success)' : 'var(--danger)'}}>₹{totalDebit.toFixed(2)}</td>
                <td style={{padding:'10px 14px', color: isBalanced ? 'var(--success)' : 'var(--danger)'}}>₹{totalCredit.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <button className="btn btn-secondary" style={{marginBottom:'12px'}} onClick={() => setLines([...lines, {account_id:'',debit:'',credit:'',description:''}])}>+ Add Line</button>

          {!isBalanced && totalDebit > 0 && (
            <div style={{padding:'10px 14px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'6px', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'12px'}}>
              ⚠ Entry is not balanced. Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
            </div>
          )}
          {error && <div style={{padding:'10px 14px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'6px', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'12px'}}>⚠ {error}</div>}

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving || !isBalanced}>{saving ? 'Saving…' : 'Post Entry'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Reference</th><th>Description</th><th>Source</th><th style={{textAlign:'right'}}>Debit</th></tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No journal entries yet</td></tr>
              ) : entries.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{e.reference || `JE-${String(e.id).padStart(4,'0')}`}</code></td>
                  <td style={{fontWeight:500}}>{e.description}</td>
                  <td><span className="badge badge-muted">{e.source}</span></td>
                  <td style={{textAlign:'right',fontWeight:600}}>₹{(e.totalDebit||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
