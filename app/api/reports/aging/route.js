import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bills = db.prepare(`
      SELECT b.*, c.name as customer_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.status != 'paid'
      ORDER BY b.date ASC
    `).all();

    const today = new Date();
    const buckets = { current: [], days30: [], days60: [], days90plus: [] };

    bills.forEach(bill => {
      const billDate = new Date(bill.date);
      const daysOverdue = Math.floor((today - billDate) / (1000 * 60 * 60 * 24));
      const paid = db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM payments_received WHERE bill_id = ?').get(bill.id)?.total || 0;
      const outstanding = bill.total - paid;
      if (outstanding <= 0) return;

      const entry = { ...bill, outstanding, daysOverdue, paid };
      if (daysOverdue <= 0)  buckets.current.push(entry);
      else if (daysOverdue <= 30) buckets.days30.push(entry);
      else if (daysOverdue <= 60) buckets.days60.push(entry);
      else buckets.days90plus.push(entry);
    });

    const sum = arr => arr.reduce((s, b) => s + b.outstanding, 0);
    return NextResponse.json({
      buckets,
      summary: {
        current:  { count: buckets.current.length,   total: sum(buckets.current) },
        days30:   { count: buckets.days30.length,    total: sum(buckets.days30) },
        days60:   { count: buckets.days60.length,    total: sum(buckets.days60) },
        days90plus:{ count: buckets.days90plus.length, total: sum(buckets.days90plus) },
        totalAR:  sum([...buckets.current, ...buckets.days30, ...buckets.days60, ...buckets.days90plus])
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
