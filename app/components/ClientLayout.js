'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from './ThemeProvider';
import { UserProvider, useUser, ROLES } from './UserContext';
import QuickCreate from './QuickCreate';
import { useEffect } from 'react';

function NavLink({ href, icon, label, badge, shortcut, voucher }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link href={href} className={`nav-link${active ? ' active' : ''}${voucher ? ' nav-link-voucher' : ''}`}>
      <span className="nav-link-icon">{icon}</span>
      <span className="nav-link-label">{label}</span>
      {shortcut && <span className="nav-link-shortcut">{shortcut}</span>}
      {badge && <span className="nav-link-badge">{badge}</span>}
    </Link>
  );
}

function Sidebar() {
  const { user, setUser, can } = useUser();
  const router = useRouter();

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';
  const isEmployee = user?.role === 'employee';
  const isAuditor = user?.role === 'auditor';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">A</div>
        <span className="sidebar-logo-text">AccounPro</span>
      </div>

      {/* Navigation */}
      <nav style={{display:'flex', flexDirection:'column', gap:'1px', flex:1, overflowY:'auto', overflowX:'hidden'}}>
        <NavLink href="/" icon="📊" label="Dashboard" />

        {/* VOUCHERS — Tally-style quick entry */}
        <div className="nav-section-label">VOUCHERS</div>
        <NavLink href="/vouchers/receipt" icon="📥" label="Receipt" shortcut="F6" voucher />
        <NavLink href="/vouchers/payment" icon="📤" label="Payment" shortcut="F5" voucher />
        <NavLink href="/vouchers/contra"  icon="🔄" label="Contra"  shortcut="F4" voucher />

        {/* SALES */}
        <div className="nav-section-label">SALES</div>
        <NavLink href="/bills"              icon="📄" label="Invoices" />
        <NavLink href="/customers"          icon="👥" label="Customers" />
        <NavLink href="/payments/received"  icon="💰" label="Payments In" />

        {/* PURCHASES */}
        <div className="nav-section-label">PURCHASES</div>
        <NavLink href="/vendors"            icon="🏭" label="Vendors" />
        <NavLink href="/purchases"          icon="🛒" label="Purchases" />
        <NavLink href="/payments/made"      icon="💸" label="Payments Out" />
        <NavLink href="/expenses"           icon="🧾" label="Expenses" />

        {/* ACCOUNTING */}
        <div className="nav-section-label">ACCOUNTING</div>
        <NavLink href="/accounts"           icon="📒" label="Chart of Accounts" />
        {!isEmployee && <NavLink href="/journal" icon="📝" label="Journal Entries" />}
        <NavLink href="/daybook"            icon="📅" label="Day Book" />
        <NavLink href="/ledger"             icon="📖" label="Ledger" />
        <NavLink href="/cashbook"           icon="🏦" label="Cash Book" />
        <NavLink href="/items"              icon="📦" label="Products & Services" />

        {/* REPORTS */}
        {!isEmployee && <>
          <div className="nav-section-label">REPORTS</div>
          <NavLink href="/reports/pl"            icon="📈" label="P&L Statement" />
          <NavLink href="/reports/balance-sheet" icon="⚖️" label="Balance Sheet" />
          <NavLink href="/reports/trial-balance" icon="📋" label="Trial Balance" />
          <NavLink href="/reports/aging"         icon="⏱"  label="A/R Aging" />
          <NavLink href="/reports/cashflow"      icon="💹" label="Cash Flow" />
          <NavLink href="/reports/gstr1"         icon="📑" label="GSTR-1 Export" />
        </>}

        {/* Spacer */}
        <div style={{flex:1, minHeight:'16px'}}></div>

        {/* Settings — admin only */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <NavLink href="/settings" icon="⚙️" label="Settings" />
        )}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="sidebar-user" onClick={logout} title="Click to logout">
          <div className="avatar" style={{background: user.avatar_color || '#00f5ff', fontSize:'0.85rem'}}>
            {initials(user.name)}
          </div>
          <div style={{overflow:'hidden'}}>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role" style={{color: ROLES[user.role]?.color}}>{ROLES[user.role]?.label}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

function AppShell({ children }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, pathname]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content animate-fade-in">
        {children}
      </main>
      <QuickCreate />
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppShell>{children}</AppShell>
      </UserProvider>
    </ThemeProvider>
  );
}
