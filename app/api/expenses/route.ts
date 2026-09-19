import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const siteId = searchParams.get('siteId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (siteId && siteId !== 'ALL') where.siteId = siteId;
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { site: true },
      orderBy: { date: 'desc' },
    });

    const formatted = expenses.map((e) => ({
      id: e.id,
      siteId: e.siteId,
      siteName: e.site?.name || 'General Construction Site',
      category: e.category,
      amount: e.amount,
      date: e.date,
      paidBy: e.paidBy,
      description: e.description,
      receiptUrl: e.receiptUrl || '',
      vendorName: e.vendorName || '',
      createdAt: e.createdAt.toISOString(),
    }));

    // Calculate total summary per category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    return NextResponse.json({
      expenses: formatted,
      categoryTotals,
      totalAmount: expenses.reduce((acc, e) => acc + e.amount, 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, category, amount, date, paidBy, description, receiptUrl, vendorName } = body;

    if (!category || !amount || !description) {
      return NextResponse.json(
        { error: 'Category, Amount and Description are required.' },
        { status: 400 }
      );
    }

    const newExpense = await prisma.expense.create({
      data: {
        siteId: siteId || null,
        category,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        paidBy: paidBy || 'Admin / Site Manager',
        description,
        receiptUrl: receiptUrl || null,
        vendorName: vendorName || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'EXPENSE_LOGGED',
        entity: 'Expense',
        entityId: newExpense.id,
        details: `Logged ${category} expense of ₹${amount} for ${description}`,
        performedBy: paidBy || 'Admin Munshi',
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
