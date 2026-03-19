'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];
const EXPENSE_CATS = ['Salaries & Wages','Rent','Utilities','Office Supplies','Travel & Transport','Marketing & Advertising','Professional Fees','Cost of Goods Sold','Miscellaneous'];

export default function PaymentVoucherPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'vendor',     // 'vendor' | 'expense'
    vendor_id: '',
    purchase_id: '',
    expense_category: 'Miscellaneous',
    amount: '',
    payment_mode: 'Cash',
    reference: '',
    narration: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/vendors').then(r => r.json()).then(d => setVendors(Array.isArray(d) ? d : []));
    fetch('/api/purchases').then(r => r.json()).then(d => setPurchases(Array.isArray(d) ? d.filter(p => p.status !== 'paid') : []));
  }, []);

  const save = async () => {
    if (!form.amount) return;
    setSaving(true);
    if (form.type === 'vendor') {
      await fetch('/api/payments/made', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          date: form.date, purchase_id: form.purchase_id || null,
          vendor_id: form.vendor_id || null, amount: parseFloat(form.amount),
          payment_mode: form.payment_mode, reference: form.reference, notes: form.narration
        })
      });
    } else {
      await fetch('/api/expenses', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          date: form.date, category: form.expense_category, description: form.narration,
          amount: parseFloat(form.amount), vendor_id: form.vendor_id || null,
          payment_mode: form.payment_mode, reference: form.reference
        })
      });
    }
    setSaving(false);
    setSaved(true);
    setForm({ date: new Date().toISOString().split('T')[0], type: 'vendor', vendor_id: '', purchase_id: '', expense_category: 'Miscellaneous', amount: '', payment_mode: 'Cash', reference: '', narration: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="voucher-page animate-fade-in">
      <div className="voucher-header">
        <div style={{padding:'8px 16px', borderRadius:'6px', background:'rgba(244,63,94,0.15)', border:'1px solid rgba(244,63,94,0.3)', color:'var(--danger)', fontWeight:700, fontSize:'0.78rem', letterSpacing:'0.08em'}}>📤 PAYMENT VOUCHER</div>
        <div style={{marginLeft:'auto'}}><button className="btn btn-secondary btn-sm" onClick={() => router.back()}>← Back</button></div>
      </div>

      {saved && <div style={{padding:'12px 16px',background:'rgba(244,63,94,0.1)',border:'1px solid var(--danger)',borderRadius:'8px',color:'var(--danger)',fontWeight:600,marginBottom:'20px'}}>✓ Payment saved!</div>}

      <div className="card" style={{borderLeft:'3px solid var(--danger)'}}>
        {/* Type toggle */}
        <div className="flex gap-2 mb-6">
          {['vendor','expense'].map(t => (
            <button key={t} className={form.type === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setForm({...form, type: t})}>
              {t === 'vendor' ? '🏭 Vendor Payment' : '🧾 Direct Expense'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3" style={{gap:'1rem',marginBottom:'1rem'}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Date</label>
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
          <div className="grid grid-cols-3" style={{gap:'1rem', alignItems:'end'}}>
            {form.type === 'vendor' ? <>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Pay To (Vendor)</label>
                <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value, purchase_id: ''})}>
                  <option value="">— Select Vendor —</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Against PO (optional)</label>
                <select className="form-input" value={form.purchase_id} onChange={e => {
                  const p = purchases.find(p => String(p.id) === e.target.value);
                  setForm({...form, purchase_id: e.target.value, amount: p ? String(p.total) : form.amount});
                }}>
                  <option value="">— No PO —</option>
                  {purchases.filter(p => !form.vendor_id || String(p.vendor_id) === String(form.vendor_id)).map(p => <option key={p.id} value={p.id}>{p.purchase_number} — ₹{p.total.toLocaleString('en-IN')}</option>)}
                </select>
              </div>
            </> : <>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Expense Category</label>
                <select className="form-input" value={form.expense_category} onChange={e => setForm({...form, expense_category: e.target.value})}>
                  {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Vendor (optional)</label>
                <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
                  <option value="">— None —</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </>}
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className="form-input" style={{fontSize:'1.1rem',fontWeight:700}} placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="form-group" style={{marginBottom:'1rem'}}>
          <label className="form-label">Narration</label>
          <input className="form-input" placeholder="Payment details…" value={form.narration} onChange={e => setForm({...form, narration: e.target.value})} />
        </div>

        <div style={{background:'rgba(244,63,94,0.08)', borderRadius:'8px', padding:'16px', border:'1px solid rgba(244,63,94,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <span style={{color:'var(--text-secondary)', fontWeight:600}}>Payable / Expense Dr.</span>
          <span style={{fontSize:'1.4rem', fontWeight:800, color:'var(--danger)'}}>₹{parseFloat(form.amount||0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
          <span style={{color:'var(--text-secondary)', fontWeight:600}}>Cash / Bank Cr.</span>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={save} disabled={saving || !form.amount}>
            {saving ? '⏳ Saving…' : '✓ Save Payment (F5)'}
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/payments/made')}>View All Payments</button>
        </div>
      </div>
    </div>
  );
}
