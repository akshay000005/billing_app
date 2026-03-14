import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Billing Software Pro',
  description: 'Premium GST Billing Software',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <aside className="sidebar glass">
            <div className="sidebar-logo">
              <span>BillingPro</span>
            </div>
            <nav className="flex" style={{flexDirection: 'column', gap: '8px'}}>
              <Link href="/" className="nav-link">Dashboard</Link>
              <Link href="/bills" className="nav-link">Invoices</Link>
              <Link href="/customers" className="nav-link">Customers</Link>
              <Link href="/items" className="nav-link">Master Items</Link>
              <Link href="/settings" className="nav-link" style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)'}}>Settings</Link>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
