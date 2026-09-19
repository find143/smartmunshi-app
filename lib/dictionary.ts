export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appTitle: 'SmartMunshi',
    appSubtitle: 'Labour & Site Financial Management System',
    adminDashboard: 'Admin / Contractor View',
    labourPortal: 'Labour Self Portal',
    siteSelector: 'Active Construction Site',
    allSites: 'All Construction Sites',
    languageToggle: 'हिंदी (Hindi)',
    
    // Stats
    totalActiveLabours: 'Active Labours',
    todayAttendance: "Today's Attendance",
    totalWageLiability: 'Net Wage Liability',
    monthlyExpenses: 'Monthly Expenses',
    pendingAdvances: 'Pending Advances',
    
    // Modules
    navOverview: 'Overview & Analytics',
    navLabourMaster: 'Labour Master & Khata',
    navAttendance: 'Attendance Book (हाजिरी बुक)',
    navExpenses: 'Expenses (कहां खर्चा हुआ)',
    navAdvances: 'Advance & Payments',
    navReports: '5-Yr Reports & Export',

    // Skills
    MASON: 'Mason (राजमिस्त्री)',
    HELPER: 'Helper (मजदूर)',
    PAINTER: 'Painter (पेंटर)',
    CARPENTER: 'Carpenter (कारपेंटर)',
    ELECTRICIAN: 'Electrician (इलेक्ट्रिशियन)',
    PLUMBER: 'Plumber (प्लंबर)',
    WELDER: 'Welder (वेल्डर)',
    SUPERVISOR: 'Supervisor (सुपरवाइजर)',

    // Attendance Units
    DOUBLE_SHIFT: 'Double Shift (2.0x)',
    OVERDAY: 'Overday / 1.5 Shift (1.5x)',
    PRESENT: 'Full Day (1.0x)',
    HALF_DAY: 'Half Day (0.5x)',
    ABSENT: 'Absent (0.0x)',
    overtime: 'Overtime (Hrs)',
    calculatedWage: 'Calculated Wage',

    // Expenses
    MATERIALS: 'Building Materials (सीमेंट, बालू, ईंट)',
    TRANSPORT: 'Transport & Freight (भाड़ा)',
    FOOD_SNACKS: 'Food & Tea Snacks (चाय-नाश्ता)',
    TOOLS: 'Hardware & Tools (औजार)',
    FUEL: 'Diesel & Fuel (ईंधन)',
    MISC: 'Miscellaneous (अन्य खर्च)',

    // Action buttons
    addLabour: '+ Register New Labour',
    logExpense: '+ Log Site Expense',
    giveAdvance: '+ Record Advance',
    payWages: 'Settle Wage Payout',
    archiveLabour: 'Deactivate / Archive Labour',
    restoreLabour: 'Reactivate Worker',
    exportPDF: 'Download Wage Slip (PDF)',
    exportCSV: 'Export Excel (CSV)',
    shareWhatsApp: 'Send WhatsApp Slip',
    verified: 'Verified by Admin',
    pendingVerification: 'Awaiting Admin Verification',
  },
  hi: {
    appTitle: 'स्मार्ट मुंशी',
    appSubtitle: 'लेबर हाजिरी एवं ठेकेदारी खाता-बही प्रबंधन प्रणाली',
    adminDashboard: 'ठेकेदार (एडमिन) डैशबोर्ड',
    labourPortal: 'मजदूर स्व-पोर्टल',
    siteSelector: 'वर्तमान कंस्ट्रक्शन साइट',
    allSites: 'सभी कंस्ट्रक्शन साइट्स',
    languageToggle: 'English',

    // Stats
    totalActiveLabours: 'कुल सक्रिय मजदूर',
    todayAttendance: 'आज की कुल हाजिरी',
    totalWageLiability: 'बकाया मजदूरी देनदारी',
    monthlyExpenses: 'साइट कुल खर्च',
    pendingAdvances: 'कुल बकाया एडवांस',

    // Modules
    navOverview: 'मुख्य डैशबोर्ड व ग्राफ',
    navLabourMaster: 'मजदूर मास्टर व खाता बही',
    navAttendance: 'हाजिरी बुक (Attendance Book)',
    navExpenses: 'साइट खर्च (कहां खर्चा हुआ)',
    navAdvances: 'एडवांस एवं भुगतान लेजर',
    navReports: '5-वर्षीय रिपोर्ट व डाउनलोड',

    // Skills
    MASON: 'राजमिस्त्री',
    HELPER: 'मजदूर / हेल्पर',
    PAINTER: 'पेंटर / चित्रकार',
    CARPENTER: 'कारपेंटर / बढ़ई',
    ELECTRICIAN: 'इलेक्ट्रिशियन',
    PLUMBER: 'प्लंबर',
    WELDER: 'वेल्डर',
    SUPERVISOR: 'साइट सुपरवाइजर',

    // Attendance Units
    DOUBLE_SHIFT: 'डबल शिफ्ट (2.0 दिहाड़ी)',
    OVERDAY: 'ओवरडे (1.5 दिहाड़ी)',
    PRESENT: 'उपस्थित (1.0 दिहाड़ी)',
    HALF_DAY: 'हाफ डे (0.5 दिहाड़ी)',
    ABSENT: 'गैरहाजिर (0.0 दिहाड़ी)',
    overtime: 'ओवरटाइम (घंटे)',
    calculatedWage: 'गणना की गई दिहाड़ी',

    // Expenses
    MATERIALS: 'निर्माण सामग्री (सीमेंट, रोड़ी, ईंट)',
    TRANSPORT: 'परिवहन व भाड़ा',
    FOOD_SNACKS: 'खाना एवं चाय-नाश्ता',
    TOOLS: 'औजार एवं उपकरण',
    FUEL: 'डीजल एवं ईंधन',
    MISC: 'अन्य आकस्मिक खर्च',

    // Action buttons
    addLabour: '+ नया मजदूर जोड़ें',
    logExpense: '+ नया खर्च दर्ज करें',
    giveAdvance: '+ एडवांस दर्ज करें',
    payWages: 'मजदूरी भुगतान करें',
    archiveLabour: 'निष्क्रिय / आर्काइव करें',
    restoreLabour: 'पुनः सक्रिय करें',
    exportPDF: 'वेतन पर्ची डाउनलोड (PDF)',
    exportCSV: 'एक्सेल रिपोर्ट (CSV)',
    shareWhatsApp: 'व्हाट्सएप पर्ची भेजें',
    verified: 'मुंशी द्वारा सत्यापित',
    pendingVerification: 'सत्यापन हेतु लंबित',
  },
};
