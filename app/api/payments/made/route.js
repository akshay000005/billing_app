import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const payments = db.prepare(`
      SELECT pm.*, p.purchase_number, v.name as vendor_name
      FROM payments_made pm
      LEFT JOIN purchases p ON pm.purchase_id = p.id
      LEFT JOIN vendors v ON pm.vendor_id = v.id
      ORDER BY pm.date DESC
    `).all();
    return NextResponse.json(payments);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { date, purchase_id, vendor_id, amount, payment_mode, reference, notes } = await req.json();

    const result = db.prepare(
      'INSERT INTO payments_made (date, purchase_id, vendor_id, amount, payment_mode, reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(date, purchase_id || null, vendor_id || null, amount, payment_mode || 'cash', reference || '', notes || '');

    // Update purchase status if linked
    if (purchase_id) {
      const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(purchase_id);
      const totalPaid = db.prepare('SELECT SUM(amount) as paid FROM payments_made WHERE purchase_id = ?').get(purchase_id);
      if (totalPaid.paid >= purchase.total) {
        db.prepare("UPDATE purchases SET status = 'paid' WHERE id = ?").run(purchase_id);
      } else {
        db.prepare("UPDATE purchases SET status = 'partial' WHERE id = ?").run(purchase_id);
      }
    }

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
