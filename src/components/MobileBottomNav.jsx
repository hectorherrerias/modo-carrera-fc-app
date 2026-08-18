import React from 'react';
import { LayoutGrid, Users, Trophy, ArrowLeftRight, GraduationCap, Mic, Newspaper } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'tactics', label: 'Táctica', icon: LayoutGrid },
    { id: 'stats', label: 'Plantilla', icon: Users },
    { id: 'competitions', label: 'Ligas', icon: Trophy },
    { id: 'transfers', label: 'Fichajes', icon: ArrowLeftRight },
    { id: 'youth', label: 'Cantera', icon: GraduationCap },
    { id: 'press', label: 'Prensa', icon: Mic },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive 
                ? 'text-emerald-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
