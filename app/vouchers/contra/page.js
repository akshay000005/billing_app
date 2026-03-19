'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContraPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    from_account: '',
    to_account: '',
    amount: '',
    reference: '',
    narration: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => {
      const cash = Array.isArray(d) ? d.filter(a => ['1001','1002'].includes(a.code) || a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')) : [];
      setAccounts(cash.length ? cash : (Array.isArray(d) ? d.filter(a => a.type === 'Asset') : []));
    });
  }, []);

  const save = async () => {
    if (!form.amount || !form.from_account || !form.to_account) return;
    if (form.from_account === form.to_account) return;
    setSaving(true);
    // Post as journal entry: Debit to_account, Credit from_account
    await fetch('/api/journal', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        date: form.date,
        reference: form.reference || `CONTRA-${Date.now()}`,
        description: `Contra: Transfer ${form.narration || ''}`,
        narration: form.narration,
        source: 'contra',
        lines: [
          { account_id: parseInt(form.to_account),   debit: parseFloat(form.amount), credit: 0, description: 'Transfer in' },
          { account_id: parseInt(form.from_account), debit: 0, credit: parseFloat(form.amount), description: 'Transfer out' },
        ]
      })
    });
    setSaving(false);
    setSaved(true);
    setForm({ date: new Date().toISOString().split('T')[0], from_account: '', to_account: '', amount: '', reference: '', narration: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="voucher-page animate-fade-in">
      <div className="voucher-header">
        <div style={{padding:'8px 16px', borderRadius:'6px', background:'rgba(20,184,166,0.15)', border:'1px solid rgba(20,184,166,0.3)', color:'#14b8a6', fontWeight:700, fontSize:'0.78rem', letterSpacing:'0.08em'}}>🔄 CONTRA VOUCHER</div>
        <div style={{color:'var(--text-muted)',fontSize:'0.85rem', marginLeft:'12px'}}>Cash ↔ Bank Transfer</div>
        <div style={{marginLeft:'auto'}}><button className="btn btn-secondary btn-sm" onClick={() => router.back()}>← Back</button></div>
      </div>

      {saved && <div style={{padding:'12px 16px',background:'rgba(20,184,166,0.1)',border:'1px solid #14b8a6',borderRadius:'8px',color:'#14b8a6',fontWeight:600,marginBottom:'20px'}}>✓ Contra entry saved!</div>}

      <div className="card" style={{borderLeft:'3px solid #14b8a6'}}>
        <div className="grid grid-cols-2" style={{gap:'1rem',marginBottom:'1rem'}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Reference</label>
            <input className="form-input" placeholder="Transfer reference" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
          </div>
        </div>

        <div style={{background:'var(--bg-tertiary)', borderRadius:'12px', padding:'24px', marginBottom:'1rem', border:'1px solid var(--border-color)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{flex:1}}>
              <label className="form-label">Transfer FROM</label>
              <select className="form-input" value={form.from_account} onChange={e => setForm({...form, from_account: e.target.value})}>
                <option value="">— Select Account —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{fontSize:'2rem', marginTop:'20px', color:'#14b8a6'}}>→</div>
            <div style={{flex:1}}>
              <label className="form-label">Transfer TO</label>
              <select className="form-input" value={form.to_account} onChange={e => setForm({...form, to_account: e.target.value})}>
                <option value="">— Select Account —</option>
                {accounts.filter(a => String(a.id) !== String(form.from_account)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:'16px'}}>
            <label className="form-label">Amount (₹) *</label>
            <input type="number" className="form-input" style={{fontSize:'1.3rem',fontWeight:700,textAlign:'center'}} placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
        </div>

        <div className="form-group" style={{marginBottom:'20px'}}>
          <label className="form-label">Narration</label>
          <input className="form-input" placeholder="Transfer reason…" value={form.narration} onChange={e => setForm({...form, narration: e.target.value})} />
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={save} disabled={saving || !form.amount || !form.from_account || !form.to_account}>
            {saving ? '⏳ Saving…' : '✓ Save Contra (F4)'}
          </button>
        </div>
      </div>
    </div>
  );
}
