'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, CreditCard } from 'lucide-react';
import { SkillType } from '@/lib/types';

interface AddLabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLabourModal: React.FC<AddLabourModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [skill, setSkill] = useState<SkillType>('MASON');
  const [dailyWage, setDailyWage] = useState('750');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/labours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          pin,
          skill,
          dailyWage,
          bankName,
          accountNo,
          ifsc,
          upiId,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register labour');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold text-lg text-white">Register New Labour Profile</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Labour Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Skill / Trade</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as SkillType)}
                className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
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

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Daily Wage Rate (₹/day) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 750"
                value={dailyWage}
                onChange={(e) => setDailyWage(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm font-bold p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">4-Digit PIN</label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm font-mono p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-sky-400 block">Bank / UPI Payment Details (Optional)</span>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Bank Name (e.g. SBI)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="IFSC Code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 font-mono"
              />
              <input
                type="text"
                placeholder="UPI ID (e.g. name@upi)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
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
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Register Labour'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
