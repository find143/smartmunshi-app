import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const labourId = searchParams.get('labourId');

    const where: any = {};
    if (labourId) where.labourId = labourId;

    const payouts = await prisma.wagePayout.findMany({
      where,
      include: {
        labour: true,
        site: true,
      },
      orderBy: { date: 'desc' },
    });

    const formatted = payouts.map((p) => ({
      id: p.id,
      labourId: p.labourId,
      labourName: p.labour.name,
      siteId: p.siteId,
      siteName: p.site?.name || 'Main Site',
      date: p.date,
      amountPaid: p.amountPaid,
      advancesDeducted: p.advancesDeducted,
      totalEarned: p.totalEarned,
      netPayable: p.netPayable,
      paymentMode: p.paymentMode,
      transactionRef: p.transactionRef || '',
      notes: p.notes || '',
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      labourId,
      siteId,
      amountPaid,
      advancesDeducted = 0,
      totalEarned,
      netPayable,
      paymentMode = 'UPI',
      transactionRef,
      notes,
    } = body;

    if (!labourId || !amountPaid) {
      return NextResponse.json(
        { error: 'Labour ID and Amount Paid are required.' },
        { status: 400 }
      );
    }

    const payout = await prisma.wagePayout.create({
      data: {
        labourId,
        siteId: siteId || null,
        date: new Date().toISOString().split('T')[0],
        amountPaid: parseFloat(amountPaid),
        advancesDeducted: parseFloat(advancesDeducted || 0),
        totalEarned: parseFloat(totalEarned || amountPaid),
        netPayable: parseFloat(netPayable || amountPaid),
        paymentMode,
        transactionRef: transactionRef || null,
        notes: notes || null,
      },
      include: { labour: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYOUT_SETTLED',
        entity: 'WagePayout',
        entityId: payout.id,
        details: `Settled wage payment of ₹${amountPaid} to ${payout.labour.name} via ${paymentMode}`,
        performedBy: 'Admin Munshi',
      },
    });

    return NextResponse.json(payout, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
