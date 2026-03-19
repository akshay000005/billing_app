"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBill() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  
  const [billData, setBillData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    template: 'professional',
    isIgst: false
  });
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => { if(Array.isArray(d)) setCustomers(d); });
    fetch('/api/items').then(r => r.json()).then(d => { if(Array.isArray(d)) setItemsList(d); });
  }, []);

  const addItem = (itemId) => {
    if (!itemId) return;
    const item = itemsList.find(i => i.id == itemId);
    if (!item) return;
    
    setCart([...cart, {
      item_id: item.id,
      name: item.name,
      rate: item.rate,
      gst_rate: item.gst_rate,
      quantity: 1,
      amount: item.rate
    }]);
  };

  const updateQuantity = (index, qty) => {
    const newCart = [...cart];
    newCart[index].quantity = qty;
    newCart[index].amount = qty * newCart[index].rate;
    setCart(newCart);
  };

  const updateAmount = (index, amount) => {
    const newCart = [...cart];
    newCart[index].amount = amount;
    // We intentionally don't update rate based on amount, so the user can just override the taxable value directly.
    setCart(newCart);
  };

  const removeRow = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, row) => acc + row.amount, 0);
  
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  
  cart.forEach(row => {
    const taxAmt = row.amount * (row.gst_rate / 100);
    if (billData.isIgst) {
      igstTotal += taxAmt;
    } else {
      cgstTotal += taxAmt / 2;
      sgstTotal += taxAmt / 2;
    }
  });
  
  const total = subtotal + cgstTotal + sgstTotal + igstTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!billData.customer_id || cart.length === 0) return alert("Select customer and add at least 1 item");
    
    setLoading(true);
    const payload = {
      bill: {
        customer_id: parseInt(billData.customer_id),
        date: billData.date,
        template: billData.template,
        subtotal,
        cgst: cgstTotal,
        sgst: sgstTotal,
        igst: igstTotal,
        total
      },
      items: cart.map(row => ({
        item_id: row.item_id,
        quantity: row.quantity,
        rate: row.rate,
        amount: row.amount
      }))
    };

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/bills/${data.billId}`);
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (e) {
      console.error(e);
      alert("Submission failed");
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h1>Create New Invoice</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="card glass">
          <h2>Bill Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select required className="form-input" value={billData.customer_id} onChange={e => setBillData({...billData, customer_id: e.target.value})}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.custom_id})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Date *</label>
              <input required type="date" className="form-input" value={billData.date} onChange={e => setBillData({...billData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Template</label>
              <select className="form-input" value={billData.template} onChange={e => setBillData({...billData, template: e.target.value})}>
                <option value="professional">Professional Layout</option>
                <option value="minimal">Minimal Layout</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="flex align-center gap-2" style={{cursor: 'pointer'}}>
                <input type="checkbox" checked={billData.isIgst} onChange={e => setBillData({...billData, isIgst: e.target.checked})} style={{width: '20px', height: '20px'}} />
                <span className="form-label" style={{marginBottom: 0}}>Apply IGST (Inter-state supply)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="card glass">
          <h2>Invoice Items</h2>
          <div className="form-group flex gap-4 align-center mb-4">
            <select className="form-input" style={{flex: 1}} onChange={e => { addItem(e.target.value); e.target.value=""; }}>
              <option value="">+ Select Item to Add</option>
              {itemsList.map(i => <option key={i.id} value={i.id}>{i.name} - ₹{i.rate} ({i.gst_rate}% GST)</option>)}
            </select>
          </div>

          {cart.length > 0 && (
            <div className="table-container mb-8">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Rate</th>
                    <th style={{width: '120px'}}>Qty</th>
                    <th>GST %</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.name}</td>
                      <td>₹{row.rate.toFixed(2)}</td>
                      <td>
                        <input type="number" min="1" className="form-input" style={{padding: '8px'}} value={row.quantity} onChange={e => updateQuantity(idx, parseInt(e.target.value) || 1)} />
                      </td>
                      <td>{row.gst_rate}%</td>
                      <td>
                        <input type="number" step="0.01" className="form-input" style={{padding: '8px', width: '100px'}} value={row.amount} onChange={e => updateAmount(idx, parseFloat(e.target.value) || 0)} />
                      </td>
                      <td><button type="button" className="btn btn-danger" style={{padding: '6px 12px'}} onClick={() => removeRow(idx)}>X</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <div style={{flex: 1}}></div>
            <div style={{width: '300px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px'}}>
              <div className="flex justify-between mb-2"><span>Subtotal:</span> <strong>₹{subtotal.toFixed(2)}</strong></div>
              {!billData.isIgst ? (
                <>
                  <div className="flex justify-between mb-2"><span>CGST:</span> <strong>₹{cgstTotal.toFixed(2)}</strong></div>
                  <div className="flex justify-between mb-2"><span>SGST:</span> <strong>₹{sgstTotal.toFixed(2)}</strong></div>
                </>
              ) : (
                <div className="flex justify-between mb-2"><span>IGST:</span> <strong>₹{igstTotal.toFixed(2)}</strong></div>
              )}
              <hr style={{margin: '10px 0', borderColor: 'var(--border-color)'}} />
              <div className="flex justify-between" style={{fontSize: '1.2rem'}}><span>Total:</span> <strong>₹{total.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{width: '100%', fontSize: '1.1rem', padding: '16px'}} disabled={loading || cart.length === 0}>
          {loading ? 'Generating Invoice...' : 'Generate Invoice'}
        </button>
      </form>
    </div>
  );
}
