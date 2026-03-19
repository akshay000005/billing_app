import db from '../../../database/db.js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Run users migration on first call
const usersMigration = path.resolve(process.cwd(), 'database/schema_users.sql');
try {
  const sql = fs.readFileSync(usersMigration, 'utf8');
  db.exec(sql);
} catch (e) { /* already migrated */ }

export async function GET() {
  try {
    const users = db.prepare('SELECT id, name, role, avatar_color, is_active, created_at FROM users').all();
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, role, pin, avatar_color } = await req.json();
    const result = db.prepare(
      'INSERT INTO users (name, role, pin, avatar_color) VALUES (?, ?, ?, ?)'
    ).run(name, role || 'employee', pin || '0000', avatar_color || '#00f5ff');
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name, role, pin, avatar_color, is_active } = await req.json();
    db.prepare(
      'UPDATE users SET name=?, role=?, pin=?, avatar_color=?, is_active=? WHERE id=?'
    ).run(name, role, pin, avatar_color, is_active ? 1 : 0, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id === '1') return NextResponse.json({ error: 'Cannot delete default admin' }, { status: 400 });
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
