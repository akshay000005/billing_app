import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { id, pin } = await req.json();
    const user = db.prepare('SELECT pin FROM users WHERE id = ? AND is_active = 1').get(id);
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' });
    if (user.pin === pin) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: 'Wrong PIN' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
