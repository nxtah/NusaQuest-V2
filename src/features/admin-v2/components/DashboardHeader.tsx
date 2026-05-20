interface DashboardHeaderProps {
  activeMenu: string;
}

export default function DashboardHeader({ activeMenu }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-center bg-black/40 p-6 rounded-[2rem] backdrop-blur-md border border-white/10 shadow-2xl">
      <div>
        <h2 className="text-[2.5rem] font-black tracking-wider mb-2 uppercase text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          {activeMenu === 'pertanyaan' ? 'MANAGE PERTANYAAN' : activeMenu === 'informasi' ? 'MANAGE INFORMASI' : 'MANAGE KOTA & PROVINSI'}
        </h2>
        <p className="text-lg font-bold text-gray-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {activeMenu === 'pertanyaan' ? 'Add, edit, or remove game questions.' : activeMenu === 'informasi' ? 'Manage general information content.' : 'Manage locations for the game maps.'}
        </p>
      </div>
      
      <button className="relative group px-8 py-3.5 rounded-2xl font-black text-white text-[17px] transition-all duration-300 flex items-center justify-center gap-3 border-2 border-[#5c3a21] shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(139,69,19,0.8)] hover:border-[#8B4513] transform hover:-translate-y-1 overflow-hidden">
        {/* Wood Background Asset */}
        <img 
          src="https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506109/kayu_filvkl.webp" 
          alt="Wood Texture" 
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.85] contrast-125 group-hover:brightness-110 group-hover:contrast-150 transition-all duration-300"
        />
        {/* Warm brown overlay to enhance the wood feel on hover */}
        <div className="absolute inset-0 bg-[#8B4513]/30 mix-blend-color-burn z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Sparkle Icon */}
        <svg className="w-6 h-6 text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
        
        <span className="relative z-10 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Generate with AI</span>
      </button>
    </div>
  );
}
