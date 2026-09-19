export type SkillType = 
  | 'MASON' 
  | 'HELPER' 
  | 'PAINTER' 
  | 'CARPENTER' 
  | 'ELECTRICIAN' 
  | 'PLUMBER' 
  | 'WELDER' 
  | 'SUPERVISOR';

export type LabourStatus = 'ACTIVE' | 'ON_LEAVE' | 'ARCHIVED';

export type AttendanceStatus = 'DOUBLE_SHIFT' | 'OVERDAY' | 'PRESENT' | 'HALF_DAY' | 'ABSENT';

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER';

export type ExpenseCategory = 
  | 'MATERIALS' 
  | 'TRANSPORT' 
  | 'FOOD_SNACKS' 
  | 'TOOLS' 
  | 'FUEL' 
  | 'MISC';

export interface LabourProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  skill: SkillType;
  dailyWage: number;
  status: LabourStatus;
  joiningDate: string;
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  upiId?: string;
  totalEarned?: number;
  totalAdvances?: number;
  totalPaidWages?: number;
  netBalanceDue?: number;
  attendancesCount?: number;
}

export interface AttendanceRecord {
  id: string;
  labourId: string;
  labourName?: string;
  siteId?: string;
  siteName?: string;
  date: string;
  status: AttendanceStatus;
  overtimeHours: number;
  calculatedWage: number;
  selfMarked: boolean;
  verifiedByAdmin: boolean;
  notes?: string;
}

export interface AdvanceRecord {
  id: string;
  labourId: string;
  labourName?: string;
  siteId?: string;
  siteName?: string;
  date: string;
  amount: number;
  paymentMode: PaymentMode;
  reason: string;
  status: string;
  approvedBy: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  siteId?: string;
  siteName?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  description: string;
  receiptUrl?: string;
  vendorName?: string;
  createdAt: string;
}

export interface WagePayoutRecord {
  id: string;
  labourId: string;
  labourName?: string;
  siteId?: string;
  siteName?: string;
  date: string;
  amountPaid: number;
  advancesDeducted: number;
  totalEarned: number;
  netPayable: number;
  paymentMode: PaymentMode;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface SiteRecord {
  id: string;
  name: string;
  location: string;
  budget: number;
  status: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entity: string;
  details: string;
  performedBy: string;
  timestamp: string;
}
