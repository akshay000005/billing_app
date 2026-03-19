"use client";
import { useEffect, useState } from 'react';

const TYPE_ORDER = ['Asset','Liability','Equity','Income','Expense'];
const TYPE_COLORS = { Asset:'var(--accent-blue)', Liability:'var(--danger)', Equity:'var(--success)', Income:'var(--success)', Expense:'var(--danger)' };

export default function TrialBalancePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reports/trial-balance').then(r => r.json()).then(setData);
  }, []);

  const grouped = TYPE_ORDER.reduce((acc, t) => {
    acc[t] = (data?.accounts || []).filter(a => a.type === t);
    return acc;
  }, {});

  const isBalanced = data && Math.abs(data.totalDebit - data.totalCredit) < 0.01;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Trial Balance</h1>
          <p style={{margin:0}}>Verify double-entry bookkeeping accuracy</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-3 mb-6">
            <div className="card" style={{marginBottom:0, padding:'16px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700}}>₹{data.totalDebit.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Debits</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'16px'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700}}>₹{data.totalCredit.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Credits</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'16px', borderLeft:`4px solid ${isBalanced ? 'var(--success)' : 'var(--danger)'}`}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:isBalanced ? 'var(--success)' : 'var(--danger)'}}>
                {isBalanced ? '✓ Balanced' : `Diff: ₹${Math.abs(data.totalDebit - data.totalCredit).toFixed(2)}`}
              </div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Status</div>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Code</th><th>Account Name</th><th>Type</th><th style={{textAlign:'right'}}>Debit (₹)</th><th style={{textAlign:'right'}}>Credit (₹)</th></tr>
                </thead>
                <tbody>
                  {TYPE_ORDER.map(type => {
                    const accounts = grouped[type];
                    if (!accounts?.length) return null;
                    return [
                      <tr key={`${type}-header`} style={{background:'var(--bg-tertiary)'}}>
                        <td colSpan={5} style={{fontWeight:700, color:TYPE_COLORS[type], padding:'8px 14px', fontSize:'0.75rem', letterSpacing:'0.05em', textTransform:'uppercase'}}>{type} Accounts</td>
                      </tr>,
                      ...accounts.map(a => (
                        <tr key={a.id}>
                          <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{a.code}</code></td>
                          <td style={{fontWeight:500}}>{a.name}</td>
                          <td><span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{a.normalBalance} normal</span></td>
                          <td style={{textAlign:'right'}}>{a.debit > 0 ? `₹${a.debit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                          <td style={{textAlign:'right'}}>{a.credit > 0 ? `₹${a.credit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                        </tr>
                      ))
                    ];
                  })}
                  <tr style={{background:'var(--bg-tertiary)', fontWeight:700, fontSize:'1rem'}}>
                    <td colSpan={3} style={{padding:'12px 14px'}}>TOTALS</td>
                    <td style={{textAlign:'right',padding:'12px 14px',color:'var(--accent-blue)'}}>₹{data.totalDebit.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                    <td style={{textAlign:'right',padding:'12px 14px',color:'var(--accent-blue)'}}>₹{data.totalCredit.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
