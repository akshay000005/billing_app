import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY code').all();

    const trialBalance = accounts.map(account => {
      const lines = db.prepare(
        'SELECT COALESCE(SUM(debit),0) as totalDebit, COALESCE(SUM(credit),0) as totalCredit FROM journal_lines WHERE account_id = ?'
      ).get(account.id);

      const debit = lines.totalDebit;
      const credit = lines.totalCredit;
      const balance = debit - credit;

      return {
        ...account,
        debit,
        credit,
        balance,
        // Debit normal accounts: Asset, Expense; Credit normal: Liability, Equity, Income
        normalBalance: ['Asset', 'Expense'].includes(account.type) ? 'Debit' : 'Credit',
      };
    });

    const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0);
    const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0);

    return NextResponse.json({ accounts: trialBalance, totalDebit, totalCredit });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
