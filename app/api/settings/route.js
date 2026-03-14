import db from '../../../database/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const stmt = db.prepare(`
      UPDATE settings 
      SET company_name = @company_name, 
          company_address = @company_address, 
          gstin = @gstin, 
          phone = @phone, 
          email = @email 
      WHERE id = 1
    `);
    
    stmt.run({
       company_name: body.company_name,
       company_address: body.company_address || null,
       gstin: body.gstin || null,
       phone: body.phone || null,
       email: body.email || null
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
