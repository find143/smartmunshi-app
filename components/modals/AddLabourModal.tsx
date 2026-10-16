'use client';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { SkillType } from '@/lib/types';
import { 
  validateName, 
  validatePhone, 
  validatePin, 
  validateDailyWage, 
  validateIfsc, 
  validateAccountNo, 
  validateUpiId 
} from '@/lib/validation';

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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameRes = validateName(name);
    if (!nameRes.isValid) newErrors.name = nameRes.error!;

    const phoneRes = validatePhone(phone);
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error!;

    const pinRes = validatePin(pin);
    if (!pinRes.isValid) newErrors.pin = pinRes.error!;

    const wageRes = validateDailyWage(dailyWage);
    if (!wageRes.isValid) newErrors.dailyWage = wageRes.error!;

    const ifscRes = validateIfsc(ifsc);
    if (!ifscRes.isValid) newErrors.ifsc = ifscRes.error!;

    const accRes = validateAccountNo(accountNo);
    if (!accRes.isValid) newErrors.accountNo = accRes.error!;

    const upiRes = validateUpiId(upiId);
    if (!upiRes.isValid) newErrors.upiId = upiRes.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/labours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          pin: pin.trim(),
          skill,
          dailyWage: parseFloat(dailyWage),
          bankName: bankName.trim() || undefined,
          accountNo: accountNo.trim() || undefined,
          ifsc: ifsc.trim().toUpperCase() || undefined,
          upiId: upiId.trim() || undefined,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to register labour');
      }
    } catch (e: any) {
      setFormError(e.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // Restrict Phone input to numbers max 10
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  // Restrict PIN input to numbers max 4
  const handlePinChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
    if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
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

        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Labour Full Name *</label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border ${
                  errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number (10 Digits) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border ${
                  errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono`}
              />
              {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Daily Wage (₹/day) *</label>
              <input
                type="number"
                min={50}
                max={50000}
                required
                placeholder="e.g. 750"
                value={dailyWage}
                onChange={(e) => {
                  setDailyWage(e.target.value);
                  if (errors.dailyWage) setErrors((prev) => ({ ...prev, dailyWage: '' }));
                }}
                className={`w-full bg-slate-950 text-white text-sm font-bold p-2.5 rounded-xl border ${
                  errors.dailyWage ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
              {errors.dailyWage && <p className="text-[11px] text-rose-400 mt-1">{errors.dailyWage}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">4-Digit PIN *</label>
              <input
                type="text"
                placeholder="1234"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className={`w-full bg-slate-950 text-white text-sm font-mono p-2.5 rounded-xl border ${
                  errors.pin ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
              {errors.pin && <p className="text-[11px] text-rose-400 mt-1">{errors.pin}</p>}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-sky-400 block">Bank / UPI Payment Details (Optional)</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Bank Name (e.g. SBI)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="Account Number"
                  value={accountNo}
                  onChange={(e) => {
                    setAccountNo(e.target.value.replace(/\D/g, ''));
                    if (errors.accountNo) setErrors((prev) => ({ ...prev, accountNo: '' }));
                  }}
                  className={`w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border ${
                    errors.accountNo ? 'border-rose-500' : 'border-slate-800'
                  } font-mono`}
                />
                {errors.accountNo && <p className="text-[10px] text-rose-400 mt-0.5">{errors.accountNo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="IFSC Code (e.g. SBIN0001234)"
                  value={ifsc}
                  onChange={(e) => {
                    setIfsc(e.target.value.toUpperCase());
                    if (errors.ifsc) setErrors((prev) => ({ ...prev, ifsc: '' }));
                  }}
                  className={`w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border ${
                    errors.ifsc ? 'border-rose-500' : 'border-slate-800'
                  } font-mono uppercase`}
                />
                {errors.ifsc && <p className="text-[10px] text-rose-400 mt-0.5">{errors.ifsc}</p>}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="UPI ID (e.g. name@upi)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (errors.upiId) setErrors((prev) => ({ ...prev, upiId: '' }));
                  }}
                  className={`w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border ${
                    errors.upiId ? 'border-rose-500' : 'border-slate-800'
                  } font-mono`}
                />
                {errors.upiId && <p className="text-[10px] text-rose-400 mt-0.5">{errors.upiId}</p>}
              </div>
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

