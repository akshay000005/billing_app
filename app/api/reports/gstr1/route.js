import { NextResponse } from 'next/server';
import path from 'path';
import db from '../../../../database/db'; // Ensure depth is 4: route.js -> gstr1 -> reports -> api -> app -> root

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // e.g. "2023-10"

  if (!month) {
    return NextResponse.json({ error: 'Month parameter is required (YYYY-MM)' }, { status: 400 });
  }

  try {
    // We need to fetch all bills for this month and join with customer data
    const query = `
      SELECT 
        b.bill_number, 
        b.date, 
        c.name as customer_name,
        c.gst_in as gstin,
        b.subtotal as taxable_value,
        b.igst,
        b.cgst,
        b.sgst,
        b.total as invoice_value
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.date LIKE ?
      ORDER BY b.date ASC, b.id ASC
    `;
    
    // SQLite LIKE operator with standard date format YYYY-MM-%
    const bills = db.prepare(query).all(`${month}-%`);

    // In India GSTR-1, typical columns for B2B/B2C are:
    // GSTIN/UIN of Recipient, Receiver Name, Invoice Number, Invoice date, Invoice Value, Place Of Supply, Reverse Charge, Applicable % of Tax Rate, Invoice Type, E-Commerce GSTIN, Rate, Taxable Value, Cess Amount
    
    // For simplicity, we'll map a basic B2B/B2C generic format
    const csvHeader = [
      "GSTIN/UIN of Recipient",
      "Receiver Name",
      "Invoice Number",
      "Invoice Date",
      "Invoice Value",
      "Taxable Value",
      "Integrated Tax Amount",
      "Central Tax Amount",
      "State/UT Tax Amount"
    ].join(',');

    const csvRows = bills.map(b => {
      // Escape commas in strings
      const safeName = `"${(b.customer_name || '').replace(/"/g, '""')}"`;
      return [
        b.gstin || '',
        safeName,
        b.bill_number,
        b.date,
        b.invoice_value.toFixed(2),
        b.taxable_value.toFixed(2),
        b.igst.toFixed(2),
        b.cgst.toFixed(2),
        b.sgst.toFixed(2)
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Return as a downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="GSTR1_${month}.csv"`
      }
    });

  } catch (error) {
    console.error("GSTR-1 Error:", error);
    return NextResponse.json({ error: 'Failed to generate GSTR-1 export' }, { status: 500 });
  }
}
