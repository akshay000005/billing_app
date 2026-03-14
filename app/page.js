"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({ bills: 0, customers: 0, items: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/bills').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/items').then(r => r.json()),
    ]).then(([b, c, i]) => {
      setStats({
        bills: Array.isArray(b) ? b.length : 0,
        customers: Array.isArray(c) ? c.length : 0,
        items: Array.isArray(i) ? i.length : 0,
      });
    }).catch(e => console.error(e));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1>Dashboard</h1>
      
      <div className="grid grid-cols-3 mb-8">
        <div className="card glass">
          <div className="stat-val">{stats.bills}</div>
          <div className="stat-label">Total Invoices</div>
        </div>
        <div className="card glass">
          <div className="stat-val">{stats.customers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="card glass">
          <div className="stat-val">{stats.items}</div>
          <div className="stat-label">Master Items</div>
        </div>
      </div>

      <h2>Quick Actions</h2>
      <div className="flex gap-4">
        <Link href="/bills/new" className="btn btn-primary">Create New Invoice</Link>
        <Link href="/customers" className="btn btn-secondary">Add Customer</Link>
        <Link href="/items" className="btn btn-secondary">Manage Items</Link>
      </div>
    </div>
  );
}
