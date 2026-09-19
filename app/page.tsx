'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { OverviewDashboard } from '@/components/admin/OverviewDashboard';
import { LabourMaster } from '@/components/admin/LabourMaster';
import { AttendanceManager } from '@/components/admin/AttendanceManager';
import { ExpenseManager } from '@/components/admin/ExpenseManager';
import { AdvanceManager } from '@/components/admin/AdvanceManager';
import { ReportsManager } from '@/components/admin/ReportsManager';
import { LabourPortal } from '@/components/labour/LabourPortal';

import { AddLabourModal } from '@/components/modals/AddLabourModal';
import { LogExpenseModal } from '@/components/modals/LogExpenseModal';
import { RecordAdvanceModal } from '@/components/modals/RecordAdvanceModal';

import { 
  LabourProfile, 
  AttendanceRecord, 
  ExpenseRecord, 
  AdvanceRecord, 
  AuditLogRecord, 
  SiteRecord 
} from '@/lib/types';
import { Language, translations } from '@/lib/dictionary';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Receipt, 
  Wallet, 
  FileText 
} from 'lucide-react';

export default function Home() {
  // Mount state
  const [mounted, setMounted] = useState(false);

  // App state
  const [role, setRole] = useState<'ADMIN' | 'LABOUR'>('ADMIN');
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Data state
  const [labours, setLabours] = useState<LabourProfile[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [advances, setAdvances] = useState<AdvanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');

  // Modal State
  const [isAddLabourOpen, setIsAddLabourOpen] = useState(false);
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [isRecordAdvanceOpen, setIsRecordAdvanceOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW reg error:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch All Application Data
  const fetchData = async () => {
    try {
      // 1. Fetch Labours
      const laboursRes = await fetch('/api/labours');
      if (laboursRes.ok) {
        const data = await laboursRes.json();
        setLabours(data);
      }

      // 2. Fetch Attendance for Today
      const todayStr = new Date().toISOString().split('T')[0];
      const attRes = await fetch(`/api/attendance?date=${todayStr}&siteId=${selectedSiteId}`);
      if (attRes.ok) {
        const data = await attRes.json();
        setAttendances(data);
      }

      // 3. Fetch Expenses
      const expRes = await fetch(`/api/expenses?siteId=${selectedSiteId}`);
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data.expenses || []);
      }

      // 4. Fetch Advances
      const advRes = await fetch(`/api/advances?siteId=${selectedSiteId}`);
      if (advRes.ok) {
        const data = await advRes.json();
        setAdvances(data);
      }

      // 5. Fetch Sites
      const sitesRes = await fetch('/api/sites');
      if (sitesRes.ok) {
        const data = await sitesRes.json();
        setSites(data);
      }

      // 6. Fetch Reports & Audit Logs
      const reportsRes = await fetch('/api/reports');
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [selectedSiteId, mounted]);

  const t = translations[lang];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center selection:bg-sky-500 selection:text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 animate-pulse">
            <span className="font-bold text-xl text-white">SM</span>
          </div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading SmartMunshi...</p>
        </div>
      </div>
    );
  }

  // Navigation Items Definition
  const navTabs = [
    { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
    { id: 'labours', label: t.navLabourMaster, icon: Users },
    { id: 'attendance', label: t.navAttendance, icon: CalendarCheck },
    { id: 'expenses', label: t.navExpenses, icon: Receipt },
    { id: 'advances', label: t.navAdvances, icon: Wallet },
    { id: 'reports', label: t.navReports, icon: FileText },
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentRole={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        sites={sites}
        selectedSiteId={selectedSiteId}
        setSelectedSiteId={setSelectedSiteId}
        isOnline={isOnline}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* If Labour Role is Active */}
        {role === 'LABOUR' ? (
          <LabourPortal
            labours={labours}
            attendances={attendances}
            advances={advances}
            lang={lang}
            onRefresh={fetchData}
          />
        ) : (
          <>
            {/* Admin Sub-Navigation Bar */}
            <div className="flex items-center overflow-x-auto space-x-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 scrollbar-none">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab View */}
            {activeTab === 'overview' && (
              <OverviewDashboard
                labours={labours}
                attendances={attendances}
                expenses={expenses}
                advances={advances}
                auditLogs={auditLogs}
                lang={lang}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAddLabourModal={() => setIsAddLabourOpen(true)}
                onOpenLogExpenseModal={() => setIsLogExpenseOpen(true)}
                onOpenAdvanceModal={() => setIsRecordAdvanceOpen(true)}
              />
            )}

            {activeTab === 'labours' && (
              <LabourMaster
                labours={labours}
                lang={lang}
                onRefresh={fetchData}
                onOpenAddModal={() => setIsAddLabourOpen(true)}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceManager
                labours={labours}
                sites={sites}
                selectedSiteId={selectedSiteId}
                lang={lang}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseManager
                expenses={expenses}
                sites={sites}
                selectedSiteId={selectedSiteId}
                lang={lang}
                onRefresh={fetchData}
                onOpenAddModal={() => setIsLogExpenseOpen(true)}
              />
            )}

            {activeTab === 'advances' && (
              <AdvanceManager
                advances={advances}
                labours={labours}
                lang={lang}
                onRefresh={fetchData}
                onOpenAddModal={() => setIsRecordAdvanceOpen(true)}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsManager
                labours={labours}
                attendances={attendances}
                expenses={expenses}
                advances={advances}
                auditLogs={auditLogs}
                lang={lang}
              />
            )}
          </>
        )}

      </main>

      {/* Global Modals */}
      <AddLabourModal
        isOpen={isAddLabourOpen}
        onClose={() => setIsAddLabourOpen(false)}
        onSuccess={fetchData}
      />

      <LogExpenseModal
        isOpen={isLogExpenseOpen}
        onClose={() => setIsLogExpenseOpen(false)}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSuccess={fetchData}
      />

      <RecordAdvanceModal
        isOpen={isRecordAdvanceOpen}
        onClose={() => setIsRecordAdvanceOpen(false)}
        labours={labours}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSuccess={fetchData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        SmartMunshi (स्मार्ट मुंशी) v2.0 • Labour & Site Financial Management System • 5-Yr Storage Archive Ready
      </footer>

    </div>
  );
}
