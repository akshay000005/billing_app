import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const purchases = db.prepare(`
      SELECT p.*, v.name as vendor_name, v.custom_id as vendor_custom_id
      FROM purchases p
      JOIN vendors v ON p.vendor_id = v.id
      ORDER BY p.date DESC
    `).all();
    return NextResponse.json(purchases);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { vendor_id, date, due_date, items, notes } = await req.json();

    // Generate purchase number (PO-0001, PO-0002, ...)
    const last = db.prepare("SELECT purchase_number FROM purchases ORDER BY id DESC LIMIT 1").get();
    let nextNum = 1;
    if (last) {
      const num = parseInt(last.purchase_number.replace('PO-', ''), 10);
      nextNum = num + 1;
    }
    const purchase_number = 'PO-' + String(nextNum).padStart(4, '0');

    let subtotal = 0, cgst = 0, sgst = 0, igst = 0;
    items.forEach(i => {
      subtotal += i.amount;
      cgst += i.cgst || 0;
      sgst += i.sgst || 0;
      igst += i.igst || 0;
    });
    const total = subtotal + cgst + sgst + igst;

    const insertPurchase = db.prepare(
      'INSERT INTO purchases (purchase_number, vendor_id, date, due_date, subtotal, cgst, sgst, igst, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const insertItem = db.prepare(
      'INSERT INTO purchase_items (purchase_id, item_name, quantity, rate, gst_rate, amount) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const run = db.transaction(() => {
      const p = insertPurchase.run(purchase_number, vendor_id, date, due_date || '', subtotal, cgst, sgst, igst, total, notes || '');
      for (const item of items) {
        insertItem.run(p.lastInsertRowid, item.item_name, item.quantity, item.rate, item.gst_rate || 0, item.amount);
      }
      return p.lastInsertRowid;
    });

    const id = run();
    return NextResponse.json({ id, purchase_number });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
