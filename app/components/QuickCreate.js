'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';

const QUICK_ACTIONS = [
  { icon: '📥', label: 'Receipt', desc: 'Record money received',      href: '/vouchers/receipt',   color: '#10b981' },
  { icon: '📤', label: 'Payment', desc: 'Record money paid out',      href: '/vouchers/payment',   color: '#f43f5e' },
  { icon: '📄', label: 'Invoice', desc: 'Create a new invoice',       href: '/bills/new',          color: '#3b82f6' },
  { icon: '🛒', label: 'Purchase',desc: 'New purchase order',         href: '/purchases/new',      color: '#f59e0b' },
  { icon: '🧾', label: 'Expense', desc: 'Log a business expense',     href: '/expenses',           color: '#a855f7' },
  { icon: '🔄', label: 'Contra',  desc: 'Cash / bank transfer',       href: '/vouchers/contra',    color: '#14b8a6' },
];

export default function QuickCreate() {
  const [open, setOpen] = useState(false);
  const { can } = useUser();
  const router = useRouter();

  const go = (href) => { setOpen(false); router.push(href); };

  return (
    <>
      <button className="quick-create-btn no-print" onClick={() => setOpen(true)} title="Quick Create (Q)">
        +
      </button>

      {open && (
        <div className="quick-create-modal" onClick={() => setOpen(false)}>
          <div className="quick-create-grid" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between align-center mb-6">
              <div>
                <h2 style={{marginBottom:'2px'}}>Quick Create</h2>
                <p style={{margin:0,fontSize:'0.8rem'}}>Choose an action to start</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.href} onClick={() => go(a.href)}
                  style={{padding:'16px',borderRadius:'10px',border:'1px solid var(--border-color)',background:'var(--bg-secondary)',cursor:'pointer',textAlign:'left',transition:'all 0.15s',display:'flex',gap:'12px',alignItems:'center'}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                  <div style={{fontSize:'1.4rem'}}>{a.icon}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.9rem',color:'var(--text-primary)'}}>{a.label}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'2px'}}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <p style={{textAlign:'center',marginTop:'16px',fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:0}}>Press <kbd style={{padding:'2px 6px',borderRadius:'4px',border:'1px solid var(--border-color)',fontSize:'0.7rem'}}>Esc</kbd> to close</p>
          </div>
        </div>
      )}
    </>
  );
}
