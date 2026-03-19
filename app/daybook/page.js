'use client';
import { useEffect, useState } from 'react';

export default function DayBookPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({ receipts: 0, payments: 0, sales: 0, purchases: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [bills, payments, paymentsMade, expenses, purchases] = await Promise.all([
      fetch('/api/bills').then(r => r.json()),
      fetch('/api/payments/received').then(r => r.json()),
      fetch('/api/payments/made').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/purchases').then(r => r.json()),
    ]);

    const dateFilter = (item) => item.date && item.date.startsWith(date);
    const all = [
      ...(Array.isArray(bills) ? bills.filter(dateFilter).map(b => ({ type: 'Sales', ref: b.bill_number, party: b.customer_name, amount: b.total, icon: '📄', color: 'var(--success)' })) : []),
      ...(Array.isArray(payments) ? payments.filter(dateFilter).map(p => ({ type: 'Receipt', ref: p.bill_number || '—', party: p.customer_name, amount: p.amount, icon: '📥', color: 'var(--success)' })) : []),
      ...(Array.isArray(paymentsMade) ? paymentsMade.filter(dateFilter).map(p => ({ type: 'Payment', ref: p.purchase_number || '—', party: p.vendor_name || '—', amount: p.amount, icon: '📤', color: 'var(--danger)' })) : []),
      ...(Array.isArray(expenses) ? expenses.filter(dateFilter).map(e => ({ type: 'Expense', ref: e.category, party: e.vendor_name || 'Direct', amount: e.amount, icon: '🧾', color: 'var(--danger)' })) : []),
      ...(Array.isArray(purchases) ? purchases.filter(dateFilter).map(p => ({ type: 'Purchase', ref: p.purchase_number, party: p.vendor_name, amount: p.total, icon: '🛒', color: 'var(--warning)' })) : []),
    ];

    setEntries(all);
    setTotals({
      receipts:  (Array.isArray(payments) ? payments.filter(dateFilter).reduce((s,p) => s + p.amount, 0) : 0),
      payments:  (Array.isArray(paymentsMade) ? paymentsMade.filter(dateFilter).reduce((s,p) => s + p.amount, 0) : 0) + (Array.isArray(expenses) ? expenses.filter(dateFilter).reduce((s,e) => s + e.amount, 0) : 0),
      sales:     (Array.isArray(bills) ? bills.filter(dateFilter).reduce((s,b) => s + b.total, 0) : 0),
      purchases: (Array.isArray(purchases) ? purchases.filter(dateFilter).reduce((s,p) => s + p.total, 0) : 0),
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const TYPE_BADGE = { Sales:'badge-success', Receipt:'badge-success', Payment:'badge-danger', Expense:'badge-danger', Purchase:'badge-warning' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div><h1>Day Book</h1><p>All transactions for a selected date</p></div>
      </div>

      <div className="flex align-center gap-4 mb-6">
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const d = new Date(date); d.setDate(d.getDate()-1);
            setDate(d.toISOString().split('T')[0]);
          }}>◀ Prev</button>
          <input type="date" className="form-input" style={{width:'180px'}} value={date} onChange={e => setDate(e.target.value)} />
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const d = new Date(date); d.setDate(d.getDate()+1);
            setDate(d.toISOString().split('T')[0]);
          }}>Next ▶</button>
        </div>
        <div style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{entries.length} transactions</div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 mb-6">
        {[
          { label:'Sales', value: totals.sales, color:'var(--success)' },
          { label:'Receipts', value: totals.receipts, color:'var(--accent-primary)' },
          { label:'Payments', value: totals.payments, color:'var(--danger)' },
          { label:'Purchases', value: totals.purchases, color:'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{padding:'16px', marginBottom:0, borderLeft:`3px solid ${s.color}`}}>
            <div style={{fontSize:'1.3rem', fontWeight:700, color:s.color}}>₹{s.value.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
            <div style={{fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, marginTop:'4px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>Type</th><th>Reference</th><th>Party</th><th style={{textAlign:'right'}}>Amount (₹)</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Loading…</td></tr>
              : entries.length === 0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No transactions on this date</td></tr>
              : entries.map((e, i) => (
                <tr key={i}>
                  <td><span className={`badge ${TYPE_BADGE[e.type]}`}>{e.icon} {e.type}</span></td>
                  <td><code style={{background:'var(--bg-tertiary)',padding:'2px 6px',borderRadius:'4px',fontSize:'0.8rem'}}>{e.ref}</code></td>
                  <td style={{fontWeight:500}}>{e.party}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:e.color}}>₹{e.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
