import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const labour = await prisma.labour.findUnique({
      where: { id: params.id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          include: { site: true },
        },
        advances: {
          orderBy: { date: 'desc' },
          include: { site: true },
        },
        wagePayouts: {
          orderBy: { date: 'desc' },
          include: { site: true },
        },
      },
    });

    if (!labour) {
      return NextResponse.json({ error: 'Labour profile not found' }, { status: 404 });
    }

    const totalEarned = labour.attendances.reduce((acc, a) => acc + (a.calculatedWage || 0), 0);
    const totalAdvances = labour.advances.reduce((acc, ad) => acc + (ad.amount || 0), 0);
    const totalPaidWages = labour.wagePayouts.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const netBalanceDue = totalEarned - totalAdvances - totalPaidWages;

    return NextResponse.json({
      ...labour,
      joiningDate: labour.joiningDate.toISOString().split('T')[0],
      totalEarned,
      totalAdvances,
      totalPaidWages,
      netBalanceDue,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, phone, pin, skill, dailyWage, status, bankName, accountNo, ifsc, upiId } = body;

    const updated = await prisma.labour.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        pin,
        skill,
        dailyWage: dailyWage ? parseFloat(dailyWage) : undefined,
        status,
        bankName,
        accountNo,
        ifsc,
        upiId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: status === 'ARCHIVED' ? 'LABOUR_ARCHIVED' : 'PROFILE_UPDATED',
        entity: 'Labour',
        entityId: updated.id,
        details: `Updated labour status for ${updated.name} to ${updated.status} (Historical logs preserved)`,
        performedBy: 'Admin Munshi',
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Secure archive: set status to ARCHIVED instead of deleting records to preserve 5-year ledger integrity
    const archived = await prisma.labour.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'LABOUR_ARCHIVED',
        entity: 'Labour',
        entityId: archived.id,
        details: `Safely archived labour profile ${archived.name}. Historical ledger records preserved.`,
        performedBy: 'Admin Munshi',
      },
    });

    return NextResponse.json({ message: 'Labour safely archived', archived });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
