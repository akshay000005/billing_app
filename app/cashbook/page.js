'use client';
import { useEffect, useState } from 'react';

export default function CashBookPage() {
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [paymentsIn, paymentsOut, expenses] = await Promise.all([
      fetch('/api/payments/received').then(r => r.json()),
      fetch('/api/payments/made').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
    ]);

    const inFilter = d => d.date && d.date >= from && d.date <= to;
    const cashModes = ['Cash', 'UPI'];

    const allEntries = [
      ...(Array.isArray(paymentsIn) ? paymentsIn.filter(inFilter).filter(p => cashModes.includes(p.payment_mode) || true).map(p => ({
        date: p.date, type: 'Receipt', party: p.customer_name, description: `Payment received — ${p.bill_number || ''}`, debit: p.amount, credit: 0, mode: p.payment_mode
      })) : []),
      ...(Array.isArray(paymentsOut) ? paymentsOut.filter(inFilter).map(p => ({
        date: p.date, type: 'Payment', party: p.vendor_name || '—', description: `Payment to vendor — ${p.purchase_number || ''}`, debit: 0, credit: p.amount, mode: p.payment_mode
      })) : []),
      ...(Array.isArray(expenses) ? expenses.filter(inFilter).map(e => ({
        date: e.date, type: 'Expense', party: e.vendor_name || 'Direct', description: e.category || e.description, debit: 0, credit: e.amount, mode: e.payment_mode || 'Cash'
      })) : []),
    ].sort((a, b) => a.date?.localeCompare(b.date));

    let running = 0;
    setEntries(allEntries.map(e => { running += e.debit - e.credit; return { ...e, balance: running }; }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [from, to]);

  const totalIn  = entries.reduce((s, e) => s + e.debit, 0);
  const totalOut = entries.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Cash &amp; Bank Book</h1><p>All money inflows and outflows</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4 align-center">
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">From</label>
            <input type="date" className="form-input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">To</label>
            <input type="date" className="form-input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{marginTop:'22px'}} onClick={load}>Apply</button>
        </div>
      </div>

      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:'3px solid var(--success)'}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:'var(--success)'}}>₹{totalIn.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,marginTop:'4px'}}>TOTAL RECEIPTS</div>
        </div>
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:'3px solid var(--danger)'}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:'var(--danger)'}}>₹{totalOut.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,marginTop:'4px'}}>TOTAL PAYMENTS</div>
        </div>
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:`3px solid ${totalIn - totalOut >= 0 ? 'var(--accent-primary)' : 'var(--danger)'}`}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:totalIn-totalOut >= 0 ? 'var(--accent-primary)' : 'var(--danger)'}}>₹{Math.abs(totalIn-totalOut).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,marginTop:'4px'}}>{totalIn-totalOut >= 0 ? 'CLOSING BALANCE' : 'NET DEFICIT'}</div>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Party</th><th>Description</th><th>Mode</th><th style={{textAlign:'right'}}>In (Dr)</th><th style={{textAlign:'right'}}>Out (Cr)</th><th style={{textAlign:'right'}}>Balance</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Loading…</td></tr>
              : entries.length === 0 ? <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No transactions in this period</td></tr>
              : entries.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${e.type === 'Receipt' ? 'badge-success' : 'badge-danger'}`}>{e.type}</span></td>
                  <td style={{fontWeight:500}}>{e.party}</td>
                  <td style={{color:'var(--text-secondary)'}}>{e.description}</td>
                  <td style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{e.mode}</td>
                  <td style={{textAlign:'right',color:'var(--success)',fontWeight:600}}>{e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                  <td style={{textAlign:'right',color:'var(--danger)',fontWeight:600}}>{e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:e.balance >= 0 ? 'var(--accent-primary)' : 'var(--danger)'}}>₹{Math.abs(e.balance).toLocaleString('en-IN',{minimumFractionDigits:2})} {e.balance >= 0 ? 'Dr' : 'Cr'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
