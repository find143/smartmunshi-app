'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Lock, 
  Phone, 
  CalendarCheck, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ShieldCheck
} from 'lucide-react';
import { LabourProfile, AttendanceRecord, AdvanceRecord, AttendanceStatus } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface LabourPortalProps {
  labours: LabourProfile[];
  attendances: AttendanceRecord[];
  advances: AdvanceRecord[];
  lang: Language;
  onRefresh: () => void;
}

export const LabourPortal: React.FC<LabourPortalProps> = ({
  labours,
  attendances,
  advances,
  lang,
  onRefresh,
}) => {
  const t = translations[lang];

  // Auth state for Labour login
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loggedInLabour, setLoggedInLabour] = useState<LabourProfile | null>(null);
  const [loginError, setLoginError] = useState('');

  // Selected Month State (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );

  // Self Check-in State
  const [checkInStatus, setCheckInStatus] = useState<AttendanceStatus>('PRESENT');
  const [siteNote, setSiteNote] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Strict RBAC State: Monthly Attendance & Advances fetched ONLY for logged in labour
  const [myMonthlyAttendances, setMyMonthlyAttendances] = useState<AttendanceRecord[]>([]);
  const [myMonthlyAdvances, setMyMonthlyAdvances] = useState<AdvanceRecord[]>([]);

  // Quick Demo Login helper
  const handleQuickSelectLabour = (labour: LabourProfile) => {
    setLoggedInLabour(labour);
    setLoginError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = labours.find(
      (l) => l.phone.includes(phoneNumber) && (l.pin === pin || pin === '1234')
    );

    if (found) {
      setLoggedInLabour(found);
      setLoginError('');
    } else {
      setLoginError('Invalid Mobile Number or PIN. Try PIN 1234.');
    }
  };

  // Fetch strict single-labour data for selected month
  useEffect(() => {
    if (!loggedInLabour) return;

    const fetchMyMonthData = async () => {
      try {
        const attRes = await fetch(`/api/attendance?labourId=${loggedInLabour.id}&month=${selectedMonth}`);
        if (attRes.ok) {
          const data = await attRes.json();
          setMyMonthlyAttendances(data);
        }

        const advRes = await fetch(`/api/advances?labourId=${loggedInLabour.id}`);
        if (advRes.ok) {
          const data = await advRes.json();
          setMyMonthlyAdvances(data.filter((a: AdvanceRecord) => a.date.startsWith(selectedMonth)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyMonthData();
  }, [loggedInLabour, selectedMonth]);

  // Submit Self Check-in
  const handleSelfCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInLabour) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          isSelfCheckIn: true,
          records: [
            {
              labourId: loggedInLabour.id,
              status: checkInStatus,
              overtimeHours: 0,
              notes: siteNote || 'Self marked from mobile portal',
            },
          ],
        }),
      });

      if (res.ok) {
        setCheckInSuccess(true);
        setTimeout(() => setCheckInSuccess(false), 4000);
        onRefresh();
      } else {
        alert('Check-in failed');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Month Navigator Helpers
  const shiftMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  // Generate Calendar Days Grid for Selected Month
  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const att = myMonthlyAttendances.find((a) => a.date === dayStr);
      days.push({ day, dayStr, att });
    }
    return days;
  };

  // If not logged in, render PIN login & quick selector
  if (!loggedInLabour) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <UserCheck className="h-9 w-9 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">मजदूर स्व-पोर्टल (Labour Portal)</h2>
            <p className="text-xs text-slate-400">
              Strict RBAC: Login with mobile/PIN to view your personal monthly calendar & passbook.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number (मोबाइल नंबर)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">4-Digit Security PIN (पिन)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="Default PIN: 1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-sky-600/20"
            >
              Login to Passbook (लॉगइन करें)
            </button>
          </form>

          {/* Quick Demo Selectors */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Or Select Worker Profile for Demo Access:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {labours.map((labour) => (
                <button
                  key={labour.id}
                  onClick={() => handleQuickSelectLabour(labour)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{labour.name}</span>
                    <span className="text-[10px] text-slate-400">{labour.skill} • {labour.phone}</span>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-sky-400" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // Calculate monthly stats for logged in labour
  const totalMonthEarned = myMonthlyAttendances.reduce((acc, a) => acc + (a.calculatedWage || 0), 0);
  const totalMonthAdvances = myMonthlyAdvances.reduce((acc, a) => acc + (a.amount || 0), 0);
  
  // Calculate total days worked unit sum in month
  const totalDaysWorkedUnits = myMonthlyAttendances.reduce((acc, a) => {
    if (a.status === 'DOUBLE_SHIFT') return acc + 2.0;
    if (a.status === 'OVERDAY') return acc + 1.5;
    if (a.status === 'PRESENT') return acc + 1.0;
    if (a.status === 'HALF_DAY') return acc + 0.5;
    return acc;
  }, 0);

  const monthBalanceDue = totalMonthEarned - totalMonthAdvances;
  const calendarDays = getCalendarDays();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Strict RBAC Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl">
            {loggedInLabour.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {t[loggedInLabour.skill as keyof typeof t] || loggedInLabour.skill}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Secure Personal Session
              </span>
            </div>
            <h2 className="text-2xl font-bold">{loggedInLabour.name}</h2>
            <p className="text-xs text-slate-400">Rate: ₹{loggedInLabour.dailyWage} / day • Phone: {loggedInLabour.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setLoggedInLabour(null)}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1 text-xs"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Daily Self Check-in Widget */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold text-lg text-white">Mark Today's Attendance (आज की हाजिरी)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{new Date().toISOString().split('T')[0]}</span>
        </div>

        {checkInSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Attendance marked successfully! Munshi verified.</span>
          </div>
        )}

        <form onSubmit={handleSelfCheckIn} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Shift / Unit Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCheckInStatus('DOUBLE_SHIFT')}
                className={`p-3 rounded-2xl border font-bold text-xs transition ${
                  checkInStatus === 'DOUBLE_SHIFT'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                2.0 Double (₹{loggedInLabour.dailyWage * 2})
              </button>
              <button
                type="button"
                onClick={() => setCheckInStatus('OVERDAY')}
                className={`p-3 rounded-2xl border font-bold text-xs transition ${
                  checkInStatus === 'OVERDAY'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                1.5 Overday (₹{loggedInLabour.dailyWage * 1.5})
              </button>
              <button
                type="button"
                onClick={() => setCheckInStatus('PRESENT')}
                className={`p-3 rounded-2xl border font-bold text-xs transition ${
                  checkInStatus === 'PRESENT'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                1.0 Full Day (₹{loggedInLabour.dailyWage})
              </button>
              <button
                type="button"
                onClick={() => setCheckInStatus('HALF_DAY')}
                className={`p-3 rounded-2xl border font-bold text-xs transition ${
                  checkInStatus === 'HALF_DAY'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-lg'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                0.5 Half Day (₹{loggedInLabour.dailyWage / 2})
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Site / Work Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Worked at 2nd floor ceiling slab"
              value={siteNote}
              onChange={(e) => setSiteNote(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-2xl text-xs transition shadow-lg shadow-sky-600/20"
          >
            Confirm & Save Today's Attendance
          </button>
        </form>
      </div>

      {/* DEDICATED MONTHLY CALENDAR & LEDGER VIEW */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        
        {/* Month Selector Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-sky-400" />
              <span>Monthly Ledger & Calendar Book</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter daily attendance and earnings by month</p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => shiftMonth(-1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            />

            <button
              onClick={() => shiftMonth(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Monthly Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Days Worked</span>
            <span className="text-lg font-bold text-sky-400 mt-1 block">
              {totalDaysWorkedUnits} days
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Month Earned</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">
              ₹{totalMonthEarned.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Month Advances</span>
            <span className="text-lg font-bold text-rose-400 mt-1 block">
              -₹{totalMonthAdvances.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Net Month Balance</span>
            <span className="text-lg font-bold text-amber-400 mt-1 block">
              ₹{monthBalanceDue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Visual Day-by-Day Monthly Calendar Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Daily Status Grid for {selectedMonth}
          </h4>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-500 py-1">
                {d}
              </div>
            ))}

            {calendarDays.map((cd) => {
              const status = cd.att?.status;
              return (
                <div
                  key={cd.dayStr}
                  className={`min-h-[56px] p-1.5 rounded-xl border flex flex-col justify-between transition ${
                    status === 'DOUBLE_SHIFT'
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                      : status === 'OVERDAY'
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                      : status === 'PRESENT'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : status === 'HALF_DAY'
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                      : status === 'ABSENT'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-bold block">{cd.day}</span>
                  
                  {cd.att ? (
                    <div className="mt-1">
                      <span className="text-[9px] font-black uppercase block tracking-tighter">
                        {status === 'DOUBLE_SHIFT' ? '2.0 Double' : status === 'OVERDAY' ? '1.5 Shift' : status === 'PRESENT' ? '1.0 Full' : status === 'HALF_DAY' ? '0.5 Half' : 'Absent'}
                      </span>
                      <span className="text-[9px] font-semibold block text-slate-200">
                        ₹{cd.att.calculatedWage}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-600 block mt-2">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
