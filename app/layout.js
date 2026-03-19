import './globals.css';
import ClientLayout from './components/ClientLayout';

export const metadata = {
  title: 'AccounPro — Complete Accounting Software',
  description: 'GST-compliant Accounting & Billing Software for India',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
