const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SmartMunshi Database...');

  // 1. Create Sites
  const site1 = await prisma.site.create({
    data: {
      name: 'Metro City Tower Site (Sector 62)',
      location: 'Noida, UP',
      budget: 1500000.0,
      status: 'ACTIVE',
    },
  });

  const site2 = await prisma.site.create({
    data: {
      name: 'Greenwood Villa Construction',
      location: 'Gurugram, HR',
      budget: 850000.0,
      status: 'ACTIVE',
    },
  });

  // 2. Create Labours
  const laboursData = [
    {
      name: 'Ramesh Kumar (राजमिस्त्री)',
      phone: '9876543210',
      pin: '1234',
      skill: 'MASON',
      dailyWage: 850.0,
      status: 'ACTIVE',
      bankName: 'State Bank of India',
      accountNo: '30495839201',
      ifsc: 'SBIN0001234',
      upiId: 'ramesh.kumar@upi',
    },
    {
      name: 'Suresh Verma (हेल्पर)',
      phone: '9876543211',
      pin: '1234',
      skill: 'HELPER',
      dailyWage: 550.0,
      status: 'ACTIVE',
      bankName: 'HDFC Bank',
      accountNo: '50100293849',
      ifsc: 'HDFC0000987',
      upiId: 'sureshverma@okaxis',
    },
    {
      name: 'Bablu Sharma (पेंटर)',
      phone: '9876543212',
      pin: '1234',
      skill: 'PAINTER',
      dailyWage: 750.0,
      status: 'ACTIVE',
      bankName: 'Punjab National Bank',
      accountNo: '10293847561',
      ifsc: 'PUNB0123400',
      upiId: 'bablu.sharma@paytm',
    },
    {
      name: 'Mahesh Vishwakarma (कारपेंटर)',
      phone: '9876543213',
      pin: '1234',
      skill: 'CARPENTER',
      dailyWage: 900.0,
      status: 'ACTIVE',
      bankName: 'ICICI Bank',
      accountNo: '00110593821',
      ifsc: 'ICIC0000111',
      upiId: 'mahesh.carpenter@ybl',
    },
    {
      name: 'Amit Kumar (इलेक्ट्रिशियन)',
      phone: '9876543214',
      pin: '1234',
      skill: 'ELECTRICIAN',
      dailyWage: 950.0,
      status: 'ACTIVE',
      bankName: 'Bank of Baroda',
      accountNo: '09810293847',
      ifsc: 'BARB0NOIDA',
      upiId: 'amit.elec@gpay',
    },
    {
      name: 'Rajesh Ram (मजदूर)',
      phone: '9876543215',
      pin: '1234',
      skill: 'HELPER',
      dailyWage: 500.0,
      status: 'ON_LEAVE',
      bankName: 'Paytm Payments Bank',
      accountNo: '919876543215',
      ifsc: 'PYTM0123456',
      upiId: '9876543215@paytm',
    },
  ];

  const createdLabours = [];
  for (const l of laboursData) {
    const created = await prisma.labour.create({ data: l });
    createdLabours.push(created);
  }

  // 3. Create Attendance Records for last 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    for (let j = 0; j < createdLabours.length; j++) {
      const labour = createdLabours[j];
      let status = 'PRESENT';
      let ot = 0;

      if (i === 1 && j === 1) status = 'HALF_DAY';
      if (i === 3 && j === 3) status = 'ABSENT';
      if (i === 0 && j === 0) ot = 2.0;

      let wage = status === 'PRESENT' ? labour.dailyWage : status === 'HALF_DAY' ? labour.dailyWage / 2 : 0;
      if (ot > 0) wage += (labour.dailyWage / 8) * ot * 1.5; // Overtime 1.5x

      await prisma.attendance.create({
        data: {
          labourId: labour.id,
          siteId: j % 2 === 0 ? site1.id : site2.id,
          date: dateStr,
          status: status,
          overtimeHours: ot,
          calculatedWage: wage,
          selfMarked: i === 0,
          verifiedByAdmin: true,
          notes: ot > 0 ? `Completed ${ot} hrs emergency overtime for ceiling slab` : 'Regular shift',
        },
      });
    }
  }

  // 4. Create Advances
  await prisma.advance.create({
    data: {
      labourId: createdLabours[0].id,
      siteId: site1.id,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      amount: 1500.0,
      paymentMode: 'CASH',
      reason: 'Home trip emergency advance for medical expenses',
      status: 'PAID',
      approvedBy: 'Munshi Guptaji',
    },
  });

  await prisma.advance.create({
    data: {
      labourId: createdLabours[1].id,
      siteId: site2.id,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      amount: 800.0,
      paymentMode: 'UPI',
      reason: 'Festival advance for Deepawali snacks',
      status: 'PAID',
      approvedBy: 'Munshi Guptaji',
    },
  });

  // 5. Create Expenses ("Kaha Kharcha Hua")
  const expensesData = [
    {
      siteId: site1.id,
      category: 'MATERIALS',
      amount: 24500.0,
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      paidBy: 'Munshi Guptaji',
      description: 'Purchased 50 Bags Ultratech Cement from Shrinath Hardware',
      vendorName: 'Shrinath Hardware & Building Supplies',
    },
    {
      siteId: site1.id,
      category: 'FOOD_SNACKS',
      amount: 650.0,
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      paidBy: 'Site Supervisor',
      description: 'Morning tea and samosa for 12 labourers on site',
      vendorName: 'Sharma Tea Stall',
    },
    {
      siteId: site2.id,
      category: 'TRANSPORT',
      amount: 3200.0,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      paidBy: 'Munshi Guptaji',
      description: 'Tractor trolley fare for unloading 2 brass coarse sand',
      vendorName: 'Raju Transport Service',
    },
    {
      siteId: site1.id,
      category: 'TOOLS',
      amount: 1850.0,
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      paidBy: 'Munshi Guptaji',
      description: 'Steel measuring tape, trowels (करनी), and safety helmet kit',
      vendorName: 'Bharat Tool Mart',
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  // 6. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INIT',
      entity: 'System',
      details: 'SmartMunshi database initialized with default construction sites and labour records',
      performedBy: 'System Admin',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
