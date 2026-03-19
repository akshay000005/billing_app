"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Gstr1Export() {
  const router = useRouter();
  
  // Default to current month YYYY-MM
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!selectedMonth) return alert('Please select a month');
    setLoading(true);

    try {
      // Trigger native download by hitting the API endpoint
      const response = await fetch(`/api/reports/gstr1?month=${selectedMonth}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download report');
      }

      // Convert response to blob
      const blob = await response.blob();
      
      // Create object URL and trigger click to download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GSTR1_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between align-center mb-8">
        <h1>GSTR-1 Data Export</h1>
      </div>

      <div className="card glass">
        <p className="mb-6 text-gray-600">
          Generate a monthly CSV report of all invoices, formatted in accordance with Indian GST rules for GSTR-1 filing (Outward Supplies). This export includes details like GSTIN, Invoice Numbers, Taxable Values, and separated IGST/CGST/SGST amounts.
        </p>
        
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="form-group">
            <label className="form-label">Return Period (Month & Year)</label>
            <input 
              type="month" 
              className="form-input" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)} 
              max={currentMonthStr}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleDownload}
          disabled={loading || !selectedMonth}
          style={{padding: '12px 24px', fontSize: '1rem'}}
        >
          {loading ? 'Generating Export...' : '📥 Download GSTR-1 CSV'}
        </button>
      </div>

      <div className="mt-8">
         <h2>Helpful Information</h2>
         <div className="card glass" style={{background: '#f8fafc'}}>
            <ul style={{lineHeight: '1.8', paddingLeft: '20px', color: '#4b5563'}}>
               <li><strong>B2B Invoices:</strong> Will be aggregated if the customer's GSTIN is provided in the customer master data.</li>
               <li><strong>B2C Invoices:</strong> Will appear without a GSTIN as generic consumer invoices.</li>
               <li><strong>Note:</strong> Ensure all customer GSTIN formats are valid before final GST portal upload. This tool provides a base data export that can be imported into offline tools.</li>
            </ul>
         </div>
      </div>
    </div>
  );
}
