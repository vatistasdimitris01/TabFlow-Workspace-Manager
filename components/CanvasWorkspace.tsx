import React, { useState } from 'react';
import { Session, Tab } from '../types.ts';

interface CanvasWorkspaceProps {
  sessions: Session[];
  liveTabs: Tab[];
  onUpdateSessions: (sessions: Session[]) => void;
  onFetchTabs: () => void;
  isFetching: boolean;
  onRemoveLiveTab: (id: string) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ 
  sessions, 
  liveTabs, 
  onUpdateSessions, 
  onFetchTabs, 
  isFetching,
  onRemoveLiveTab 
}) => {
  const [draggedTab, setDraggedTab] = useState<Tab | null>(null);

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  const handleDragStart = (tab: Tab) => setDraggedTab(tab);

  const handleDropOnSession = (sessionId: string) => {
    if (!draggedTab) return;
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        if (s.tabs.find(t => t.url === draggedTab.url)) return s;
        return { ...s, tabs: [...s.tabs, { ...draggedTab, id: Math.random().toString(36).substr(2, 9) }] };
      }
      return s;
    });
    onUpdateSessions(updated);
    onRemoveLiveTab(draggedTab.id);
    setDraggedTab(null);
  };

  const createNewSessionFromDrop = (e: React.DragEvent) => {
    if (!draggedTab) return;
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Group",
      createdAt: Date.now(),
      tags: ["Workspace"],
      tabs: [{ ...draggedTab, id: Math.random().toString(36).substr(2, 9) }]
    };
    onUpdateSessions([...sessions, newSession]);
    onRemoveLiveTab(draggedTab.id);
    setDraggedTab(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0c10] bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:40px_40px]">
      
      {/* Sidebar: Floating Browser Inbox */}
      <div className="w-80 m-6 rounded-3xl border border-slate-800 bg-[#11141b]/90 backdrop-blur-xl p-6 flex flex-col shadow-2xl z-10 border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Inbox
          </h3>
          <button 
            onClick={onFetchTabs}
            disabled={isFetching}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isFetching ? 'bg-slate-800 text-slate-500' : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20'
            }`}
          >
            {isFetching ? 'Syncing...' : 'Sync Tabs'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {liveTabs.length > 0 ? liveTabs.map(tab => (
            <div 
              key={tab.id}
              draggable
              onDragStart={() => handleDragStart(tab)}
              className="bg-[#1a1d23] p-4 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-blue-500/30 hover:bg-[#21262d] transition-all group shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#0a0c10] flex items-center justify-center border border-white/5 flex-shrink-0">
                  <img src={`https://www.google.com/s2/favicons?domain=${getHostname(tab.url)}&sz=32`} className="w-5 h-5" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{tab.title}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{getHostname(tab.url)}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 px-4 opacity-50">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-wind text-slate-600"></i>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inbox Empty</p>
              <p className="text-slate-600 text-[10px] mt-2">Sync with extension to pull open tabs.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <div 
        className="flex-1 overflow-auto p-12 flex flex-wrap content-start gap-12 custom-scrollbar"
        onDragOver={(e) => e.preventDefault()}
        onDrop={createNewSessionFromDrop}
      >
        {sessions.map(session => (
          <div 
            key={session.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOnSession(session.id)}
            className="w-80 h-fit bg-[#11141b] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 hover:border-white/10 transition-all group/card relative flex flex-col hover:translate-y-[-4px]"
          >
            <div className="flex items-start justify-between mb-6">
              <input 
                className="bg-transparent border-none text-white font-black text-xl outline-none focus:text-blue-400 w-full tracking-tighter"
                defaultValue={session.name}
                onBlur={(e) => {
                  const updated = sessions.map(s => s.id === session.id ? {...s, name: e.target.value} : s);
                  onUpdateSessions(updated);
                }}
              />
              <button 
                onClick={() => onUpdateSessions(sessions.filter(s => s.id !== session.id))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            
            <div className="space-y-3 min-h-[140px] flex flex-col">
              {session.tabs.map(tab => (
                <div key={tab.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[#0a0c10]/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group/item shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${getHostname(tab.url)}&sz=32`} className="w-5 h-5 rounded" alt="" />
                  <span className="text-[11px] font-bold text-slate-400 truncate flex-1 tracking-tight">{tab.title}</span>
                  <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <a href={tab.url} target="_blank" className="text-slate-600 hover:text-blue-400">
                      <i className="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                    <button 
                      onClick={() => {
                        const updated = sessions.map(s => s.id === session.id ? {...s, tabs: s.tabs.filter(t => t.id !== tab.id)} : s);
                        onUpdateSessions(updated);
                      }}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <i className="fas fa-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
              ))}
              {session.tabs.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-700 p-8 text-center">
                  <i className="fas fa-plus-circle text-2xl mb-2 opacity-20"></i>
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Drop Tabs Here</span>
                </div>
              )}
            </div>

            <button className="mt-8 w-full py-4 bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5">
              Launch Workspace
            </button>
          </div>
        ))}

        {/* Create Visual Hint */}
        <div className="w-80 h-64 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-700 group hover:border-white/10 hover:bg-white/5 transition-all">
           <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <i className="fas fa-plus text-xl"></i>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Drag tab here</span>
           <span className="text-[9px] text-slate-700 mt-2 font-bold italic">to create new group</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;