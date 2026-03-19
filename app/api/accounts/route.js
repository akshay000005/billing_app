import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY code').all();
    return NextResponse.json(accounts);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { code, name, type, description } = await req.json();
    const result = db.prepare(
      'INSERT INTO accounts (code, name, type, description) VALUES (?, ?, ?, ?)'
    ).run(code, name, type, description || '');
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
