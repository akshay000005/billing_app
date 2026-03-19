"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => fetch('/api/purchases').then(r => r.json()).then(d => setPurchases(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const filtered = purchases.filter(p =>
    p.purchase_number.includes(search) || p.vendor_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnpaid = purchases.filter(p => p.status !== 'paid').reduce((s, p) => s + p.total, 0);
  const totalPaid = purchases.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);

  const statusBadge = (s) => {
    if (s === 'paid') return <span className="badge badge-success">Paid</span>;
    if (s === 'partial') return <span className="badge badge-warning">Partial</span>;
    return <span className="badge badge-danger">Unpaid</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-6">
        <div>
          <h1 style={{marginBottom:'4px'}}>Purchase Orders</h1>
          <p style={{margin:0}}>Track bills from vendors</p>
        </div>
        <Link href="/purchases/new" className="btn btn-primary">+ New Purchase</Link>
      </div>

      <div className="grid grid-cols-3 mb-6">
        <div className="card" style={{padding:'16px', marginBottom:0}}>
          <div className="stat-val" style={{fontSize:'1.6rem'}}>{purchases.length}</div>
          <div className="stat-label">Total Purchases</div>
        </div>
        <div className="card" style={{padding:'16px', marginBottom:0}}>
          <div className="stat-val" style={{fontSize:'1.6rem', color:'var(--danger)'}}>₹{totalUnpaid.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label">Outstanding Payable</div>
        </div>
        <div className="card" style={{padding:'16px', marginBottom:0}}>
          <div className="stat-val" style={{fontSize:'1.6rem', color:'var(--success)'}}>₹{totalPaid.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
          <div className="stat-label">Total Paid</div>
        </div>
      </div>

      <div className="card" style={{padding:'12px 16px', marginBottom:'16px'}}>
        <input className="form-input" style={{border:'none', padding:'8px 0', boxShadow:'none', fontSize:'0.95rem'}}
          placeholder="🔍  Search by PO number or vendor…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>PO Number</th><th>Vendor</th><th>Date</th><th>Due Date</th><th>Status</th><th style={{textAlign:'right'}}>Total</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>
                  {purchases.length === 0 ? 'No purchase orders yet' : 'No results'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><code style={{background:'var(--bg-tertiary)', padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem'}}>{p.purchase_number}</code></td>
                  <td style={{fontWeight:500}}>{p.vendor_name}</td>
                  <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td>{p.due_date ? new Date(p.due_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td style={{textAlign:'right', fontWeight:600}}>₹{p.total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
