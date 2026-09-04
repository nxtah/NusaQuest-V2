'use client';
import {useState} from 'react';
import Sidebar from './Sidebar';
import QuestionsTable from './QuestionsTable';
import InformasiTable from './InformasiTable';
import KotaProvinsTable from './KotaProvinsTable';
import CreditTable from './CreditTable';
import MonitoringPanel from './MonitoringPanel';
import '../admin-theme.css';

export default function AdminDashboard({onLogout}: {onLogout: () => void}) {
  const [activeMenu, setActiveMenu] = useState('pertanyaan');

  return (
    <div className="nq-admin-shell min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 overflow-hidden lg:h-screen z-10 min-h-0">
        {/* Render content based on active menu */}
        {activeMenu === 'pertanyaan' && <QuestionsTable />}
        {activeMenu === 'informasi' && <InformasiTable />}
        {activeMenu === 'kota' && <KotaProvinsTable />}
        {activeMenu === 'credit' && <CreditTable />}
        {activeMenu === 'monitoring' && <MonitoringPanel />}
      </main>
    </div>
  );
}
