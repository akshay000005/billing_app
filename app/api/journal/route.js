import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const entries = db.prepare(`
      SELECT je.*, GROUP_CONCAT(jl.debit) as debits, GROUP_CONCAT(jl.credit) as credits
      FROM journal_entries je
      LEFT JOIN journal_lines jl ON je.id = jl.entry_id
      GROUP BY je.id
      ORDER BY je.date DESC, je.id DESC
    `).all();

    const result = entries.map(e => {
      const debits = (e.debits || '').split(',').map(Number);
      const totalDebit = debits.reduce((a, b) => a + b, 0);
      return { ...e, totalDebit };
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { date, reference, description, narration, lines, source, source_id } = await req.json();

    // Validate balanced entry
    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: 'Journal entry must be balanced (debits = credits)' }, { status: 400 });
    }

    const insertEntry = db.prepare(
      'INSERT INTO journal_entries (date, reference, description, narration, source, source_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertLine = db.prepare(
      'INSERT INTO journal_lines (entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, ?, ?)'
    );

    const runTransaction = db.transaction(() => {
      const entry = insertEntry.run(date, reference || '', description, narration || '', source || 'manual', source_id || null);
      for (const line of lines) {
        insertLine.run(entry.lastInsertRowid, line.account_id, Number(line.debit) || 0, Number(line.credit) || 0, line.description || '');
      }
      return entry.lastInsertRowid;
    });

    const id = runTransaction();
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
