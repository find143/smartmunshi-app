'use client';

import React, { useState } from 'react';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { LabourProfile, PaymentMode, SiteRecord } from '@/lib/types';
import { validateAmount, validateText } from '@/lib/validation';

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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const targetLabour = labourId || labours[0]?.id;
    if (!targetLabour) {
      newErrors.labourId = 'Please select a valid labour profile.';
    }

    const amountRes = validateAmount(amount, 1, 500000, 'Advance Amount');
    if (!amountRes.isValid) newErrors.amount = amountRes.error!;

    const reasonRes = validateText(reason, 'Mandatory Reason', 3, 200);
    if (!reasonRes.isValid) newErrors.reason = reasonRes.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labourId: labourId || labours[0]?.id,
          siteId: selectedSiteId === 'ALL' ? null : selectedSiteId,
          amount: parseFloat(amount),
          paymentMode,
          reason: reason.trim(),
          date,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to record advance');
      }
    } catch (e: any) {
      setFormError(e.message || 'Error occurred while recording advance.');
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

        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Labour *</label>
            <select
              value={labourId || labours[0]?.id || ''}
              onChange={(e) => {
                setLabourId(e.target.value);
                if (errors.labourId) setErrors((prev) => ({ ...prev, labourId: '' }));
              }}
              className={`w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border ${
                errors.labourId ? 'border-rose-500' : 'border-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            >
              {labours.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.skill}) - Net Due: ₹{l.netBalanceDue || 0}
                </option>
              ))}
            </select>
            {errors.labourId && <p className="text-[11px] text-rose-400 mt-1">{errors.labourId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Advance Amount (₹) *</label>
              <input
                type="number"
                min={1}
                max={500000}
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`w-full bg-slate-950 text-white text-sm font-bold p-2.5 rounded-xl border ${
                  errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
              {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
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
              maxLength={200}
              placeholder="e.g. Home trip emergency advance for medical expenses"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
              }}
              className={`w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border ${
                errors.reason ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
            {errors.reason && <p className="text-[11px] text-rose-400 mt-1">{errors.reason}</p>}
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

