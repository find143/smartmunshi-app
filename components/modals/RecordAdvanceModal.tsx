'use client';

import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { LabourProfile, PaymentMode, SiteRecord } from '@/lib/types';

interface RecordAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  labours: LabourProfile[];
  sites: SiteRecord[];
  selectedSiteId: string;
  onSuccess: () => void;
}

export const RecordAdvanceModal: React.FC<RecordAdvanceModalProps> = ({
  isOpen,
  onClose,
  labours,
  sites,
  selectedSiteId,
  onSuccess,
}) => {
  const [labourId, setLabourId] = useState(labours[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labourId: labourId || labours[0]?.id,
          siteId: selectedSiteId === 'ALL' ? null : selectedSiteId,
          amount,
          paymentMode,
          reason,
          date,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to record advance');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Record Advance Payout (एडवांस)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Labour *</label>
            <select
              value={labourId}
              onChange={(e) => setLabourId(e.target.value)}
              className="w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {labours.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.skill}) - Net Due: ₹{l.netBalanceDue || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Advance Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm font-bold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="CASH">CASH (नकद)</option>
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Mandatory Reason / Purpose *</label>
            <input
              type="text"
              required
              placeholder="e.g. Home trip emergency advance for medical expenses"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Disburse Advance'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
