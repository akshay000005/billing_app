"use client";
import React, { useState, useEffect } from 'react';
import { THEMES, useTheme } from '../components/ThemeProvider';
import { ROLES } from '../components/UserContext';

const AVATAR_COLORS = ['#f43f5e','#f59e0b','#10b981','#3b82f6','#a855f7','#14b8a6','#00f5ff','#f97316'];

export default function Settings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [tab, setTab] = useState('company');

  // Company settings
  const [company, setCompany] = useState({ company_name:'', company_address:'', gstin:'', phone:'', email:'', invoice_template:'professional' });
  const [companyMsg, setCompanyMsg] = useState('');

  // Users
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ name:'', role:'employee', pin:'', avatar_color:'#00f5ff' });
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d && !d.error) setCompany(d); });
    loadUsers();
  }, []);

  const loadUsers = () => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(company) });
    if (res.ok) { setCompanyMsg('Saved!'); setTimeout(() => setCompanyMsg(''), 2500); }
  };

  const saveUser = async () => {
    if (!userForm.name || !userForm.pin) return;
    if (editUser) {
      await fetch('/api/users', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...userForm, id: editUser.id, is_active: true}) });
    } else {
      await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(userForm) });
    }
    setShowUserForm(false);
    setEditUser(null);
    setUserForm({name:'', role:'employee', pin:'', avatar_color:'#00f5ff'});
    setUserMsg(editUser ? 'User updated.' : 'User added.');
    setTimeout(() => setUserMsg(''), 2500);
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users?id=${id}`, { method:'DELETE' });
    loadUsers();
  };

  const startEdit = (u) => {
    setEditUser(u);
    setUserForm({ name: u.name, role: u.role, pin: u.pin || '', avatar_color: u.avatar_color });
    setShowUserForm(true);
  };

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';

  const TAB_STYLE = (active) => ({
    padding:'10px 20px', borderRadius:'8px', border:'1px solid',
    borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
    background: active ? 'rgba(0,245,255,0.1)' : 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
    cursor:'pointer', fontWeight: active ? 700 : 500, fontSize:'0.875rem',
    fontFamily:'inherit', transition:'all 0.15s'
  });

  return (
    <div className="animate-fade-in">
      <h1>Settings</h1>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-6">
        <button style={TAB_STYLE(tab==='company')} onClick={() => setTab('company')}>🏢 Company</button>
        <button style={TAB_STYLE(tab==='themes')}  onClick={() => setTab('themes')}>🎨 Themes</button>
        <button style={TAB_STYLE(tab==='users')}   onClick={() => setTab('users')}>👥 Users & Roles</button>
      </div>

      {/* ── COMPANY TAB ── */}
      {tab === 'company' && (
        <div className="card">
          <h2 className="mb-4">Business Details</h2>
          {companyMsg && <div style={{padding:'10px 14px',background:'rgba(16,185,129,0.15)',border:'1px solid var(--success)',borderRadius:'8px',color:'var(--success)',fontWeight:600,marginBottom:'16px'}}>✓ {companyMsg}</div>}
          <form onSubmit={saveCompany} className="grid grid-cols-3" style={{gap:'1rem'}}>
            <div className="form-group" style={{gridColumn:'span 2',marginBottom:0}}>
              <label className="form-label">Company Name *</label>
              <input required type="text" className="form-input" value={company.company_name||''} onChange={e => setCompany({...company, company_name:e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">GSTIN</label>
              <input type="text" className="form-input" value={company.gstin||''} onChange={e => setCompany({...company, gstin:e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" value={company.phone||''} onChange={e => setCompany({...company, phone:e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={company.email||''} onChange={e => setCompany({...company, email:e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Invoice Template</label>
              <select className="form-input" value={company.invoice_template||'professional'} onChange={e => setCompany({...company, invoice_template:e.target.value})}>
                <option value="professional">Professional</option>
                <option value="modern_color">Modern Colorful</option>
                <option value="minimal">Minimalist</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn:'span 3',marginBottom:0}}>
              <label className="form-label">Company Address</label>
              <textarea className="form-input" rows="3" value={company.company_address||''} onChange={e => setCompany({...company, company_address:e.target.value})} />
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <button type="submit" className="btn btn-primary">Save Company Settings</button>
            </div>
          </form>
        </div>
      )}

      {/* ── THEMES TAB ── */}
      {tab === 'themes' && (
        <div className="card">
          <h2 className="mb-2">App Theme</h2>
          <p>Choose a theme for the entire application. Changes apply instantly.</p>
          <div className="grid grid-cols-3" style={{gap:'16px', marginTop:'8px'}}>
            {THEMES.map(t => (
              <div key={t.id} className={`theme-card${currentTheme === t.id ? ' active' : ''}`} onClick={() => setTheme(t.id)}>
                {/* Color preview */}
                <div style={{display:'flex', gap:'6px', marginBottom:'12px'}}>
                  {t.colors.map((c,i) => <div key={i} style={{width:24,height:24,borderRadius:'50%',background:c,border:'2px solid rgba(255,255,255,0.1)'}}></div>)}
                </div>
                <div style={{fontWeight:700, fontSize:'0.95rem'}}>{t.name}</div>
                <div style={{fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'4px'}}>{t.desc}</div>
                {currentTheme === t.id && <div style={{marginTop:'8px', fontSize:'0.75rem', color:'var(--accent-primary)', fontWeight:700}}>✓ Active</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <>
          <div className="flex justify-between align-center mb-4">
            <div>
              <h2 style={{marginBottom:'2px'}}>Users & Roles</h2>
              <p style={{margin:0,fontSize:'0.85rem'}}>Manage who can access the software and what they can do</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowUserForm(true); setEditUser(null); setUserForm({name:'',role:'employee',pin:'',avatar_color:'#00f5ff'}); }}>+ Add User</button>
          </div>

          {userMsg && <div style={{padding:'10px 14px',background:'rgba(16,185,129,0.15)',border:'1px solid var(--success)',borderRadius:'8px',color:'var(--success)',fontWeight:600,marginBottom:'16px'}}>✓ {userMsg}</div>}

          {/* Role description legend */}
          <div className="grid grid-cols-4 mb-6">
            {Object.entries(ROLES).map(([key, role]) => (
              <div key={key} className="card" style={{padding:'14px',marginBottom:0,borderLeft:`3px solid ${role.color}`}}>
                <div style={{fontWeight:700,color:role.color,fontSize:'0.9rem'}}>{role.label}</div>
                <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'4px'}}>
                  {key === 'admin'    && 'Full access. Manage users & settings.'}
                  {key === 'manager'  && 'All features, no user management.'}
                  {key === 'employee' && 'Create invoices, expenses, purchases.'}
                  {key === 'auditor'  && 'Read-only. View all reports.'}
                </div>
              </div>
            ))}
          </div>

          {showUserForm && (
            <div className="card mb-6" style={{border:'2px solid var(--accent-primary)'}}>
              <h3 className="mb-4">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <div className="grid grid-cols-2" style={{gap:'1rem'}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="e.g. Rajesh Kumar" value={userForm.name} onChange={e => setUserForm({...userForm, name:e.target.value})} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Role *</label>
                  <select className="form-input" value={userForm.role} onChange={e => setUserForm({...userForm, role:e.target.value})}>
                    {Object.entries(ROLES).map(([k,r]) => <option key={k} value={k}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">4-Digit PIN *</label>
                  <input type="password" maxLength={4} className="form-input" placeholder="••••" value={userForm.pin} onChange={e => setUserForm({...userForm, pin:e.target.value.replace(/\D/,'').slice(0,4)})} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Avatar Color</label>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map(c => (
                      <div key={c} onClick={() => setUserForm({...userForm, avatar_color:c})}
                        style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:userForm.avatar_color===c ? '3px solid white' : '2px solid transparent',boxShadow:userForm.avatar_color===c ? '0 0 0 2px var(--accent-primary)' : 'none'}}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={saveUser}>{editUser ? 'Update User' : 'Add User'}</button>
                <button className="btn btn-secondary" onClick={() => { setShowUserForm(false); setEditUser(null); }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="card" style={{padding:0}}>
            <div className="table-container">
              <table>
                <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex align-center gap-3">
                          <div className="avatar" style={{background:u.avatar_color,fontSize:'0.8rem'}}>{initials(u.name)}</div>
                          <div>
                            <div style={{fontWeight:600}}>{u.name}</div>
                            <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>ID #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge" style={{background:`${ROLES[u.role]?.color}22`, color:ROLES[u.role]?.color, border:`1px solid ${ROLES[u.role]?.color}44`}}>{ROLES[u.role]?.label}</span></td>
                      <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-muted'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(u)}>✏ Edit</button>
                          {u.id !== 1 && <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>🗑</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
