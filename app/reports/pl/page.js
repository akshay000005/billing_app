"use client";
import { useEffect, useState } from 'react';

export default function PLPage() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  const load = () => fetch(`/api/reports/pl?from=${from}&to=${to}`).then(r => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const row = (label, val, bold = false, negative = false) => (
    <div className="flex justify-between" style={{padding:'10px 0', borderBottom:'1px solid var(--border-color)', fontWeight: bold ? 700 : 400, fontSize: bold ? '1rem' : '0.9rem'}}>
      <span style={{color: bold ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>{label}</span>
      <span style={{color: negative && val < 0 ? 'var(--danger)' : bold && val > 0 ? 'var(--success)' : 'var(--text-primary)'}}>
        {val < 0 ? '-' : ''}₹{Math.abs(val||0).toLocaleString('en-IN',{minimumFractionDigits:2})}
      </span>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Profit &amp; Loss Statement</h1>
          <p style={{margin:0}}>Income, expenses and net profit for a period</p>
        </div>
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

      {data && (
        <>
          <div className="grid grid-cols-3 mb-6">
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft: `4px solid var(--success)`}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--accent-primary)'}}>₹{data.income.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Revenue</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft: `4px solid var(--danger)`}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--accent-primary)'}}>₹{(data.cogs + data.expenses.total).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>Total Expenses</div>
            </div>
            <div className="card" style={{marginBottom:0, padding:'20px', borderLeft: `4px solid ${data.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}`}}>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:data.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}}>₹{Math.abs(data.netProfit).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',fontWeight:600}}>{data.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 mb-6">
            <div className="card">
              <h3 className="mb-4" style={{color:'var(--success)'}}>📈 Income</h3>
              {row('Sales Revenue', data.income.salesRevenue)}
              {row('Other Income', data.income.otherIncome)}
              {row('Total Revenue', data.income.total, true)}
              <div style={{height:'16px'}}></div>
              {row('Cost of Goods Sold (COGS)', data.cogs, false, true)}
              {row('Gross Profit', data.grossProfit, true)}
            </div>

            <div className="card">
              <h3 className="mb-4" style={{color:'var(--danger)'}}>📉 Operating Expenses</h3>
              {data.expenses.breakdown.length === 0
                ? <p style={{textAlign:'center', color:'var(--text-muted)', padding:'20px 0'}}>No expenses in this period</p>
                : data.expenses.breakdown.map(e => row(e.category, e.amount))}
              {row('Total Expenses', data.expenses.total, true)}
            </div>
          </div>

          <div className="card" style={{borderLeft: `4px solid ${data.netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}`}}>
            {row(`Net ${data.netProfit >= 0 ? 'Profit' : 'Loss'}`, data.netProfit, true, true)}
          </div>
        </>
      )}
    </div>
  );
}
