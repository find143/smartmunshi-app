'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LabourProfile, AttendanceRecord, AttendanceStatus, SiteRecord } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface AttendanceManagerProps {
  labours: LabourProfile[];
  sites: SiteRecord[];
  selectedSiteId: string;
  lang: Language;
  onRefresh: () => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  labours,
  sites,
  selectedSiteId,
  lang,
  onRefresh,
}) => {
  const t = translations[lang];
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Local state map for attendance entries: labourId -> { status, overtimeHours, notes }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; overtimeHours: number; notes: string; selfMarked: boolean }>
  >({});

  const [saving, setSaving] = useState(false);

  // Fetch existing attendance for currentDate
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance?date=${currentDate}&siteId=${selectedSiteId}`);
        if (res.ok) {
          const data: AttendanceRecord[] = await res.json();
          const initialMap: Record<string, { status: AttendanceStatus; overtimeHours: number; notes: string; selfMarked: boolean }> = {};

          labours.forEach((l) => {
            const existing = data.find((a) => a.labourId === l.id);
            if (existing) {
              initialMap[l.id] = {
                status: existing.status,
                overtimeHours: existing.overtimeHours || 0,
                notes: existing.notes || '',
                selfMarked: existing.selfMarked || false,
              };
            } else {
              initialMap[l.id] = {
                status: 'PRESENT', // default 1.0 unit
                overtimeHours: 0,
                notes: '',
                selfMarked: false,
              };
            }
          });

          setAttendanceState(initialMap);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (labours.length > 0) {
      fetchAttendance();
    }
  }, [currentDate, selectedSiteId, labours]);

  // Update single labour attendance state
  const handleStatusChange = (labourId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [labourId]: {
        ...prev[labourId],
        status,
      },
    }));
  };

  const handleOvertimeChange = (labourId: string, delta: number) => {
    setAttendanceState((prev) => {
      const currentOt = prev[labourId]?.overtimeHours || 0;
      const newOt = Math.max(0, currentOt + delta);
      return {
        ...prev,
        [labourId]: {
          ...prev[labourId],
          overtimeHours: newOt,
        },
      };
    });
  };

  // Save Bulk Attendance
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceState).map(([labourId, val]) => ({
        labourId,
        status: val.status,
        overtimeHours: val.overtimeHours,
        notes: val.notes,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          siteId: selectedSiteId === 'ALL' ? null : selectedSiteId,
          records,
        }),
      });

      if (res.ok) {
        alert('Attendance Book updated successfully!');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save attendance');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Date Navigator Helpers
  const shiftDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // Calculate totals
  const totalWageSum = labours.reduce((acc, l) => {
    const st = attendanceState[l.id];
    if (!st) return acc;
    let multiplier = 0;
    if (st.status === 'DOUBLE_SHIFT') multiplier = 2.0;
    else if (st.status === 'OVERDAY') multiplier = 1.5;
    else if (st.status === 'PRESENT') multiplier = 1.0;
    else if (st.status === 'HALF_DAY') multiplier = 0.5;
    else multiplier = 0.0;

    let base = l.dailyWage * multiplier;
    let otPay = st.overtimeHours * (l.dailyWage / 8) * 1.5;
    return acc + base + otPay;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Date Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <CalendarCheck className="h-6 w-6 text-emerald-400" />
            <span>Attendance Book (हाजिरी बुक)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Flexible wage units: Double Shift (2.0), Overday (1.5), Full Day (1.0), Half Day (0.5), Absent (0.0).
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-xs font-semibold px-2 text-slate-200">
            <CalendarIcon className="h-4 w-4 text-sky-400" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-300">
          <div>Active Roster: <span className="text-white font-bold">{labours.filter(l => l.status === 'ACTIVE').length}</span></div>
          <div>Present: <span className="text-emerald-400 font-bold">
            {Object.values(attendanceState).filter((v) => v.status === 'PRESENT' || v.status === 'DOUBLE_SHIFT' || v.status === 'OVERDAY' || v.status === 'HALF_DAY').length}
          </span></div>
          <div>Estimated Daily Wage: <span className="text-amber-400 font-bold text-sm">₹{totalWageSum.toLocaleString('en-IN')}</span></div>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance Book'}</span>
        </button>
      </div>

      {/* Labour Attendance List Cards */}
      <div className="space-y-3">
        {labours.filter(l => l.status === 'ACTIVE').map((labour) => {
          const st = attendanceState[labour.id] || {
            status: 'PRESENT',
            overtimeHours: 0,
            notes: '',
            selfMarked: false,
          };

          let multiplier = 0;
          if (st.status === 'DOUBLE_SHIFT') multiplier = 2.0;
          else if (st.status === 'OVERDAY') multiplier = 1.5;
          else if (st.status === 'PRESENT') multiplier = 1.0;
          else if (st.status === 'HALF_DAY') multiplier = 0.5;
          else multiplier = 0.0;

          const hourlyRate = labour.dailyWage / 8;
          const baseWage = labour.dailyWage * multiplier;
          const overtimePay = st.overtimeHours * hourlyRate * 1.5;
          const totalWage = baseWage + overtimePay;

          return (
            <div
              key={labour.id}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                st.selfMarked
                  ? 'bg-slate-900/90 border-sky-500/40 ring-1 ring-sky-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Labour Profile Info */}
              <div className="flex items-center space-x-3 min-w-[220px]">
                <div className="h-10 w-10 rounded-xl bg-slate-800 text-sky-400 font-bold flex items-center justify-center text-base">
                  {labour.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-sm">{labour.name}</h4>
                    {st.selfMarked && (
                      <span className="flex items-center space-x-1 text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-medium">
                        <Sparkles className="h-3 w-3" />
                        <span>Self Marked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t[labour.skill as keyof typeof t] || labour.skill} • Rate: ₹{labour.dailyWage}/day
                  </p>
                </div>
              </div>

              {/* Extended Attendance Units Selector (2.0, 1.5, 1.0, 0.5, 0.0) */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                {(['DOUBLE_SHIFT', 'OVERDAY', 'PRESENT', 'HALF_DAY', 'ABSENT'] as AttendanceStatus[]).map((statusKey) => (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(labour.id, statusKey)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      st.status === statusKey
                        ? statusKey === 'DOUBLE_SHIFT'
                          ? 'bg-purple-600 text-white shadow'
                          : statusKey === 'OVERDAY'
                          ? 'bg-indigo-600 text-white shadow'
                          : statusKey === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow'
                          : statusKey === 'HALF_DAY'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {statusKey === 'DOUBLE_SHIFT'
                      ? '2.0 Double (200%)'
                      : statusKey === 'OVERDAY'
                      ? '1.5 Shift (150%)'
                      : statusKey === 'PRESENT'
                      ? '1.0 Full (100%)'
                      : statusKey === 'HALF_DAY'
                      ? '0.5 Half (50%)'
                      : '0.0 Absent (0%)'}
                  </button>
                ))}
              </div>

              {/* Overtime Controls */}
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="h-4 w-4 text-sky-400" />
                <span className="text-xs text-slate-400 font-medium">OT:</span>
                <button
                  onClick={() => handleOvertimeChange(labour.id, -1)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <span className="text-xs font-bold text-white w-6 text-center">{st.overtimeHours}h</span>
                <button
                  onClick={() => handleOvertimeChange(labour.id, 1)}
                  className="h-6 w-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>

              {/* Calculated Wage Badge */}
              <div className="text-right min-w-[100px]">
                <span className="text-[10px] text-slate-400 block uppercase">Calculated Wage</span>
                <span className="text-base font-bold text-emerald-400">
                  ₹{totalWage.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
