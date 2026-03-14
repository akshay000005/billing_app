import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bills = db.prepare(`
      SELECT b.*, c.name as customer_name, c.custom_id as customer_custom_id 
      FROM bills b 
      JOIN customers c ON b.customer_id = c.id 
      ORDER BY b.id DESC
    `).all();
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Start transaction
    const insertBill = db.transaction((billData, itemsData) => {
      // Auto-generate bill_number e.g., INV-0001
      const lastBill = db.prepare('SELECT bill_number FROM bills ORDER BY id DESC LIMIT 1').get();
      let nextBillNum = 'INV-0001';
      if (lastBill && lastBill.bill_number) {
         const parts = lastBill.bill_number.split('-');
         if(parts.length === 2 && !isNaN(parts[1])) {
            const num = parseInt(parts[1]) + 1;
            nextBillNum = 'INV-' + num.toString().padStart(4, '0');
         } else {
            nextBillNum = 'INV-' + Date.now().toString().substring(7);
         }
      }

      const stmtBill = db.prepare(`
        INSERT INTO bills (bill_number, customer_id, date, subtotal, cgst, sgst, igst, total, template)
        VALUES (@bill_number, @customer_id, @date, @subtotal, @cgst, @sgst, @igst, @total, @template)
      `);
      
      const info = stmtBill.run({
         bill_number: nextBillNum,
         customer_id: billData.customer_id,
         date: billData.date || new Date().toISOString().split('T')[0],
         subtotal: billData.subtotal,
         cgst: billData.cgst,
         sgst: billData.sgst,
         igst: billData.igst,
         total: billData.total,
         template: billData.template || 'default'
      });

      const billId = info.lastInsertRowid;
      
      const stmtItem = db.prepare(`
        INSERT INTO bill_items (bill_id, item_id, quantity, rate, amount)
        VALUES (@bill_id, @item_id, @quantity, @rate, @amount)
      `);

      for (const item of itemsData) {
        stmtItem.run({
           bill_id: billId,
           item_id: item.item_id,
           quantity: item.quantity,
           rate: item.rate,
           amount: item.amount
        });
      }

      return { billId, bill_number: nextBillNum };
    });

    const result = insertBill(body.bill, body.items);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
