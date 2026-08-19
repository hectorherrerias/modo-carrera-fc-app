import React from 'react';
import { LayoutGrid, Users, Calendar, Trophy, ArrowLeftRight, GraduationCap, Mic, Newspaper } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'tactics', label: 'Táctica', icon: LayoutGrid },
    { id: 'stats', label: 'Plantilla', icon: Users },
    { id: 'matches', label: 'Partidos', icon: Calendar },
    { id: 'competitions', label: 'Ligas', icon: Trophy },
    { id: 'transfers', label: 'Mercado', icon: ArrowLeftRight },
    { id: 'youth', label: 'Cantera', icon: GraduationCap },
    { id: 'press', label: 'Ruedas IA', icon: Mic },
    { id: 'news', label: 'Portadas', icon: Newspaper },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl">
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none px-2 py-1.5 scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/30 scale-105' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[10px] whitespace-nowrap font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
