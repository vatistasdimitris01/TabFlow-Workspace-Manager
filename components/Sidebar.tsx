
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: 'workspace' as ViewType, label: 'Workspace', icon: 'fa-shapes' },
    { id: 'import-export' as ViewType, label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <aside className="w-20 bg-[#0f1115] border-r border-slate-800 h-screen flex flex-col sticky top-0 z-20">
      <div className="p-6 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/40">
          TF
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            title={item.label}
            className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 group ${
              currentView === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} text-lg group-hover:scale-110 transition-transform`}></i>
          </button>
        ))}
      </nav>

      <div className="p-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <i className="fas fa-user-circle text-slate-500 text-xl"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
