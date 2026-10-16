import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateName, 
  validatePhone, 
  validatePin, 
  validateDailyWage, 
  validateIfsc, 
  validateAccountNo, 
  validateUpiId 
} from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const skill = searchParams.get('skill');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (skill) where.skill = skill;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const labours = await prisma.labour.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        attendances: true,
        advances: true,
        wagePayouts: true,
      },
    });

    // Compute net balance & total earned for each labour
    const formatted = labours.map((l) => {
      const totalEarned = l.attendances.reduce((acc, a) => acc + (a.calculatedWage || 0), 0);
      const totalAdvances = l.advances.reduce((acc, ad) => acc + (ad.amount || 0), 0);
      const totalPaidWages = l.wagePayouts.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
      const netBalanceDue = totalEarned - totalAdvances - totalPaidWages;

      return {
        id: l.id,
        name: l.name,
        phone: l.phone,
        pin: l.pin,
        skill: l.skill,
        dailyWage: l.dailyWage,
        status: l.status,
        joiningDate: l.joiningDate.toISOString().split('T')[0],
        bankName: l.bankName || '',
        accountNo: l.accountNo || '',
        ifsc: l.ifsc || '',
        upiId: l.upiId || '',
        totalEarned,
        totalAdvances,
        totalPaidWages,
        netBalanceDue,
        attendancesCount: l.attendances.length,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, pin, skill, dailyWage, bankName, accountNo, ifsc, upiId } = body;

    // Server side validations
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    const pinCheck = validatePin(pin || '1234');
    if (!pinCheck.isValid) {
      return NextResponse.json({ error: pinCheck.error }, { status: 400 });
    }

    const wageCheck = validateDailyWage(dailyWage);
    if (!wageCheck.isValid) {
      return NextResponse.json({ error: wageCheck.error }, { status: 400 });
    }

    if (ifsc) {
      const ifscCheck = validateIfsc(ifsc);
      if (!ifscCheck.isValid) return NextResponse.json({ error: ifscCheck.error }, { status: 400 });
    }

    if (accountNo) {
      const accCheck = validateAccountNo(accountNo);
      if (!accCheck.isValid) return NextResponse.json({ error: accCheck.error }, { status: 400 });
    }

    if (upiId) {
      const upiCheck = validateUpiId(upiId);
      if (!upiCheck.isValid) return NextResponse.json({ error: upiCheck.error }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Check duplicate phone number
    const existing = await prisma.labour.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return NextResponse.json(
        { error: `Worker with mobile number ${cleanPhone} is already registered.` },
        { status: 400 }
      );
    }

    const newLabour = await prisma.labour.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        pin: pin ? pin.trim() : '1234',
        skill: skill || 'HELPER',
        dailyWage: parseFloat(dailyWage),
        bankName: bankName ? bankName.trim() : null,
        accountNo: accountNo ? accountNo.trim() : null,
        ifsc: ifsc ? ifsc.trim().toUpperCase() : null,
        upiId: upiId ? upiId.trim() : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LABOUR_CREATED',
        entity: 'Labour',
        entityId: newLabour.id,
        details: `Registered new labour ${name.trim()} (${skill}) with wage ₹${dailyWage}/day`,
        performedBy: 'Admin Munshi',
      },
    });

    return NextResponse.json(newLabour, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
