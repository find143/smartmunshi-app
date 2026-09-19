import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sites);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, budget } = body;

    if (!name || !location) {
      return NextResponse.json({ error: 'Site name and location are required' }, { status: 400 });
    }

    const newSite = await prisma.site.create({
      data: {
        name,
        location,
        budget: budget ? parseFloat(budget) : 0,
      },
    });

    return NextResponse.json(newSite, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
