import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY name ASC').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const stmt = db.prepare(`
      INSERT INTO items (name, description, rate, gst_rate)
      VALUES (@name, @description, @rate, @gst_rate)
    `);
    
    const info = stmt.run({
       name: body.name,
       description: body.description || null,
       rate: parseFloat(body.rate),
       gst_rate: parseFloat(body.gst_rate)
    });

    return NextResponse.json({ id: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
