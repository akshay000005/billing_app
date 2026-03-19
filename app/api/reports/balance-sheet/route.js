import db from '../../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Assets
    const cashBalance = db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments_received").get().v
      - db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments_made").get().v
      - db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM expenses").get().v;

    const accountsReceivable = db.prepare(
      "SELECT COALESCE(SUM(total),0) - (SELECT COALESCE(SUM(amount),0) FROM payments_received) as v FROM bills"
    ).get().v;

    const inventory = db.prepare("SELECT COALESCE(SUM(subtotal),0) as v FROM purchases").get().v;

    // Liabilities
    const accountsPayable = db.prepare(
      "SELECT COALESCE(SUM(total),0) - (SELECT COALESCE(SUM(amount),0) FROM payments_made) as v FROM purchases"
    ).get().v;

    // Equity = Assets - Liabilities
    const totalAssets = Math.max(0, cashBalance) + Math.max(0, accountsReceivable) + inventory;
    const totalLiabilities = Math.max(0, accountsPayable);
    const equity = totalAssets - totalLiabilities;

    return NextResponse.json({
      assets: {
        cash: Math.max(0, cashBalance),
        accountsReceivable: Math.max(0, accountsReceivable),
        inventory,
        total: totalAssets,
      },
      liabilities: {
        accountsPayable: Math.max(0, accountsPayable),
        total: totalLiabilities,
      },
      equity: {
        retainedEarnings: equity,
        total: equity,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
