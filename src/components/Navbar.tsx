import React from 'react';
import { Home, Users, Image as ImageIcon, Settings, Camera, Sparkles } from 'lucide-react';

export type TabType = 'home' | 'contacts' | 'media' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenScanner: () => void;
  cardsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenScanner,
  cardsCount = 0
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'home'
              ? 'text-indigo-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Contacts */}
        <button
          onClick={() => onChangeTab('contacts')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'contacts'
              ? 'text-indigo-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'contacts' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {cardsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full px-1 min-w-[14px] text-center">
                {cardsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Contacts</span>
        </button>

        {/* Center Prominent Scan Button */}
        <div className="relative -top-5 flex flex-col items-center px-2">
          <button
            onClick={onOpenScanner}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 group border-4 border-white"
            title="Scan Business Card"
          >
            <Camera className="w-6 h-6 stroke-[2.2] group-hover:rotate-6 transition-transform" />
          </button>
          <span className="text-[10px] font-bold text-slate-800 mt-0.5">Scan</span>
        </div>

        {/* Tab 3: Media */}
        <button
          onClick={() => onChangeTab('media')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'media'
              ? 'text-indigo-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <ImageIcon className={`w-5 h-5 ${activeTab === 'media' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight">Media</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => onChangeTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'settings'
              ? 'text-indigo-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  );
};
