"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Bills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/bills');
      const data = await res.json();
      if (Array.isArray(data)) setBills(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-8">
        <h1 style={{margin: 0}}>Invoices</h1>
        <Link href="/bills/new" className="btn btn-primary">+ Create New Invoice</Link>
      </div>
      
      <div className="card glass">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Total Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td><span className="badge badge-success" style={{fontSize: '0.9rem'}}>{bill.bill_number}</span></td>
                  <td>{bill.date}</td>
                  <td style={{fontWeight: 500}}>{bill.customer_name}</td>
                  <td>{bill.customer_custom_id}</td>
                  <td style={{fontWeight: 700}}>₹{bill.total.toFixed(2)}</td>
                  <td>
                    <Link href={`/bills/${bill.id}`} className="btn btn-secondary" style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                      View / Print
                    </Link>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No invoices generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
