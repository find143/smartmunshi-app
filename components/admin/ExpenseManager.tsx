'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Building2, 
  Tag, 
  DollarSign, 
  FileText, 
  Camera, 
  Image as ImageIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory, SiteRecord } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface ExpenseManagerProps {
  expenses: ExpenseRecord[];
  sites: SiteRecord[];
  selectedSiteId: string;
  lang: Language;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  sites,
  selectedSiteId,
  lang,
  onRefresh,
  onOpenAddModal,
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Filtered expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.vendorName && exp.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Category totals mapping
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-rose-400" />
            <span>Site Expenses Tracker (कहां खर्चा हुआ)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log raw material purchases, transport fares, site tea/food, and tool expenses with receipt proofs.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-rose-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t.logExpense}</span>
        </button>
      </div>

      {/* Category Totals Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(['MATERIALS', 'TRANSPORT', 'FOOD_SNACKS', 'TOOLS', 'FUEL', 'MISC'] as ExpenseCategory[]).map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`cursor-pointer p-3.5 rounded-2xl border transition ${
              selectedCategory === cat
                ? 'bg-rose-950/40 border-rose-500/50 ring-1 ring-rose-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400 block truncate">
              {cat}
            </span>
            <span className="text-sm font-bold text-white block mt-1">
              ₹{(categoryTotals[cat] || 0).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Categories</option>
            <option value="MATERIALS">Building Materials</option>
            <option value="TRANSPORT">Transport & Freight</option>
            <option value="FOOD_SNACKS">Food & Tea Snacks</option>
            <option value="TOOLS">Hardware & Tools</option>
            <option value="FUEL">Fuel & Fuel</option>
            <option value="MISC">Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Showing {filteredExpenses.length} Expense Logs</span>
          <span className="text-white text-sm font-bold">Total: ₹{totalExpenseSum.toLocaleString('en-IN')}</span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No site expenses logged matching criteria.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {expense.category.substring(0, 3)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm">{expense.description}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {t[expense.category as keyof typeof t] || expense.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Date: <strong className="text-slate-200">{expense.date}</strong></span>
                      {expense.vendorName && (
                        <span>Vendor: <strong className="text-sky-400">{expense.vendorName}</strong></span>
                      )}
                      <span>Paid By: <strong className="text-slate-300">{expense.paidBy}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-rose-400">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => setPreviewReceiptUrl(expense.receiptUrl || 'SAMPLE_RECEIPT')}
                    className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Bill Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill Receipt Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Bill & Receipt Attachment Proof</h3>
              <button onClick={() => setPreviewReceiptUrl(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Generated Mock Receipt Preview */}
            <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 font-mono text-xs shadow-inner">
              <div className="text-center border-b pb-3">
                <h4 className="font-bold text-base uppercase">SHRINATH HARDWARE & BUILDING SUPPLIES</h4>
                <p className="text-[10px] text-slate-600">GSTIN: 07AAAAA0000A1Z5 • Phone: 9876543210</p>
                <p className="text-[10px] text-slate-500 mt-1">TAX INVOICE / CASH MEMO</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between"><span>Date:</span> <span>2026-09-18</span></div>
                <div className="flex justify-between"><span>Site:</span> <span>Metro City Tower Site</span></div>
                <div className="flex justify-between"><span>Payment Mode:</span> <span>CASH</span></div>
              </div>

              <table className="w-full border-t border-b py-2 text-left">
                <thead>
                  <tr className="border-b">
                    <th>Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ultratech PPC Cement Bags</td>
                    <td className="text-right">50</td>
                    <td className="text-right">₹19,500</td>
                  </tr>
                  <tr>
                    <td>Coarse Sand (Red Bajri)</td>
                    <td className="text-right">1 Brass</td>
                    <td className="text-right">₹5,000</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>TOTAL PAID:</span>
                <span>₹24,500.00</span>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2">
                Verified & Scanned into SmartMunshi 5-Yr Storage Archive
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Close Receipt View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
