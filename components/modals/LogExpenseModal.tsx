'use client';

import React, { useState } from 'react';
import { X, Receipt, AlertCircle } from 'lucide-react';
import { ExpenseCategory, SiteRecord } from '@/lib/types';
import { validateAmount, validateText } from '@/lib/validation';

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SiteRecord[];
  selectedSiteId: string;
  onSuccess: () => void;
}

export const LogExpenseModal: React.FC<LogExpenseModalProps> = ({
  isOpen,
  onClose,
  sites,
  selectedSiteId,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('MATERIALS');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [paidBy, setPaidBy] = useState('Admin / Site Manager');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amountRes = validateAmount(amount, 1, 10000000, 'Expense Amount');
    if (!amountRes.isValid) newErrors.amount = amountRes.error!;

    const descRes = validateText(description, 'Description / Reason', 3, 200);
    if (!descRes.isValid) newErrors.description = descRes.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: selectedSiteId === 'ALL' ? null : selectedSiteId,
          category,
          amount: parseFloat(amount),
          description: description.trim(),
          vendorName: vendorName.trim() || undefined,
          paidBy,
          date,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to log expense');
      }
    } catch (e: any) {
      setFormError(e.message || 'Error occurred while saving expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-rose-400" />
            <h3 className="font-bold text-lg text-white">Log Site Expense (कहां खर्चा हुआ)</h3>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="MATERIALS">Building Materials (सीमेंट, ईंट)</option>
                <option value="TRANSPORT">Transport & Freight (भाड़ा)</option>
                <option value="FOOD_SNACKS">Food & Tea Snacks (चाय-नाश्ता)</option>
                <option value="TOOLS">Hardware & Tools (औजार)</option>
                <option value="FUEL">Diesel & Fuel (ईंधन)</option>
                <option value="MISC">Miscellaneous (अन्य)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (₹) *</label>
              <input
                type="number"
                min={1}
                max={10000000}
                required
                placeholder="e.g. 24500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`w-full bg-slate-950 text-white text-sm font-bold p-2.5 rounded-xl border ${
                  errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              />
              {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Reason *</label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. 50 Bags Ultratech Cement for 2nd floor slab"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className={`w-full bg-slate-950 text-white text-sm p-2.5 rounded-xl border ${
                errors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            />
            {errors.description && <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Vendor / Hardware Shop</label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Shrinath Building Store"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800"
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
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Save Site Expense'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

