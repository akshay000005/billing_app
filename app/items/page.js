"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Items() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-8">
        <h1 style={{margin: 0}}>Master Items</h1>
        <Link href="/items/new" className="btn btn-primary">+ Add Item / Service</Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Base Rate (₹)</th>
                <th>GST Rate</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{fontWeight: 500}}>{item.name}</td>
                  <td>{item.description || '-'}</td>
                  <td>₹{item.rate.toFixed(2)}</td>
                  <td><span className="badge badge-success">{item.gst_rate}%</span></td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
