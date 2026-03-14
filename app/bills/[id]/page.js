"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvoiceView() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bills/${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.bill) setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{padding: '40px'}}>Loading invoice details...</div>;
  if (!data) return <div style={{padding: '40px'}}>Invoice not found.</div>;

  const { bill, items, settings } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="no-print flex justify-between align-center mb-8">
        <div>
          <button className="btn btn-secondary mb-4" onClick={() => router.push('/bills')}>← Back to Invoices</button>
          <h1 style={{margin: 0}}>Invoice #{bill.bill_number}</h1>
        </div>
        <button className="btn btn-primary" onClick={handlePrint} style={{fontSize: '1rem', padding: '12px 24px'}}>
          🖨️ Print / Download PDF
        </button>
      </div>

      <div className="invoice-paper" id="invoice-printable">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '30px', marginBottom: '40px'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
              <div style={{width: '40px', height: '40px', background: 'black', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{color: 'white', fontWeight: 700, fontSize: '1.2rem'}}>B</span>
              </div>
              <span style={{fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#111827'}}>{settings?.company_name || 'BillingPro'}</span>
            </div>
            <div style={{color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6'}}>
              {settings?.company_address ? (
                <div style={{whiteSpace: 'pre-wrap'}}>{settings.company_address}</div>
              ) : (
                <>
                  <strong>Your Company Name Ltd.</strong><br/>
                  123 Business Avenue, Tech Park<br/>
                  City, State 12345
                </>
              )}
              {settings?.gstin && <div>GSTIN: {settings.gstin}</div>}
              {settings?.phone && <div>Phone: {settings.phone}</div>}
              {settings?.email && <div>Email: {settings.email}</div>}
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '3rem', fontWeight: 800, color: '#111827', letterSpacing: '-1.5px', lineHeight: '1'}}>INVOICE</div>
            <div style={{fontSize: '1.1rem', color: '#6b7280', marginTop: '8px', fontWeight: 500}}>#{bill.bill_number}</div>
            <div style={{marginTop: '24px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
              <div style={{background: '#f3f4f6', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', color: '#4b5563', display: 'inline-block'}}>
                <strong>Issue Date:</strong> {bill.date}
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-details-grid">
          <div>
            <div className="invoice-section-title">Billed To</div>
            <div className="invoice-info-block">
              <strong>{bill.customer_name}</strong><br/>
              {bill.address && <>{bill.address}<br/></>}
              {bill.phone && <>Phone: {bill.phone}<br/></>}
              {bill.email && <>{bill.email}<br/></>}
              {bill.gst_in && <><strong>GSTIN:</strong> {bill.gst_in}</>}
            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{textAlign: 'right'}}>Rate</th>
              <th style={{textAlign: 'right'}}>Qty</th>
              <th style={{textAlign: 'right'}}>GST %</th>
              <th style={{textAlign: 'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{fontWeight: 600}}>{item.item_name}</div>
                  {item.item_desc && <div style={{fontSize: '0.85rem', color: '#666'}}>{item.item_desc}</div>}
                </td>
                <td style={{textAlign: 'right'}}>₹{item.rate.toFixed(2)}</td>
                <td style={{textAlign: 'right'}}>{item.quantity}</td>
                <td style={{textAlign: 'right'}}>{item.gst_rate}%</td>
                <td style={{textAlign: 'right', fontWeight: 500}}>₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>
          
          {bill.igst > 0 ? (
            <div className="invoice-total-row">
              <span>IGST</span>
              <span>₹{bill.igst.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="invoice-total-row">
                <span>CGST</span>
                <span>₹{bill.cgst.toFixed(2)}</span>
              </div>
              <div className="invoice-total-row">
                <span>SGST</span>
                <span>₹{bill.sgst.toFixed(2)}</span>
              </div>
            </>
          )}
          
          <div className="invoice-total-row grand-total">
            <span>Total Amount</span>
            <span>₹{bill.total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#666', fontSize: '0.85rem', textAlign: 'center'}}>
          Thank you for your business. For any queries regarding this invoice, please contact us.
        </div>
      </div>
    </div>
  );
}
