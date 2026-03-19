'use client';
import { useEffect, useState } from 'react';

export default function AgingPage() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState('current');

  useEffect(() => {
    fetch('/api/reports/aging').then(r => r.json()).then(setData);
  }, []);

  const buckets = [
    { key:'current',   label:'Current',       sublabel:'Not yet due',   color:'var(--success)',  css:'aging-bucket-current' },
    { key:'days30',    label:'1–30 Days',      sublabel:'Overdue',        color:'var(--warning)',  css:'aging-bucket-30' },
    { key:'days60',    label:'31–60 Days',     sublabel:'Overdue',        color:'#f97316',         css:'aging-bucket-60' },
    { key:'days90plus',label:'60+ Days',       sublabel:'Severely overdue',color:'var(--danger)', css:'aging-bucket-90plus' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>A/R Aging Report</h1><p>Outstanding invoices by overdue period — QuickBooks style</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {data && (
        <>
          <div style={{display:'flex', gap:'12px', marginBottom:'28px'}}>
            {buckets.map(b => (
              <div key={b.key} className={`aging-bucket ${b.css} cursor-pointer`}
                style={{borderBottom: expanded === b.key ? `3px solid ${b.color}` : undefined, cursor:'pointer'}}
                onClick={() => setExpanded(b.key)}>
                <div style={{fontSize:'1.5rem', fontWeight:800, color:b.color}}>₹{data.summary[b.key]?.total.toLocaleString('en-IN',{minimumFractionDigits:2}) || '0.00'}</div>
                <div style={{fontWeight:700, marginTop:'4px'}}>{b.label}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{b.sublabel} · {data.summary[b.key]?.count || 0} invoices</div>
              </div>
            ))}
          </div>

          <div className="card" style={{borderLeft:`3px solid ${buckets.find(b=>b.key===expanded)?.color}`}}>
            <h3 className="mb-4">{buckets.find(b=>b.key===expanded)?.label} Invoices</h3>
            <div className="table-container">
              <table>
                <thead><tr><th>Invoice</th><th>Customer</th><th>Invoice Date</th><th>Days Overdue</th><th style={{textAlign:'right'}}>Invoice Total</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Outstanding</th></tr></thead>
                <tbody>
                  {(data.buckets[expanded] || []).length === 0
                    ? <tr><td colSpan={7} style={{textAlign:'center',padding:'30px',color:'var(--text-muted)'}}>No invoices in this bucket 🎉</td></tr>
                    : (data.buckets[expanded] || []).map(b => (
                      <tr key={b.id}>
                        <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{b.bill_number}</code></td>
                        <td style={{fontWeight:500}}>{b.customer_name}</td>
                        <td>{new Date(b.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          {b.daysOverdue > 0
                            ? <span style={{color:buckets.find(bk=>bk.key===expanded)?.color,fontWeight:700}}>{b.daysOverdue} days</span>
                            : <span style={{color:'var(--success)'}}>Current</span>}
                        </td>
                        <td style={{textAlign:'right'}}>₹{b.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                        <td style={{textAlign:'right',color:'var(--success)'}}>₹{b.paid.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                        <td style={{textAlign:'right',fontWeight:700,color:'var(--danger)'}}>₹{b.outstanding.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{background:'var(--bg-tertiary)',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px'}}>
            <span style={{fontWeight:600}}>Total Accounts Receivable</span>
            <span style={{fontWeight:800,fontSize:'1.3rem',color:'var(--accent-primary)'}}>₹{data.summary.totalAR.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
          </div>
        </>
      )}
    </div>
  );
}
