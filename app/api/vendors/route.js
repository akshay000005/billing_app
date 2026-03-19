import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY name').all();
    return NextResponse.json(vendors);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, phone, gstin, address, opening_balance } = await req.json();

    // Generate vendor ID (V0001, V0002, ...)
    const last = db.prepare("SELECT custom_id FROM vendors ORDER BY id DESC LIMIT 1").get();
    let nextNum = 1;
    if (last) {
      const num = parseInt(last.custom_id.replace('V', ''), 10);
      nextNum = num + 1;
    }
    const custom_id = 'V' + String(nextNum).padStart(4, '0');

    const result = db.prepare(
      'INSERT INTO vendors (custom_id, name, email, phone, gstin, address, opening_balance) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(custom_id, name, email || '', phone || '', gstin || '', address || '', opening_balance || 0);

    return NextResponse.json({ id: result.lastInsertRowid, custom_id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
