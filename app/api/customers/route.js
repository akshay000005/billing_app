import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Auto-generate custom_id e.g., C0001
    const lastCustomer = db.prepare('SELECT custom_id FROM customers ORDER BY id DESC LIMIT 1').get();
    let nextId = 'C0001';
    if (lastCustomer && lastCustomer.custom_id) {
       const num = parseInt(lastCustomer.custom_id.substring(1)) + 1;
       nextId = 'C' + num.toString().padStart(4, '0');
    }

    const stmt = db.prepare(`
      INSERT INTO customers (custom_id, name, email, phone, gst_in, address)
      VALUES (@custom_id, @name, @email, @phone, @gst_in, @address)
    `);
    
    const info = stmt.run({
       custom_id: nextId,
       name: body.name,
       email: body.email || null,
       phone: body.phone || null,
       gst_in: body.gst_in || null,
       address: body.address || null
    });

    return NextResponse.json({ id: info.lastInsertRowid, custom_id: nextId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
