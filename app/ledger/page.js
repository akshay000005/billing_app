'use client';
import { useEffect, useState } from 'react';

export default function LedgerPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []));
  }, []);

  const load = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${selectedAccount}/ledger?from=${from}&to=${to}`);
      const d = await res.json();
      setEntries(Array.isArray(d) ? d : d.entries || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (selectedAccount) load(); }, [selectedAccount, from, to]);

  const account = accounts.find(a => String(a.id) === String(selectedAccount));
  let running = 0;
  const rows = entries.map(e => {
    running += (e.debit || 0) - (e.credit || 0);
    return { ...e, balance: running };
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Ledger</h1><p>Account statement with running balance</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4 align-center">
          <div className="form-group" style={{marginBottom:0, flex:2}}>
            <label className="form-label">Select Account</label>
            <select className="form-input" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              <option value="">— Choose Account —</option>
              {['Asset','Liability','Equity','Income','Expense'].map(type => (
                <optgroup key={type} label={type}>
                  {accounts.filter(a => a.type === type).map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">From</label>
            <input type="date" className="form-input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">To</label>
            <input type="date" className="form-input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      {account && (
        <div className="card" style={{borderLeft:'3px solid var(--accent-primary)', marginBottom:'16px', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:700, fontSize:'1.1rem'}}>{account.name}</div>
            <div style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{account.type} · {account.code} · Normal: {account.normal_balance}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:800, fontSize:'1.4rem', color: running >= 0 ? 'var(--accent-primary)' : 'var(--danger)'}}>
              ₹{Math.abs(running).toLocaleString('en-IN',{minimumFractionDigits:2})}
            </div>
            <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Closing Balance</div>
          </div>
        </div>
      )}

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table className="ledger-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Reference</th><th style={{textAlign:'right'}}>Debit (₹)</th><th style={{textAlign:'right'}}>Credit (₹)</th><th style={{textAlign:'right'}}>Balance (₹)</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Loading…</td></tr>
              : !selectedAccount ? <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Select an account to view ledger</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No transactions in this period</td></tr>
              : rows.map((e, i) => (
                <tr key={i}>
                  <td>{e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={{fontWeight:500}}>{e.description || e.narration || '—'}</td>
                  <td><code style={{background:'var(--bg-tertiary)',padding:'2px 5px',borderRadius:'3px',fontSize:'0.75rem'}}>{e.reference || '—'}</code></td>
                  <td style={{textAlign:'right', color:'var(--accent-blue)', fontWeight:600}}>{e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                  <td style={{textAlign:'right', color:'var(--danger)', fontWeight:600}}>{e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                  <td style={{textAlign:'right'}} className="ledger-running-balance">₹{Math.abs(e.balance).toLocaleString('en-IN',{minimumFractionDigits:2})} {e.balance >= 0 ? 'Dr' : 'Cr'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
