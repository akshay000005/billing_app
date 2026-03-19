import db from '../../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '2000-01-01';
    const to   = searchParams.get('to')   || '2099-12-31';
    const accountId = parseInt(params.id);

    // Get journal lines for this account in date range
    const lines = db.prepare(`
      SELECT jl.debit, jl.credit, jl.description,
             je.date, je.reference, je.description as narration
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      WHERE jl.account_id = ? AND je.date BETWEEN ? AND ?
      ORDER BY je.date ASC, je.id ASC
    `).all(accountId, from, to);

    return NextResponse.json(lines);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
