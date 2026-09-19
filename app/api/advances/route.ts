import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const labourId = searchParams.get('labourId');
    const siteId = searchParams.get('siteId');

    const where: any = {};
    if (labourId) where.labourId = labourId;
    if (siteId && siteId !== 'ALL') where.siteId = siteId;

    const advances = await prisma.advance.findMany({
      where,
      include: {
        labour: true,
        site: true,
      },
      orderBy: { date: 'desc' },
    });

    const formatted = advances.map((ad) => ({
      id: ad.id,
      labourId: ad.labourId,
      labourName: ad.labour.name,
      siteId: ad.siteId,
      siteName: ad.site?.name || 'Main Site',
      date: ad.date,
      amount: ad.amount,
      paymentMode: ad.paymentMode,
      reason: ad.reason,
      status: ad.status,
      approvedBy: ad.approvedBy,
      createdAt: ad.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { labourId, siteId, amount, date, paymentMode, reason, approvedBy } = body;

    if (!labourId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Labour, Amount, and Mandatory Reason are required.' },
        { status: 400 }
      );
    }

    const newAdvance = await prisma.advance.create({
      data: {
        labourId,
        siteId: siteId || null,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        paymentMode: paymentMode || 'CASH',
        reason,
        approvedBy: approvedBy || 'Admin Munshi',
        status: 'PAID',
      },
      include: { labour: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'ADVANCE_GIVEN',
        entity: 'Advance',
        entityId: newAdvance.id,
        details: `Disbursed advance of ₹${amount} to ${newAdvance.labour.name} via ${paymentMode}. Reason: ${reason}`,
        performedBy: approvedBy || 'Admin Munshi',
      },
    });

    return NextResponse.json(newAdvance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
