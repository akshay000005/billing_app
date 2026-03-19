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


  const template = settings?.invoice_template || 'professional';
  const themeColor = settings?.theme_color || '#2563eb';

  const renderProfessional = () => (
    <div className="invoice-paper" id="invoice-printable">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '30px', margin: '0 0 40px'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
            <div style={{width: '40px', height: '40px', background: themeColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: 'white', fontWeight: 700, fontSize: '1.2rem'}}>B</span>
            </div>
            <span style={{fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#111827'}}>{settings?.company_name || 'BillingPro'}</span>
          </div>
          <div style={{color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6'}}>
            {settings?.company_address ? (
              <div style={{whiteSpace: 'pre-wrap'}}>{settings.company_address}</div>
            ) : (
              <><strong>Your Company Name Ltd.</strong><br/>123 Business Avenue, Tech Park<br/>City, State 12345</>
            )}
            {settings?.gstin && <div>GSTIN: {settings.gstin}</div>}
            {settings?.phone && <div>Phone: {settings.phone}</div>}
            {settings?.email && <div>Email: {settings.email}</div>}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '3rem', fontWeight: 800, color: themeColor, letterSpacing: '-1.5px', lineHeight: '1'}}>INVOICE</div>
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
          <div className="invoice-section-title" style={{color: themeColor}}>Billed To</div>
          <div className="invoice-info-block">
            <strong>{bill.customer_name}</strong><br/>
            {bill.address && <>{bill.address}<br/></>}
            {bill.phone && <>Phone: {bill.phone}<br/></>}
            {bill.email && <>{bill.email}<br/></>}
            {bill.gst_in && <><strong>GSTIN:</strong> {bill.gst_in}</>}
          </div>
        </div>
      </div>
      {renderTable(true)}
      <div style={{marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#666', fontSize: '0.85rem', textAlign: 'center'}}>
        Thank you for your business. For any queries regarding this invoice, please contact us.
      </div>
    </div>
  );

  const renderModernColor = () => (
    <div className="invoice-paper" id="invoice-printable" style={{padding: 0, overflow: 'hidden'}}>
      <div style={{backgroundColor: themeColor, color: 'white', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div style={{fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px'}}>{settings?.company_name || 'BillingPro'}</div>
          {settings?.gstin && <div style={{opacity: 0.8, fontSize: '0.9rem'}}>GSTIN: {settings.gstin}</div>}
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '3rem', fontWeight: 800, opacity: 0.9, letterSpacing: '-1px'}}>INVOICE</div>
          <div style={{fontSize: '1.2rem', fontWeight: 500, opacity: 0.9}}>#{bill.bill_number}</div>
        </div>
      </div>
      
      <div style={{padding: '40px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '40px'}}>
          <div style={{flex: 1}}>
            <div style={{textTransform: 'uppercase', color: themeColor, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px'}}>Invoice To</div>
            <div style={{fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '4px'}}>{bill.customer_name}</div>
            <div style={{color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5'}}>
              {bill.address && <div>{bill.address}</div>}
              {bill.phone && <div>{bill.phone}</div>}
              {bill.email && <div>{bill.email}</div>}
            </div>
          </div>
          
          <div style={{flex: 1, textAlign: 'right'}}>
            <div style={{textTransform: 'uppercase', color: themeColor, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px'}}>From</div>
            <div style={{color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5'}}>
              {settings?.company_address ? (
                <div style={{whiteSpace: 'pre-wrap'}}>{settings.company_address}</div>
              ) : (
                <>123 Business Avenue<br/>City, State 12345</>
              )}
              {settings?.phone && <div>{settings.phone}</div>}
              {settings?.email && <div>{settings.email}</div>}
            </div>
          </div>
        </div>

        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '40px'}}>
          <div><span style={{color: '#64748b', fontSize: '0.85rem', display: 'block'}}>Date Issued</span><strong style={{color: '#0f172a'}}>{bill.date}</strong></div>
          <div style={{textAlign: 'right'}}><span style={{color: '#64748b', fontSize: '0.85rem', display: 'block'}}>Amount Due</span><strong style={{color: themeColor, fontSize: '1.2rem'}}>₹{bill.total.toFixed(2)}</strong></div>
        </div>

        {renderTable(false)}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="invoice-paper" id="invoice-printable" style={{boxShadow: 'none', border: '1px solid #e2e8f0'}}>
       <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '60px'}}>
          <div>
            <div style={{fontSize: '1.25rem', fontWeight: 600, color: '#000'}}>{settings?.company_name || 'BillingPro'}</div>
            {settings?.gstin && <div style={{color: '#666', fontSize: '0.85rem'}}>GSTIN: {settings.gstin}</div>}
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '1.25rem', fontWeight: 400, color: '#000'}}>Invoice {bill.bill_number}</div>
            <div style={{color: '#666', fontSize: '0.85rem'}}>{bill.date}</div>
          </div>
       </div>

       <div style={{marginBottom: '60px'}}>
         <div style={{fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Bill To</div>
         <div style={{fontSize: '1rem', color: '#000'}}>{bill.customer_name}</div>
         <div style={{fontSize: '0.85rem', color: '#666', marginTop: '4px'}}>
            {bill.address && <div>{bill.address}</div>}
            {bill.gst_in && <div>GSTIN: {bill.gst_in}</div>}
         </div>
       </div>

       {renderTable(false, true)}
    </div>
  );

  const renderTable = (useDefaultStyles = true, minimal = false) => (
    <>
      <table className="invoice-table" style={minimal ? { borderBottom: '1px solid #000' } : {}}>
        <thead>
          <tr>
            <th style={minimal ? {background: 'transparent', borderBottom: '1px solid #000', padding: '8px 0'} : {background: useDefaultStyles ? '#f9f9f9' : themeColor + '15'}}>Description</th>
            <th style={{textAlign: 'right', ...(minimal ? {background: 'transparent', borderBottom: '1px solid #000', padding: '8px 0'} : {background: useDefaultStyles ? '#f9f9f9' : themeColor + '15'})}}>Rate</th>
            <th style={{textAlign: 'right', ...(minimal ? {background: 'transparent', borderBottom: '1px solid #000', padding: '8px 0'} : {background: useDefaultStyles ? '#f9f9f9' : themeColor + '15'})}}>Qty</th>
            <th style={{textAlign: 'right', ...(minimal ? {background: 'transparent', borderBottom: '1px solid #000', padding: '8px 0'} : {background: useDefaultStyles ? '#f9f9f9' : themeColor + '15'})}}>GST %</th>
            <th style={{textAlign: 'right', ...(minimal ? {background: 'transparent', borderBottom: '1px solid #000', padding: '8px 0'} : {background: useDefaultStyles ? '#f9f9f9' : themeColor + '15'})}}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td style={minimal ? {padding: '12px 0'} : {}}>
                <div style={{fontWeight: minimal ? 400 : 600, color: minimal ? '#000' : 'inherit'}}>{item.item_name}</div>
                {item.item_desc && <div style={{fontSize: '0.85rem', color: '#666'}}>{item.item_desc}</div>}
              </td>
              <td style={{textAlign: 'right', ...(minimal ? {padding: '12px 0'} : {})}}>₹{item.rate.toFixed(2)}</td>
              <td style={{textAlign: 'right', ...(minimal ? {padding: '12px 0'} : {})}}>{item.quantity}</td>
              <td style={{textAlign: 'right', ...(minimal ? {padding: '12px 0'} : {})}}>{item.gst_rate}%</td>
              <td style={{textAlign: 'right', fontWeight: minimal ? 400 : 500, ...(minimal ? {padding: '12px 0'} : {})}}>₹{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals" style={minimal ? { borderTop: 'none', paddingTop: 0 } : {}}>
        <div className="invoice-total-row" style={minimal ? {color: '#000'} : {}}>
          <span>Subtotal</span>
          <span>₹{bill.subtotal.toFixed(2)}</span>
        </div>
        
        {bill.igst > 0 ? (
          <div className="invoice-total-row" style={minimal ? {color: '#000'} : {}}>
            <span>IGST</span>
            <span>₹{bill.igst.toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div className="invoice-total-row" style={minimal ? {color: '#000'} : {}}>
              <span>CGST</span>
              <span>₹{bill.cgst.toFixed(2)}</span>
            </div>
            <div className="invoice-total-row" style={minimal ? {color: '#000'} : {}}>
              <span>SGST</span>
              <span>₹{bill.sgst.toFixed(2)}</span>
            </div>
          </>
        )}
        
        <div className="invoice-total-row grand-total" style={minimal ? {borderTop: '1px solid #000'} : {color: themeColor}}>
          <span>Total Amount</span>
          <span>₹{bill.total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="animate-fade-in">
      <div className="no-print flex justify-between align-center mb-8">
        <div>
          <button className="btn btn-secondary mb-4" onClick={() => router.push('/bills')}>← Back to Invoices</button>
          <h1 style={{margin: 0}}>Invoice #{bill.bill_number}</h1>
        </div>
        <button className="btn btn-primary" onClick={handlePrint} style={{fontSize: '1rem', padding: '12px 24px', backgroundColor: themeColor}}>
          🖨️ Print / Download PDF
        </button>
      </div>

      {template === 'professional' && renderProfessional()}
      {template === 'modern_color' && renderModernColor()}
      {template === 'minimal' && renderMinimal()}
    </div>
  );
}
