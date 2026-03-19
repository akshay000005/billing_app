"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({ bills: 0, customers: 0, items: 0, vendors: 0, expenses: 0, purchases: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pl, setPl] = useState(null);
  const [ar, setAr] = useState(0);
  const [ap, setAp] = useState(0);

  useEffect(() => {
    const from = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];

    Promise.all([
      fetch('/api/bills').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/items').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/purchases').then(r => r.json()),
      fetch(`/api/reports/pl?from=${from}&to=${to}`).then(r => r.json()),
      fetch('/api/reports/balance-sheet').then(r => r.json()),
    ]).then(([b, c, i, v, ex, p, plData, bsData]) => {
      const billsArray = Array.isArray(b) ? b : [];
      setStats({
        bills: billsArray.length,
        customers: Array.isArray(c) ? c.length : 0,
        items: Array.isArray(i) ? i.length : 0,
        vendors: Array.isArray(v) ? v.length : 0,
        expenses: Array.isArray(ex) ? ex.length : 0,
        purchases: Array.isArray(p) ? p.length : 0,
      });

      let total = 0;
      const monthlyData = {};
      const last6Months = [];
      const d = new Date();
      for (let idx = 5; idx >= 0; idx--) {
        const tempD = new Date(d.getFullYear(), d.getMonth() - idx, 1);
        const label = tempD.toLocaleString('default', { month: 'short' }) + ' ' + tempD.getFullYear();
        last6Months.push(label);
        monthlyData[label] = 0;
      }
      billsArray.forEach(bill => {
        total += bill.total;
        if (bill.date) {
          const bd = new Date(bill.date);
          const label = bd.toLocaleString('default', { month: 'short' }) + ' ' + bd.getFullYear();
          if (monthlyData[label] !== undefined) monthlyData[label] += bill.total;
        }
      });
      setTotalRevenue(total);
      setRevenueData(last6Months.map(month => ({ month, revenue: monthlyData[month] })));

      if (plData && !plData.error) setPl(plData);
      if (bsData && !bsData.error) {
        setAr(bsData.assets?.accountsReceivable || 0);
        setAp(bsData.liabilities?.accountsPayable || 0);
      }
    }).catch(e => console.error(e));
  }, []);

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 100);
  const netProfit = pl?.netProfit ?? null;

  return (
    <div className="animate-fade-in">
      <h1>Dashboard</h1>

      {/* Top KPI Row */}
      <div className="grid grid-cols-4 mb-8">
        <div className="card glass">
          <div className="stat-val">₹{totalRevenue.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label flex align-center gap-2"><span style={{color:'var(--success)'}}>↑</span> Total Revenue</div>
        </div>
        <div className="card glass">
          <div className="stat-val" style={{color: netProfit === null ? undefined : netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}}>
            {netProfit === null ? '—' : `₹${Math.abs(netProfit).toLocaleString('en-IN',{minimumFractionDigits:2})}`}
          </div>
          <div className="stat-label">{netProfit === null ? 'Net P&L (YTD)' : netProfit >= 0 ? '📈 Net Profit (YTD)' : '📉 Net Loss (YTD)'}</div>
        </div>
        <div className="card glass">
          <div className="stat-val" style={{color:'var(--accent-blue)'}}>₹{ar.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div className="stat-label">Accounts Receivable</div>
        </div>
        <div className="card glass">
          <div className="stat-val" style={{color:'var(--danger)'}}>₹{ap.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div className="stat-label">Accounts Payable</div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid" style={{gridTemplateColumns:'repeat(6,1fr)', gap:'1rem', marginBottom:'2rem'}}>
        {[
          { label:'Invoices', val: stats.bills, icon:'📄', href:'/bills' },
          { label:'Customers', val: stats.customers, icon:'👥', href:'/customers' },
          { label:'Vendors', val: stats.vendors, icon:'🏭', href:'/vendors' },
          { label:'Purchases', val: stats.purchases, icon:'🛒', href:'/purchases' },
          { label:'Expenses', val: stats.expenses, icon:'🧾', href:'/expenses' },
          { label:'Products', val: stats.items, icon:'📦', href:'/items' },
        ].map(s => (
          <Link key={s.label} href={s.href} style={{textDecoration:'none'}}>
            <div className="card" style={{padding:'14px', textAlign:'center', marginBottom:0, cursor:'pointer', transition:'transform 0.15s', ':hover':{transform:'translateY(-2px)'}}}>
              <div style={{fontSize:'1.5rem', marginBottom:'4px'}}>{s.icon}</div>
              <div style={{fontSize:'1.35rem', fontWeight:700, color:'var(--accent-primary)'}}>{s.val}</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:600}}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card glass mb-8 animate-fade-in" style={{animationDelay:'0.1s'}}>
        <h2 className="mb-6">Revenue — Last 6 Months</h2>
        <div style={{height:'220px', display:'flex', alignItems:'flex-end', gap:'20px', padding:'20px 20px 0 20px', borderBottom:'2px solid var(--border-color)', position:'relative'}}>
          <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:0, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
            {[0,1,2,3].map(i => <div key={i} style={{borderTop:'1px dashed var(--border-color)', width:'100%', opacity:0.5}}></div>)}
          </div>
          {revenueData.map((data, idx) => {
            const h = (data.revenue / maxRevenue) * 100;
            return (
              <div key={idx} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', zIndex:1}}>
                <div style={{width:'100%', maxWidth:'60px', height:`${h}%`, background:'linear-gradient(to top, var(--accent-blue), #8b5cf6)', borderRadius:'6px 6px 0 0', transition:'height 1s ease-out', position:'relative', boxShadow:'0 4px 15px rgba(37,99,235,0.2)'}}>
                  <div style={{position:'absolute', top:'-25px', width:'100%', textAlign:'center', fontSize:'0.7rem', fontWeight:600, color:'var(--accent-blue)', whiteSpace:'nowrap'}}>
                    {data.revenue > 0 ? `₹${data.revenue.toLocaleString('en-IN')}` : ''}
                  </div>
                </div>
                <div style={{marginTop:'10px', fontSize:'0.75rem', fontWeight:500, color:'#666', whiteSpace:'nowrap'}}>{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <h2>Quick Actions</h2>
      <div className="flex gap-4" style={{flexWrap:'wrap'}}>
        <Link href="/bills/new" className="btn btn-primary">📄 Create Invoice</Link>
        <Link href="/purchases/new" className="btn btn-secondary">🛒 New Purchase</Link>
        <Link href="/expenses" className="btn btn-secondary">🧾 Add Expense</Link>
        <Link href="/payments/received" className="btn btn-secondary">💰 Record Payment</Link>
        <Link href="/reports/pl" className="btn btn-secondary">📈 View P&amp;L</Link>
        <Link href="/reports/gstr1" className="btn btn-secondary">📑 GSTR-1 Export</Link>
      </div>
    </div>
  );
}
