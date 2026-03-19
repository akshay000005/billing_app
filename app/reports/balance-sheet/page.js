"use client";
import { useEffect, useState } from 'react';

export default function BalanceSheetPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reports/balance-sheet').then(r => r.json()).then(setData);
  }, []);

  const section = (title, color, items, total) => (
    <div className="card" style={{borderLeft: `4px solid ${color}`}}>
      <h3 style={{marginBottom:'16px', color}}>{title}</h3>
      {items.map(([label, val]) => (
        <div key={label} className="flex justify-between" style={{padding:'8px 0', borderBottom:'1px solid var(--border-color)', fontSize:'0.9rem'}}>
          <span style={{color:'var(--text-secondary)'}}>{label}</span>
          <span>₹{(val||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
        </div>
      ))}
      <div className="flex justify-between" style={{padding:'12px 0', fontWeight:700, fontSize:'1rem'}}>
        <span>Total {title}</span>
        <span style={{color}}>₹{(total||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Balance Sheet</h1>
          <p style={{margin:0}}>Assets, liabilities and equity as of today</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-3 mb-6">
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft:'4px solid var(--accent-blue)'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700}}>₹{data.assets.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Assets</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft:'4px solid var(--danger)'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700}}>₹{data.liabilities.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Liabilities</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft:'4px solid var(--success)'}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--success)'}}>₹{data.equity.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Owner's Equity</div>
            </div>
          </div>

          <div className="grid grid-cols-2 mb-6">
            {section('Assets', 'var(--accent-blue)', [
              ['Cash & Bank', data.assets.cash],
              ['Accounts Receivable', data.assets.accountsReceivable],
              ['Inventory / Purchases', data.assets.inventory],
            ], data.assets.total)}

            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {section('Liabilities', 'var(--danger)', [
                ['Accounts Payable', data.liabilities.accountsPayable],
              ], data.liabilities.total)}
              {section("Owner's Equity", 'var(--success)', [
                ['Retained Earnings', data.equity.retainedEarnings],
              ], data.equity.total)}
            </div>
          </div>

          <div className="card" style={{padding:'16px', background:'var(--bg-tertiary)', textAlign:'center'}}>
            <span style={{fontWeight:600, color:'var(--text-secondary)'}}>
              Assets (₹{data.assets.total.toLocaleString('en-IN',{minimumFractionDigits:2})}) = Liabilities (₹{data.liabilities.total.toLocaleString('en-IN',{minimumFractionDigits:2})}) + Equity (₹{data.equity.total.toLocaleString('en-IN',{minimumFractionDigits:2})})
            </span>
          </div>
        </>
      ) : <p>Loading…</p>}
    </div>
  );
}
