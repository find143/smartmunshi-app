'use client';

import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { LabourProfile, AttendanceRecord, ExpenseRecord, AdvanceRecord, AuditLogRecord } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface OverviewDashboardProps {
  labours: LabourProfile[];
  attendances: AttendanceRecord[];
  expenses: ExpenseRecord[];
  advances: AdvanceRecord[];
  auditLogs: AuditLogRecord[];
  lang: Language;
  onNavigate: (tab: string) => void;
  onOpenAddLabourModal: () => void;
  onOpenLogExpenseModal: () => void;
  onOpenAdvanceModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  labours,
  attendances,
  expenses,
  advances,
  auditLogs,
  lang,
  onNavigate,
  onOpenAddLabourModal,
  onOpenLogExpenseModal,
  onOpenAdvanceModal,
}) => {
  const t = translations[lang];

  // Aggregation Metrics
  const activeLabours = labours.filter((l) => l.status === 'ACTIVE').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.date === todayStr);
  const presentToday = todayAttendances.filter((a) => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;

  const totalWageLiability = labours.reduce((acc, l) => acc + (l.netBalanceDue || 0), 0);
  const totalMonthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalPendingAdvances = advances
    .filter((a) => a.status === 'PAID')
    .reduce((acc, a) => acc + a.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 border border-sky-900/40 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Contractor Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              {t.appTitle} ({lang === 'hi' ? 'स्मार्ट मुंशी' : 'SmartMunshi Dashboard'})
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live site analytics, daily wage calculation, and historical Khata book management.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddLabourModal}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition shadow-lg shadow-sky-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.addLabour}</span>
            </button>
            <button
              onClick={onOpenLogExpenseModal}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Receipt className="h-4 w-4" />
              <span>{t.logExpense}</span>
            </button>
            <button
              onClick={onOpenAdvanceModal}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition shadow-lg shadow-amber-600/20"
            >
              <Wallet className="h-4 w-4" />
              <span>{t.giveAdvance}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Labours */}
        <div 
          onClick={() => onNavigate('labours')}
          className="cursor-pointer bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.totalActiveLabours}
            </span>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{activeLabours}</span>
            <span className="text-xs text-sky-400 font-medium flex items-center">
              Total Roster <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="cursor-pointer bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.todayAttendance}
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">
              {presentToday} / {labours.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              {labours.length > 0 ? Math.round((presentToday / labours.length) * 100) : 0}% Present
            </span>
          </div>
        </div>

        {/* Total Wage Liability */}
        <div 
          onClick={() => onNavigate('labours')}
          className="cursor-pointer bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.totalWageLiability}
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">
              ₹{totalWageLiability.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Khata Balance</span>
          </div>
        </div>

        {/* Site Expenses */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="cursor-pointer bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.monthlyExpenses}
            </span>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              ₹{totalMonthlyExpenses.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-rose-400 font-medium">Kaha Kharcha Hua</span>
          </div>
        </div>

      </div>

      {/* Analytics & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Breakdown & Quick Verify */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-white">Daily Attendance & Wage Overview</h3>
              <p className="text-xs text-slate-400">Real-time status of daily labours and verification</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-medium text-sky-400 hover:underline flex items-center"
            >
              Open Full Sheet <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {labours.slice(0, 5).map((labour) => {
              const att = todayAttendances.find((a) => a.labourId === labour.id);
              return (
                <div
                  key={labour.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-400 text-sm">
                      {labour.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{labour.name}</h4>
                      <p className="text-xs text-slate-400">
                        {t[labour.skill as keyof typeof t] || labour.skill} • ₹{labour.dailyWage}/day
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        att?.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : att?.status === 'HALF_DAY'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {att ? t[att.status as keyof typeof t] : 'Not Marked'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      ₹{att ? att.calculatedWage : 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Audit Log Feed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">Site Audit Trail</h3>
            <span className="text-xs text-slate-400">5-Yr Retention</span>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent audit activity.</p>
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex space-x-3 text-xs border-b border-slate-800 pb-3 last:border-0">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">{log.details}</p>
                    <div className="flex items-center space-x-2 text-slate-400 text-[10px] mt-1">
                      <span>{log.performedBy}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
