'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Database, 
  ShieldCheck, 
  Printer, 
  FileSpreadsheet,
  CheckCircle2,
  Search
} from 'lucide-react';
import { LabourProfile, AttendanceRecord, ExpenseRecord, AdvanceRecord, AuditLogRecord } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface ReportsManagerProps {
  labours: LabourProfile[];
  attendances: AttendanceRecord[];
  expenses: ExpenseRecord[];
  advances: AdvanceRecord[];
  auditLogs: AuditLogRecord[];
  lang: Language;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  labours,
  attendances,
  expenses,
  advances,
  auditLogs,
  lang,
}) => {
  const t = translations[lang];
  const [selectedLabourId, setSelectedLabourId] = useState<string>(labours[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLabour = labours.find((l) => l.id === selectedLabourId);

  // CSV Export Utility
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Printable PDF Slip
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="h-6 w-6 text-sky-400" />
            <span>Reports, PDF Wage Slips & 5-Year Data Archive</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Export company balance sheets, generate formal printable wage slips, and inspect complete 5-year audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-full font-semibold">
          <Database className="h-3.5 w-3.5" />
          <span>5-Year Storage Architecture Active</span>
        </div>
      </div>

      {/* Export Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Labour Khata CSV */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 text-sky-400">
            <FileSpreadsheet className="h-6 w-6" />
            <h3 className="font-bold text-white text-base">Labour Khata Register</h3>
          </div>
          <p className="text-xs text-slate-400">
            Export complete list of labours, total days worked, advances taken, and net due balances to Excel/CSV.
          </p>
          <button
            onClick={() => exportToCSV(labours, 'SmartMunshi_Labour_Master')}
            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Download Labour Ledger (CSV)</span>
          </button>
        </div>

        {/* Expenses CSV */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 text-rose-400">
            <FileSpreadsheet className="h-6 w-6" />
            <h3 className="font-bold text-white text-base">Site Expense Ledger</h3>
          </div>
          <p className="text-xs text-slate-400">
            Export raw materials, transport, food/snacks, and tool expenses categorized with vendor details.
          </p>
          <button
            onClick={() => exportToCSV(expenses, 'SmartMunshi_Site_Expenses')}
            className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-rose-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Download Expenses Sheet (CSV)</span>
          </button>
        </div>

        {/* Attendance Logs CSV */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 text-emerald-400">
            <FileSpreadsheet className="h-6 w-6" />
            <h3 className="font-bold text-white text-base">Attendance Logs Archive</h3>
          </div>
          <p className="text-xs text-slate-400">
            Export historical daily attendance logs, overtime hours, and computed daily wage calculations.
          </p>
          <button
            onClick={() => exportToCSV(attendances, 'SmartMunshi_Attendance_Logs')}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Download Attendance Logs (CSV)</span>
          </button>
        </div>

      </div>

      {/* Formal PDF Wage Slip Preview & Print Section */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Generate Printable PDF Wage Slip</h3>
            <p className="text-xs text-slate-400">Select a labour profile to view and print formal monthly wage voucher.</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedLabourId}
              onChange={(e) => setSelectedLabourId(e.target.value)}
              className="bg-slate-950 text-slate-200 text-sm px-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {labours.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrintSlip}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-sky-600/20"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Voucher UI */}
        {selectedLabour && (
          <div className="printable-voucher bg-white text-slate-900 p-8 rounded-2xl shadow-xl space-y-6 border border-slate-200 max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">SMARTMUNSHI WAGE SLIP</h2>
                <p className="text-xs text-slate-600">Labour & Site Financial Management System</p>
                <p className="text-xs text-slate-500">Site: Metro City Tower Project • Sector 62, Noida</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded bg-slate-100 text-slate-700 border">
                  CONFIDENTIAL VOUCHER
                </span>
                <p className="text-[10px] text-slate-500 mt-2">Date: {new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>

            {/* Labour Details */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500 block">Labour Name:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLabour.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Skill / Trade:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLabour.skill}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mobile Number:</span>
                <span className="font-mono text-slate-900">{selectedLabour.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Daily Wage Rate:</span>
                <span className="font-bold text-slate-900">₹{selectedLabour.dailyWage} / day</span>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-t">
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Total Wages Calculated (Attendance + Overtime)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">₹{selectedLabour.totalEarned || 0}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Less: Cash / UPI Advances Disbursed</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">-₹{selectedLabour.totalAdvances || 0}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Less: Prior Wage Payout Settlements</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-600">-₹{selectedLabour.totalPaidWages || 0}</td>
                </tr>
              </tbody>
            </table>

            {/* Net Balance Footer */}
            <div className="bg-slate-100 p-4 rounded-xl flex justify-between items-center border border-slate-300">
              <span className="font-black text-slate-900 text-sm uppercase">NET BALANCE DUE / PAYABLE:</span>
              <span className="font-black text-xl text-sky-700">₹{(selectedLabour.netBalanceDue || 0).toLocaleString('en-IN')}</span>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1 text-center w-40">
                Labour Signature / Thumb Print
              </div>
              <div className="border-t border-slate-400 pt-1 text-center w-40">
                Contractor / Munshi Stamp
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 5-Year Audit Logs Stream */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">5-Year System Audit Trail Log</h3>
          <span className="text-xs text-slate-400">Indexed for historical compliance</span>
        </div>

        <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-start space-x-3 text-xs">
              <ShieldCheck className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 mt-0.5">{log.details}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Performed By: {log.performedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
