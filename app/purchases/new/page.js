"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPurchasePage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ vendor_id: '', date: new Date().toISOString().split('T')[0], due_date: '', notes: '' });
  const [lines, setLines] = useState([{ item_name: '', quantity: 1, rate: '', gst_rate: 0, amount: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/vendors').then(r => r.json()).then(d => setVendors(Array.isArray(d) ? d : []));
  }, []);

  const updateLine = (idx, field, val) => {
    const updated = [...lines];
    updated[idx][field] = val;
    if (field === 'quantity' || field === 'rate') {
      updated[idx].amount = parseFloat(updated[idx].quantity || 0) * parseFloat(updated[idx].rate || 0);
    }
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { item_name: '', quantity: 1, rate: '', gst_rate: 0, amount: 0 }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const subtotal = lines.reduce((s, l) => s + (l.amount || 0), 0);
  const totalGST = lines.reduce((s, l) => {
    const base = l.amount || 0;
    const rate = parseFloat(l.gst_rate) || 0;
    return s + (base * rate / 100);
  }, 0);
  const total = subtotal + totalGST;

  const save = async () => {
    if (!form.vendor_id || lines.some(l => !l.item_name || !l.rate)) return;
    setSaving(true);
    const items = lines.map(l => {
      const base = parseFloat(l.quantity) * parseFloat(l.rate);
      const gstAmt = base * (parseFloat(l.gst_rate) || 0) / 100;
      return { ...l, amount: base, cgst: gstAmt/2, sgst: gstAmt/2, igst: 0 };
    });
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, items })
    });
    setSaving(false);
    if (res.ok) router.push('/purchases');
  };

  return (
    <div className="animate-fade-in" style={{maxWidth:'900px'}}>
      <div className="flex align-center gap-4 mb-6">
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back</button>
        <h1 style={{marginBottom:0}}>New Purchase Order</h1>
      </div>

      <div className="card mb-4">
        <h3 className="mb-4">Purchase Details</h3>
        <div className="grid grid-cols-3" style={{gap:'1rem'}}>
          <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
            <label className="form-label">Vendor *</label>
            <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
              <option value="">— Select Vendor —</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0, gridColumn:'span 2'}}>
            <label className="form-label">Notes</label>
            <input className="form-input" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between align-center mb-4">
          <h3 style={{margin:0}}>Line Items</h3>
          <button className="btn btn-secondary" onClick={addLine}>+ Add Row</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Item / Service</th><th>Qty</th><th>Rate (₹)</th><th>GST %</th><th style={{textAlign:'right'}}>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td><input className="form-input" placeholder="Item name" value={l.item_name} onChange={e => updateLine(idx, 'item_name', e.target.value)} /></td>
                  <td><input type="number" className="form-input" style={{width:'70px'}} min="1" value={l.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} /></td>
                  <td><input type="number" className="form-input" style={{width:'110px'}} placeholder="0.00" value={l.rate} onChange={e => updateLine(idx, 'rate', e.target.value)} /></td>
                  <td>
                    <select className="form-input" style={{width:'80px'}} value={l.gst_rate} onChange={e => updateLine(idx, 'gst_rate', e.target.value)}>
                      {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td style={{textAlign:'right', fontWeight:600}}>₹{(l.amount||0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                  <td><button onClick={() => removeLine(idx)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--danger)', fontSize:'1.1rem'}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'16px'}}>
          <div style={{width:'280px'}}>
            <div className="flex justify-between" style={{padding:'8px 0', borderBottom:'1px solid var(--border-color)', fontSize:'0.9rem', color:'var(--text-secondary)'}}>
              <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between" style={{padding:'8px 0', borderBottom:'1px solid var(--border-color)', fontSize:'0.9rem', color:'var(--text-secondary)'}}>
              <span>GST</span><span>₹{totalGST.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between" style={{padding:'12px 0', fontWeight:700, fontSize:'1.1rem'}}>
              <span>Total</span><span>₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Purchase Order'}</button>
        <button className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </div>
  );
}
