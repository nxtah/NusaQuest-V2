'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import QuestionsTable from './QuestionsTable';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeMenu, setActiveMenu] = useState('pertanyaan');
  
  return (
    <div className="min-h-screen w-full flex text-white font-sans relative overflow-hidden">
      {/* Background Combo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img src="https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/langit_uh640b.webp" alt="Langit" className="absolute inset-0 w-full h-full object-cover" />
        <img src="https://res.cloudinary.com/dprxjzfxp/image/upload/v1774523645/NQR3_1_vihh5b.webp" alt="Landprofile" className="absolute bottom-0 w-full h-full object-cover object-bottom" />
        {/* Overlay gradient to ensure text readability globally */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        onLogout={onLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 lg:p-10 overflow-hidden h-screen z-10">
        <DashboardHeader activeMenu={activeMenu} />
        
        {/* Render content based on active menu */}
        {activeMenu === 'pertanyaan' && <QuestionsTable />}
        {activeMenu === 'informasi' && (
          <div className="flex-1 bg-[#1e2532]/70 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-8 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
             <p className="text-2xl text-gray-300 font-bold drop-shadow-md">Menu Informasi (Coming Soon)</p>
          </div>
        )}
        {activeMenu === 'kota' && (
          <div className="flex-1 bg-[#1e2532]/70 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-8 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
             <p className="text-2xl text-gray-300 font-bold drop-shadow-md">Menu Kota & Provinsi (Coming Soon)</p>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}} />
    </div>
  );
}
