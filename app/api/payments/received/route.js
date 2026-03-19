import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const payments = db.prepare(`
      SELECT pr.*, b.bill_number, c.name as customer_name
      FROM payments_received pr
      JOIN bills b ON pr.bill_id = b.id
      JOIN customers c ON pr.customer_id = c.id
      ORDER BY pr.date DESC
    `).all();
    return NextResponse.json(payments);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { date, bill_id, customer_id, amount, payment_mode, reference, notes } = await req.json();

    const result = db.prepare(
      'INSERT INTO payments_received (date, bill_id, customer_id, amount, payment_mode, reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(date, bill_id, customer_id, amount, payment_mode || 'cash', reference || '', notes || '');

    // Update bill status
    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(bill_id);
    const totalPaid = db.prepare('SELECT SUM(amount) as paid FROM payments_received WHERE bill_id = ?').get(bill_id);
    if (totalPaid.paid >= bill.total) {
      db.prepare("UPDATE bills SET status = 'paid' WHERE id = ?").run(bill_id);
    } else {
      db.prepare("UPDATE bills SET status = 'partial' WHERE id = ?").run(bill_id);
    }

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
