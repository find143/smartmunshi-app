import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 1. Fetch Audit Logs
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // 2. Fetch Aggregated Financials
    const totalLabours = await prisma.labour.count({ where: { status: 'ACTIVE' } });
    
    const attendances = await prisma.attendance.findMany();
    const totalEarnedWages = attendances.reduce((acc, a) => acc + (a.calculatedWage || 0), 0);

    const advances = await prisma.advance.findMany();
    const totalAdvancesGiven = advances.reduce((acc, ad) => acc + (ad.amount || 0), 0);

    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const payouts = await prisma.wagePayout.findMany();
    const totalPayoutsMade = payouts.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

    const netWageLiability = totalEarnedWages - totalAdvancesGiven - totalPayoutsMade;

    return NextResponse.json({
      summary: {
        totalLabours,
        totalEarnedWages,
        totalAdvancesGiven,
        totalExpenses,
        totalPayoutsMade,
        netWageLiability,
      },
      auditLogs: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        details: log.details,
        performedBy: log.performedBy,
        timestamp: log.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
