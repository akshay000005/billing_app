'use client';
import { useEffect, useState } from 'react';

export default function CashFlowPage() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/reports/cashflow?months=6').then(r => r.json()).then(d => setData(Array.isArray(d) ? d : [])); }, []);

  const maxVal = Math.max(...data.map(d => Math.max(d.inflow, d.outflow)), 100);
  const totalIn  = data.reduce((s,d) => s + d.inflow, 0);
  const totalOut = data.reduce((s,d) => s + d.outflow, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Cash Flow Report</h1><p>Monthly cash inflows vs outflows</p></div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:'3px solid var(--success)'}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:'var(--success)'}}>₹{totalIn.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>TOTAL INFLOWS (6M)</div>
        </div>
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:'3px solid var(--danger)'}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:'var(--danger)'}}>₹{totalOut.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>TOTAL OUTFLOWS (6M)</div>
        </div>
        <div className="card" style={{marginBottom:0,padding:'16px',borderLeft:`3px solid ${totalIn-totalOut >= 0 ? 'var(--success)' : 'var(--danger)'}`}}>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:totalIn-totalOut >= 0 ? 'var(--success)' : 'var(--danger)'}}>₹{Math.abs(totalIn-totalOut).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>NET CASH FLOW</div>
        </div>
      </div>

      <div className="card glass mb-6">
        <h2 className="mb-6">Cash Flow — Last 6 Months</h2>
        <div style={{display:'flex', gap:'24px', alignItems:'flex-end', height:'240px', padding:'20px 20px 0', borderBottom:'2px solid var(--border-color)'}}>
          {data.map((d, i) => (
            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
              <div style={{display:'flex', gap:'4px', alignItems:'flex-end', height:'180px'}}>
                <div title={`Inflow: ₹${d.inflow}`} style={{width:28, height:`${(d.inflow/maxVal)*100}%`, minHeight:2, background:'linear-gradient(to top, #10b981, #34d399)', borderRadius:'4px 4px 0 0', transition:'height 0.8s ease'}}></div>
                <div title={`Outflow: ₹${d.outflow}`} style={{width:28, height:`${(d.outflow/maxVal)*100}%`, minHeight:2, background:'linear-gradient(to top, #f43f5e, #fb7185)', borderRadius:'4px 4px 0 0', transition:'height 0.8s ease'}}></div>
              </div>
              <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textAlign:'center', marginTop:'8px', whiteSpace:'nowrap'}}>{d.month}</div>
              <div style={{fontSize:'0.65rem', color: d.net >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight:700}}>
                {d.net >= 0 ? '+' : ''}₹{Math.abs(d.net).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4" style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
          <span>🟢 Cash In</span><span>🔴 Cash Out</span>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>Month</th><th style={{textAlign:'right'}}>Inflow (₹)</th><th style={{textAlign:'right'}}>Outflow (₹)</th><th style={{textAlign:'right'}}>Net Cash Flow</th></tr></thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td style={{fontWeight:500}}>{d.month}</td>
                  <td style={{textAlign:'right',color:'var(--success)',fontWeight:600}}>₹{d.inflow.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                  <td style={{textAlign:'right',color:'var(--danger)',fontWeight:600}}>₹{d.outflow.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:d.net>=0?'var(--success)':'var(--danger)'}}>
                    {d.net >= 0 ? '+' : ''}₹{d.net.toLocaleString('en-IN',{minimumFractionDigits:2})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
