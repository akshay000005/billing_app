import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '2000-01-01';
    const to = searchParams.get('to') || '2099-12-31';

    // Income: sum of bill totals (revenue)
    const salesRevenue = db.prepare(
      "SELECT COALESCE(SUM(subtotal), 0) as amount FROM bills WHERE date BETWEEN ? AND ?"
    ).get(from, to);

    // Other income via journal
    const otherIncome = db.prepare(`
      SELECT COALESCE(SUM(jl.credit - jl.debit), 0) as amount
      FROM journal_lines jl
      JOIN accounts a ON jl.account_id = a.id
      JOIN journal_entries je ON jl.entry_id = je.id
      WHERE a.type = 'Income' AND a.code != '4001'
      AND je.date BETWEEN ? AND ?
    `).get(from, to);

    // Expenses: sum of expense records
    const expensesByCategory = db.prepare(
      "SELECT category, SUM(amount) as amount FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category ORDER BY amount DESC"
    ).all(from, to);
    const totalExpenses = expensesByCategory.reduce((s, e) => s + e.amount, 0);

    // COGS from purchases
    const cogs = db.prepare(
      "SELECT COALESCE(SUM(subtotal), 0) as amount FROM purchases WHERE date BETWEEN ? AND ?"
    ).get(from, to);

    const totalIncome = (salesRevenue.amount || 0) + (otherIncome.amount || 0);
    const grossProfit = totalIncome - (cogs.amount || 0);
    const netProfit = grossProfit - totalExpenses;

    return NextResponse.json({
      period: { from, to },
      income: {
        salesRevenue: salesRevenue.amount || 0,
        otherIncome: otherIncome.amount || 0,
        total: totalIncome,
      },
      cogs: cogs.amount || 0,
      grossProfit,
      expenses: {
        breakdown: expensesByCategory,
        total: totalExpenses,
      },
      netProfit,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
