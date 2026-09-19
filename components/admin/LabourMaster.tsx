'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Wallet, 
  Phone, 
  Building, 
  CreditCard, 
  FileSpreadsheet, 
  Share2, 
  CheckCircle, 
  ArrowDownRight,
  ArrowUpRight,
  X,
  History,
  Send,
  Archive,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { LabourProfile, SkillType } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface LabourMasterProps {
  labours: LabourProfile[];
  lang: Language;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const LabourMaster: React.FC<LabourMasterProps> = ({
  labours,
  lang,
  onRefresh,
  onOpenAddModal,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [selectedLabourForKhata, setSelectedLabourForKhata] = useState<LabourProfile | null>(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [archiveLabourTarget, setArchiveLabourTarget] = useState<LabourProfile | null>(null);

  // Settlement Form State
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [payNotes, setPayNotes] = useState('');

  // Filtered Labours
  const filteredLabours = labours.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    const matchesSkill = selectedSkill === 'ALL' || l.skill === selectedSkill;
    const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  // Handle Archive / Deactivate Labour
  const handleArchiveLabour = async (labour: LabourProfile) => {
    try {
      const res = await fetch(`/api/labours/${labour.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert(`${labour.name} has been safely archived. Historical 5-year ledger records remain intact.`);
        setArchiveLabourTarget(null);
        if (selectedLabourForKhata?.id === labour.id) setSelectedLabourForKhata(null);
        onRefresh();
      } else {
        alert('Failed to archive labour profile');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Reactivate Labour
  const handleReactivateLabour = async (labour: LabourProfile) => {
    try {
      const res = await fetch(`/api/labours/${labour.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });

      if (res.ok) {
        alert(`${labour.name} is now REACTIVATED to active roster!`);
        if (selectedLabourForKhata?.id === labour.id) setSelectedLabourForKhata(null);
        onRefresh();
      } else {
        alert('Failed to reactivate labour profile');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Wage Payout Settlement
  const handleSettlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourForKhata || !payAmount) return;

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labourId: selectedLabourForKhata.id,
          amountPaid: parseFloat(payAmount),
          totalEarned: selectedLabourForKhata.totalEarned,
          netPayable: selectedLabourForKhata.netBalanceDue,
          paymentMode: payMode,
          notes: payNotes || 'Wage Settlement',
        }),
      });

      if (res.ok) {
        alert('Wage payout settled successfully!');
        setPayoutModalOpen(false);
        setPayAmount('');
        setPayNotes('');
        setSelectedLabourForKhata(null);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to record payout');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Generate WhatsApp Share Message
  const generateWhatsAppShare = (labour: LabourProfile) => {
    const text = `*SmartMunshi - Wage Statement*%0A` +
      `👤 Labour: ${labour.name}%0A` +
      `📱 Phone: ${labour.phone}%0A` +
      `💼 Daily Wage: ₹${labour.dailyWage}/day%0A` +
      `--------------------------------%0A` +
      `💵 Total Earned: ₹${labour.totalEarned || 0}%0A` +
      `💸 Total Advances Taken: ₹${labour.totalAdvances || 0}%0A` +
      `💰 Wages Already Paid: ₹${labour.totalPaidWages || 0}%0A` +
      `--------------------------------%0A` +
      `✅ *Net Balance Due: ₹${labour.netBalanceDue || 0}*%0A%0A` +
      `Thank you for working with us!`;

    const cleanPhone = labour.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="h-6 w-6 text-sky-400" />
            <span>Labour Master & Khata Book (खाता बही)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage profile details, daily wage rates, bank info, and securely archive workers without breaking 5-year ledgers.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addLabour}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Labour Name or Mobile No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Skill Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Skills (सभी ट्रेड)</option>
            <option value="MASON">Mason (राजमिस्त्री)</option>
            <option value="HELPER">Helper (मजदूर)</option>
            <option value="PAINTER">Painter (पेंटर)</option>
            <option value="CARPENTER">Carpenter (कारपेंटर)</option>
            <option value="ELECTRICIAN">Electrician (इलेक्ट्रिशियन)</option>
            <option value="PLUMBER">Plumber (प्लंबर)</option>
            <option value="WELDER">Welder (वेल्डर)</option>
            <option value="SUPERVISOR">Supervisor (सुपरवाइजर)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ACTIVE">Active Labours (सक्रिय)</option>
            <option value="ON_LEAVE">On Leave (छुट्टी पर)</option>
            <option value="ARCHIVED">Archived (आर्काइव / पुराने)</option>
            <option value="ALL">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Labours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabours.map((labour) => (
          <div
            key={labour.id}
            className={`bg-slate-900/60 backdrop-blur border rounded-2xl p-5 flex flex-col justify-between transition shadow-lg ${
              labour.status === 'ARCHIVED'
                ? 'border-slate-800 opacity-75 bg-slate-950/60'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-lg">
                    {labour.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{labour.name}</h3>
                    <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {t[labour.skill as keyof typeof t] || labour.skill}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    labour.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : labour.status === 'ON_LEAVE'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {labour.status}
                </span>
              </div>

              {/* Wage & Contact info */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Default Wage Rate:</span>
                  <span className="font-bold text-white">₹{labour.dailyWage} / day</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Mobile Number:</span>
                  <span className="font-mono text-slate-200">{labour.phone}</span>
                </div>
                {labour.upiId && (
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">UPI / Bank:</span>
                    <span className="font-mono text-sky-400">{labour.upiId}</span>
                  </div>
                )}
              </div>

              {/* Financial Khata Card */}
              <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Days Earned:</span>
                  <span className="font-semibold text-emerald-400">₹{labour.totalEarned || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Advances Taken:</span>
                  <span className="font-semibold text-rose-400">-₹{labour.totalAdvances || 0}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Net Balance Due:</span>
                  <span className={ (labour.netBalanceDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400' }>
                    ₹{(labour.netBalanceDue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedLabourForKhata(labour)}
                  className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl border border-slate-700 transition"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
                  <span>Open Khata</span>
                </button>

                <button
                  onClick={() => generateWhatsAppShare(labour)}
                  className="flex items-center justify-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold py-2 rounded-xl border border-emerald-500/30 transition"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>WhatsApp Slip</span>
                </button>
              </div>

              {/* Archive / Reactivate Button */}
              {labour.status === 'ARCHIVED' ? (
                <button
                  onClick={() => handleReactivateLabour(labour)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold py-1.5 rounded-xl border border-sky-500/30 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reactivate Worker</span>
                </button>
              ) : (
                <button
                  onClick={() => setArchiveLabourTarget(labour)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold py-1.5 rounded-xl border border-rose-500/30 transition"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Deactivate / Archive Labour</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Archive Confirmation Modal */}
      {archiveLabourTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <ShieldAlert className="h-7 w-7" />
              <h3 className="font-bold text-lg text-white">Archive Labour Profile</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to deactivate <strong className="text-white">{archiveLabourTarget.name}</strong>?
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs">
              💡 <strong>5-Year History Safe:</strong> This will hide the worker from active daily attendance lists while preserving all historical attendance, advance loans, and payout ledgers for compliance.
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => setArchiveLabourTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveLabour(archiveLabourTarget)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-rose-600/20"
              >
                Confirm Deactivate & Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Labour Khata Modal */}
      {selectedLabourForKhata && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl">
                  {selectedLabourForKhata.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedLabourForKhata.name}</h3>
                  <p className="text-xs text-slate-400">
                    {t[selectedLabourForKhata.skill as keyof typeof t] || selectedLabourForKhata.skill} • {selectedLabourForKhata.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLabourForKhata(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Financial Ledger Summary Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block uppercase">Total Earned</span>
                <span className="text-lg font-bold text-emerald-400">₹{selectedLabourForKhata.totalEarned || 0}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block uppercase">Advances Taken</span>
                <span className="text-lg font-bold text-rose-400">₹{selectedLabourForKhata.totalAdvances || 0}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block uppercase">Net Balance Due</span>
                <span className="text-lg font-bold text-amber-400">₹{selectedLabourForKhata.netBalanceDue || 0}</span>
              </div>
            </div>

            {/* Bank / UPI Details */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <CreditCard className="h-4 w-4 text-sky-400" />
                <span>Bank & UPI Details</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Bank: <span className="text-white font-medium">{selectedLabourForKhata.bankName || 'N/A'}</span></div>
                <div>Account No: <span className="text-white font-mono">{selectedLabourForKhata.accountNo || 'N/A'}</span></div>
                <div>IFSC: <span className="text-white font-mono">{selectedLabourForKhata.ifsc || 'N/A'}</span></div>
                <div>UPI ID: <span className="text-sky-400 font-mono">{selectedLabourForKhata.upiId || 'N/A'}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPayoutModalOpen(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20"
              >
                Settle Payout (मजदूरी भुगतान करें)
              </button>
              <button
                onClick={() => generateWhatsAppShare(selectedLabourForKhata)}
                className="flex items-center space-x-2 bg-emerald-700/30 hover:bg-emerald-700/40 text-emerald-400 font-bold px-4 py-2.5 rounded-xl border border-emerald-500/40 text-sm transition"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Wage Settlement Payout Modal */}
      {payoutModalOpen && selectedLabourForKhata && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Record Wage Payout</h3>
              <button onClick={() => setPayoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettlePayout} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Labour</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedLabourForKhata.name} (Net Due: ₹${selectedLabourForKhata.netBalanceDue})`}
                  className="w-full bg-slate-950 text-slate-400 text-sm p-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder={`Default: ${selectedLabourForKhata.netBalanceDue || 0}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 text-white text-base font-bold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CASH', 'BANK_TRANSFER'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPayMode(mode)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        payMode === mode
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g., GPay UTR 405928104"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
