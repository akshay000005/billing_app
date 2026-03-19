'use client';
import { useState, useEffect } from 'react';
import { useUser, ROLES } from '../components/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => {
      setUsers(Array.isArray(d) ? d.filter(u => u.is_active) : []);
      setLoading(false);
    });
  }, []);

  const handlePinKey = (key) => {
    if (key === 'C') { setPin(''); setError(''); return; }
    if (pin.length >= 4) return;
    const newPin = pin + key;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => verifyPin(newPin), 100);
    }
  };

  const verifyPin = async (enteredPin) => {
    const all = await fetch('/api/users').then(r => r.json());
    const user = all.find(u => u.id === selected.id);
    if (!user) { setError('User not found'); setPin(''); return; }

    const check = await fetch('/api/users/verify', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id: user.id, pin: enteredPin })
    }).then(r => r.json()).catch(() => ({ ok: false }));

    if (check.ok) {
      setUser({ id: user.id, name: user.name, role: user.role, avatar_color: user.avatar_color });
      router.push('/');
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  if (loading) return (
    <div className="login-page">
      <div style={{color:'var(--text-muted)'}}>Loading…</div>
    </div>
  );

  return (
    <div className="login-page">
      {/* Logo */}
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(135deg,var(--accent-primary),var(--accent-purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:800,color:'var(--bg-primary)',margin:'0 auto 16px',boxShadow:'0 0 30px rgba(0,245,255,0.3)'}}>A</div>
        <h1 style={{fontSize:'1.8rem',marginBottom:'6px'}}>AccounPro</h1>
        <p style={{margin:0,color:'var(--text-muted)',fontSize:'0.9rem'}}>Select your profile to continue</p>
      </div>

      {!selected ? (
        /* User selection */
        <div style={{width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', gap:'12px'}}>
          {users.length === 0 ? (
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:'40px 0'}}>No users found. Please set up users in Settings.</div>
          ) : users.map(u => (
            <button key={u.id} className="user-tile" onClick={() => { setSelected(u); setPin(''); setError(''); }}>
              <div className="avatar" style={{background: u.avatar_color, fontSize:'0.9rem'}}>{initials(u.name)}</div>
              <div>
                <div style={{fontWeight:600,fontSize:'0.95rem'}}>{u.name}</div>
                <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'2px'}}>
                  <span style={{color: ROLES[u.role]?.color, fontWeight:700}}>{ROLES[u.role]?.label || u.role}</span>
                </div>
              </div>
              <div style={{marginLeft:'auto',color:'var(--text-muted)',fontSize:'1.2rem'}}>→</div>
            </button>
          ))}
        </div>
      ) : (
        /* PIN entry */
        <div style={{width:'100%', maxWidth:'300px', textAlign:'center'}}>
          <button className="user-tile" style={{marginBottom:'28px',width:'100%'}} onClick={() => { setSelected(null); setPin(''); setError(''); }}>
            <div className="avatar" style={{background: selected.avatar_color}}>{initials(selected.name)}</div>
            <div>
              <div style={{fontWeight:600}}>{selected.name}</div>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{ROLES[selected.role]?.label}</div>
            </div>
            <div style={{marginLeft:'auto',color:'var(--text-muted)',fontSize:'0.75rem'}}>← Change</div>
          </button>

          <p style={{marginBottom:'20px',fontWeight:600,fontSize:'0.9rem',color:'var(--text-secondary)'}}>Enter PIN</p>

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-6">
            {[0,1,2,3].map(i => (
              <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}></div>
            ))}
          </div>

          {/* PIN pad */}
          <div className="pin-pad" style={{margin:'0 auto 16px'}}>
            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => (
              <button key={k} className="pin-key" onClick={() => {
                if (k === '⌫') { setPin(p => p.slice(0,-1)); setError(''); }
                else handlePinKey(k);
              }}>{k}</button>
            ))}
          </div>

          {error && <div style={{color:'var(--danger)',fontSize:'0.85rem',marginTop:'10px',fontWeight:500}}>{error}</div>}
        </div>
      )}

      <p style={{marginTop:'40px',fontSize:'0.75rem',color:'var(--text-muted)'}}>Default admin PIN: 1234</p>
    </div>
  );
}
