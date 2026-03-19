'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];

export default function ReceiptVoucherPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_id: '',
    bill_id: '',
    amount: '',
    credit_account: '',
    payment_mode: 'Cash',
    reference: '',
    narration: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []));
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []));
    fetch('/api/bills').then(r => r.json()).then(d => setBills(Array.isArray(d) ? d.filter(b => b.status !== 'paid') : []));
  }, []);

  const customerBills = bills.filter(b => !form.customer_id || String(b.customer_id) === String(form.customer_id));
  const selectedBill = bills.find(b => String(b.id) === String(form.bill_id));

  const save = async () => {
    if (!form.amount || !form.customer_id) return;
    setSaving(true);
    const res = await fetch('/api/payments/received', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        date: form.date,
        bill_id: form.bill_id || null,
        customer_id: parseInt(form.customer_id),
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        reference: form.reference,
        notes: form.narration,
      })
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setForm({ date: new Date().toISOString().split('T')[0], customer_id: '', bill_id: '', amount: '', credit_account: '', payment_mode: 'Cash', reference: '', narration: '' });
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="voucher-page animate-fade-in">
      <div className="voucher-header">
        <div style={{padding:'8px 16px', borderRadius:'6px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--success)', fontWeight:700, fontSize:'0.78rem', letterSpacing:'0.08em'}}>📥 RECEIPT VOUCHER</div>
        <div style={{marginLeft:'auto', display:'flex', gap:'8px'}}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>← Back</button>
        </div>
      </div>

      {saved && <div style={{padding:'12px 16px',background:'rgba(16,185,129,0.15)',border:'1px solid var(--success)',borderRadius:'8px',color:'var(--success)',fontWeight:600,marginBottom:'20px'}}>✓ Receipt saved successfully!</div>}

      <div className="card" style={{borderLeft:'3px solid var(--success)'}}>
        <div className="grid grid-cols-3" style={{gap:'1rem',marginBottom:'1rem'}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Voucher Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Payment Mode</label>
            <select className="form-input" value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Reference #</label>
            <input className="form-input" placeholder="UTR / Cheque no." value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
          </div>
        </div>

        <div style={{background:'var(--bg-tertiary)', borderRadius:'8px', padding:'20px', marginBottom:'1rem', border:'1px solid var(--border-color)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'1rem', alignItems:'end'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Received From (Customer) *</label>
              <select className="form-input" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value, bill_id: ''})}>
                <option value="">— Select Customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Against Invoice (optional)</label>
              <select className="form-input" value={form.bill_id} onChange={e => {
                const b = bills.find(b => String(b.id) === e.target.value);
                setForm({...form, bill_id: e.target.value, amount: b ? String(b.total) : form.amount});
              }}>
                <option value="">— No specific invoice —</option>
                {customerBills.map(b => <option key={b.id} value={b.id}>{b.bill_number} — ₹{b.total.toLocaleString('en-IN')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-input" style={{fontSize:'1.1rem',fontWeight:700}} placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="form-group" style={{marginBottom:'1rem'}}>
          <label className="form-label">Narration</label>
          <input className="form-input" placeholder="Payment details, remarks…" value={form.narration} onChange={e => setForm({...form, narration: e.target.value})} />
        </div>

        {/* Summary */}
        <div style={{background:'rgba(16,185,129,0.08)', borderRadius:'8px', padding:'16px', border:'1px solid rgba(16,185,129,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <span style={{color:'var(--text-secondary)', fontWeight:600}}>Cash / Bank Dr.</span>
          <span style={{fontSize:'1.4rem', fontWeight:800, color:'var(--success)'}}>₹{parseFloat(form.amount||0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
          <span style={{color:'var(--text-secondary)', fontWeight:600}}>Accounts Receivable Cr.</span>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={save} disabled={saving || !form.amount || !form.customer_id}>
            {saving ? '⏳ Saving…' : '✓ Save Receipt (F6)'}
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/payments/received')}>View All Receipts</button>
        </div>
      </div>
    </div>
  );
}
