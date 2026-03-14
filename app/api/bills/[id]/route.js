import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const bill = db.prepare(`
      SELECT b.*, c.name as customer_name, c.custom_id, c.email, c.phone, c.gst_in, c.address 
      FROM bills b 
      JOIN customers c ON b.customer_id = c.id 
      WHERE b.id = ?
    `).get(id);

    if (!bill) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT bi.*, i.name as item_name, i.description as item_desc, i.gst_rate 
      FROM bill_items bi 
      JOIN items i ON bi.item_id = i.id 
      WHERE bi.bill_id = ?
    `).all(id);

    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();

    return NextResponse.json({ bill, items, settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
