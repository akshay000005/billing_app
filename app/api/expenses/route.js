import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const expenses = db.prepare(`
      SELECT e.*, v.name as vendor_name
      FROM expenses e
      LEFT JOIN vendors v ON e.vendor_id = v.id
      ORDER BY e.date DESC
    `).all();
    return NextResponse.json(expenses);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { date, category, description, amount, vendor_id, payment_mode, reference } = await req.json();
    const result = db.prepare(
      'INSERT INTO expenses (date, category, description, amount, vendor_id, payment_mode, reference) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(date, category, description || '', amount, vendor_id || null, payment_mode || 'cash', reference || '');
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
