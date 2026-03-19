import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') || '6');

    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
      const lastDay = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
      const to   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${lastDay}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      const inflow  = db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM payments_received WHERE date BETWEEN ? AND ?`).get(from, to)?.total || 0;
      const outflow = (db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM payments_made WHERE date BETWEEN ? AND ?`).get(from, to)?.total || 0)
                    + (db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date BETWEEN ? AND ?`).get(from, to)?.total || 0);

      result.push({ month: label, from, to, inflow, outflow, net: inflow - outflow });
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
