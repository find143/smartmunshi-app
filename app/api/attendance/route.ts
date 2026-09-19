import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month'); // format YYYY-MM
    const siteId = searchParams.get('siteId');
    const labourId = searchParams.get('labourId');

    const where: any = {};
    if (date) where.date = date;
    if (month) {
      where.date = {
        startsWith: month,
      };
    }
    if (siteId && siteId !== 'ALL') where.siteId = siteId;
    if (labourId) where.labourId = labourId;

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        labour: true,
        site: true,
      },
      orderBy: { date: 'desc' },
    });

    const formatted = attendances.map((a) => ({
      id: a.id,
      labourId: a.labourId,
      labourName: a.labour.name,
      skill: a.labour.skill,
      dailyWage: a.labour.dailyWage,
      siteId: a.siteId,
      siteName: a.site?.name || 'Main Site',
      date: a.date,
      status: a.status,
      overtimeHours: a.overtimeHours,
      calculatedWage: a.calculatedWage,
      selfMarked: a.selfMarked,
      verifiedByAdmin: a.verifiedByAdmin,
      notes: a.notes || '',
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records, date, siteId, isSelfCheckIn } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'Records array is required' }, { status: 400 });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const results = [];

    for (const item of records) {
      const { labourId, status, overtimeHours = 0, notes } = item;

      // Fetch labour to calculate wage
      const labour = await prisma.labour.findUnique({ where: { id: labourId } });
      if (!labour) continue;

      let baseWage = 0;
      if (status === 'DOUBLE_SHIFT') baseWage = labour.dailyWage * 2.0; // Double Shift (2.0x)
      else if (status === 'OVERDAY') baseWage = labour.dailyWage * 1.5; // Overday / 1.5 Shift (1.5x)
      else if (status === 'PRESENT') baseWage = labour.dailyWage * 1.0; // Full Day (1.0x)
      else if (status === 'HALF_DAY') baseWage = labour.dailyWage * 0.5; // Half Day (0.5x)
      else baseWage = 0;

      const hourlyRate = labour.dailyWage / 8;
      const overtimePay = (overtimeHours || 0) * hourlyRate * 1.5;
      const calculatedWage = baseWage + overtimePay;

      const attendance = await prisma.attendance.upsert({
        where: {
          labourId_date: {
            labourId,
            date: targetDate,
          },
        },
        update: {
          status,
          overtimeHours: parseFloat(overtimeHours || 0),
          calculatedWage,
          siteId: siteId || null,
          selfMarked: !!isSelfCheckIn,
          verifiedByAdmin: !isSelfCheckIn,
          notes: notes || null,
        },
        create: {
          labourId,
          siteId: siteId || null,
          date: targetDate,
          status,
          overtimeHours: parseFloat(overtimeHours || 0),
          calculatedWage,
          selfMarked: !!isSelfCheckIn,
          verifiedByAdmin: !isSelfCheckIn,
          notes: notes || null,
        },
      });

      results.push(attendance);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: isSelfCheckIn ? 'LABOUR_SELF_CHECKIN' : 'ATTENDANCE_VERIFIED',
        entity: 'Attendance',
        details: `Attendance logged/updated for ${results.length} labours on ${targetDate}`,
        performedBy: isSelfCheckIn ? 'Labour Self Check-In' : 'Admin Munshi',
      },
    });

    return NextResponse.json({ message: 'Attendance recorded successfully', records: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
