'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { AdvanceRecord, LabourProfile } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface AdvanceManagerProps {
  advances: AdvanceRecord[];
  labours: LabourProfile[];
  lang: Language;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const AdvanceManager: React.FC<AdvanceManagerProps> = ({
  advances,
  labours,
  lang,
  onRefresh,
  onOpenAddModal,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdvances = advances.filter((a) => {
    const matchesLabour = a.labourName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = a.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLabour || matchesReason;
  });

  const totalAdvanceSum = filteredAdvances.reduce((acc, a) => acc + a.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-amber-400" />
            <span>Advance Payment Ledger (एडवांस सबह)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log emergency advances, festival advances, and medical loans with mandatory reasons & payment mode.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t.giveAdvance}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by labour name or advance reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 text-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Advance Logs Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Showing {filteredAdvances.length} Advance Disbursals</span>
          <span className="text-amber-400 text-sm font-bold">
            Total Disbursed: ₹{totalAdvanceSum.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredAdvances.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No advance records found.
            </div>
          ) : (
            filteredAdvances.map((adv) => (
              <div
                key={adv.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                    {adv.labourName?.charAt(0) || 'L'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm">{adv.labourName}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {adv.paymentMode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      Reason: <span className="text-amber-200">{adv.reason}</span>
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span>Date: <strong className="text-slate-200">{adv.date}</strong></span>
                      <span>Approved By: <strong className="text-slate-300">{adv.approvedBy}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400">
                    ₹{adv.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Status: {adv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
