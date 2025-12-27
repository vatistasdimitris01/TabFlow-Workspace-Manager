
import React, { useState } from 'react';
import { Session, Tab } from '../types';

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

  const handleDragStart = (tab: Tab) => {
    setDraggedTab(tab);
  };

  const handleDropOnSession = (sessionId: string) => {
    if (!draggedTab) return;

    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        // Avoid duplicates
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
      name: "New Project",
      createdAt: Date.now(),
      tags: ["Workspace"],
      tabs: [{ ...draggedTab, id: Math.random().toString(36).substr(2, 9) }]
    };

    onUpdateSessions([...sessions, newSession]);
    onRemoveLiveTab(draggedTab.id);
    setDraggedTab(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]">
      
      {/* Sidebar: Browser Inbox */}
      <div className="w-80 border-r border-slate-800 bg-[#16191e]/80 backdrop-blur-md p-6 flex flex-col z-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-white flex items-center gap-2">
            <i className="fas fa-inbox text-blue-400"></i>
            Live Tabs
          </h3>
          <button 
            onClick={onFetchTabs}
            disabled={isFetching}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            {isFetching ? 'Fetching...' : 'Fetch'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {liveTabs.length > 0 ? liveTabs.map(tab => (
            <div 
              key={tab.id}
              draggable
              onDragStart={() => handleDragStart(tab)}
              className="bg-[#1a1d23] p-3 rounded-xl border border-slate-800 cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:bg-[#1e2229] transition-all group"
            >
              <div className="flex items-center gap-3">
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}&sz=32`} className="w-5 h-5 rounded" alt="" />
                <span className="text-xs font-medium text-slate-300 truncate">{tab.title}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-sm">No live tabs fetched.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <div 
        className="flex-1 overflow-auto p-12 flex flex-wrap content-start gap-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={createNewSessionFromDrop}
      >
        {sessions.map(session => (
          <div 
            key={session.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOnSession(session.id)}
            className="w-72 h-fit bg-[#16191e] rounded-3xl border border-slate-800 shadow-xl p-6 hover:border-slate-700 transition-all group/card relative flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <input 
                className="bg-transparent border-none text-white font-bold text-lg outline-none focus:text-blue-400 w-full"
                defaultValue={session.name}
              />
              <button 
                onClick={() => onUpdateSessions(sessions.filter(s => s.id !== session.id))}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity ml-2"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-2 min-h-[100px] flex flex-col">
              {session.tabs.map(tab => (
                <div key={tab.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group/item">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}&sz=32`} className="w-4 h-4" alt="" />
                  <span className="text-xs text-slate-400 truncate flex-1">{tab.title}</span>
                  <a href={tab.url} target="_blank" className="text-slate-600 hover:text-blue-400 opacity-0 group-hover/item:opacity-100">
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
                </div>
              ))}
              {session.tabs.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 text-[10px] uppercase font-bold tracking-tighter">
                  Drop Here
                </div>
              )}
            </div>

            <button className="mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">
              Restore Group
            </button>
          </div>
        ))}

        {/* Create Visual Hint */}
        <div className="w-72 h-48 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 group hover:border-slate-600 transition-all">
           <i className="fas fa-plus-circle text-2xl mb-2"></i>
           <span className="text-xs font-bold uppercase tracking-widest">Drop tab to start session</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
