import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAmount, validateText } from '@/lib/validation';

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

    if (!labourId) {
      return NextResponse.json({ error: 'Worker selection is required.' }, { status: 400 });
    }

    const amountCheck = validateAmount(amount, 1, 500000, 'Advance Amount');
    if (!amountCheck.isValid) {
      return NextResponse.json({ error: amountCheck.error }, { status: 400 });
    }

    const reasonCheck = validateText(reason, 'Mandatory Reason', 3, 200);
    if (!reasonCheck.isValid) {
      return NextResponse.json({ error: reasonCheck.error }, { status: 400 });
    }

    const newAdvance = await prisma.advance.create({
      data: {
        labourId,
        siteId: siteId || null,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        paymentMode: paymentMode || 'CASH',
        reason: reason.trim(),
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
        details: `Disbursed advance of ₹${amount} to ${newAdvance.labour.name} via ${paymentMode}. Reason: ${reason.trim()}`,
        performedBy: approvedBy || 'Admin Munshi',
      },
    });

    return NextResponse.json(newAdvance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
