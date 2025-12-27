
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import CanvasWorkspace from './components/CanvasWorkspace.tsx';
import ExtensionDownloader from './components/ExtensionDownloader.tsx';
import { Session, ViewType, Tab } from './types.ts';
import { storage } from './services/storage.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('workspace');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveTabs, setLiveTabs] = useState<Tab[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [extensionId, setExtensionId] = useState<string>(localStorage.getItem('tabflow_ext_id') || '');
  const [isAutoConnected, setIsAutoConnected] = useState(false);

  // Auto-handshake listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TABFLOW_EXTENSION_READY' && event.data?.extensionId) {
        console.log("Automatic handshake successful with ID:", event.data.extensionId);
        setExtensionId(event.data.extensionId);
        setIsAutoConnected(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const saved = storage.getSessions();
    setSessions(saved);
  }, []);

  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    if (extensionId) {
      localStorage.setItem('tabflow_ext_id', extensionId);
    }
  }, [extensionId]);

  const fetchExtensionTabs = async () => {
    if (!extensionId) {
      alert("No extension detected. Please install and load the extension first.");
      setView('import-export');
      return;
    }

    setIsFetching(true);
    try {
      const chromeObj = (window as any).chrome;
      if (chromeObj && chromeObj.runtime && chromeObj.runtime.sendMessage) {
        chromeObj.runtime.sendMessage(extensionId, { type: "GET_TABS" }, (response: any) => {
          if (response && response.tabs) {
            setLiveTabs(response.tabs);
          } else {
            console.warn("Connection attempt failed, likely incorrect ID or extension not active.");
            setIsAutoConnected(false);
            alert("Could not communicate with the extension. Ensure it is loaded and your browser allows external messaging.");
          }
          setIsFetching(false);
        });
      } else {
        // Mock fallback for UI testing in dev environments
        setTimeout(() => {
          setLiveTabs([
            { id: '1', title: 'GitHub - TabFlow', url: 'https://github.com' },
            { id: '2', title: 'React Documentation', url: 'https://react.dev' },
            { id: '3', title: 'Vercel Deployment', url: 'https://vercel.com' },
            { id: '4', title: 'Linear - Workspace', url: 'https://linear.app' }
          ]);
          setIsFetching(false);
        }, 800);
      }
    } catch (e) {
      console.error(e);
      setIsFetching(false);
    }
  };

  const handleUpdateSessions = (updated: Session[]) => setSessions(updated);

  return (
    <div className="flex bg-[#0a0c10] text-slate-300 min-h-screen selection:bg-blue-500/30 font-sans">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen">
        {view === 'workspace' && (
          <CanvasWorkspace 
            sessions={sessions} 
            liveTabs={liveTabs}
            onUpdateSessions={handleUpdateSessions}
            onFetchTabs={fetchExtensionTabs}
            isFetching={isFetching}
            onRemoveLiveTab={(id) => setLiveTabs(prev => prev.filter(t => t.id !== id))}
          />
        )}

        {view === 'import-export' && (
          <div className="p-12 max-w-6xl mx-auto overflow-y-auto w-full custom-scrollbar">
            <header className="mb-12">
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">System Setup</h2>
              <p className="text-slate-500 text-lg">The bridge is now automated. Just install and go.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <ExtensionDownloader />
                
                <div className={`bg-[#161920] p-8 rounded-3xl border transition-colors shadow-2xl ${isAutoConnected ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <i className={`fas ${isAutoConnected ? 'fa-link text-emerald-400' : 'fa-link-slash text-slate-500'}`}></i>
                    Connection Status
                  </h3>
                  {isAutoConnected ? (
                    <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl flex items-center gap-4 text-sm font-bold border border-emerald-500/20">
                      <i className="fas fa-check-circle"></i>
                      Extension Detected & Linked Automatically
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 text-slate-400 p-4 rounded-2xl flex items-center gap-4 text-sm font-medium border border-slate-700">
                      <i className="fas fa-hourglass-half animate-pulse"></i>
                      Waiting for extension...
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 block">Extension Bridge ID</label>
                    <input 
                      type="text"
                      value={extensionId}
                      onChange={(e) => setExtensionId(e.target.value)}
                      placeholder="Waiting for auto-detect..."
                      className="w-full bg-[#0a0c10] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#161920] p-8 rounded-3xl border border-slate-800 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6">Backup Control</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => storage.exportData()}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex flex-col items-center gap-2"
                    >
                      <i className="fas fa-file-export text-xl text-blue-400"></i>
                      Export
                    </button>
                    <label className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex flex-col items-center gap-2 cursor-pointer">
                      <i className="fas fa-file-import text-xl text-emerald-400"></i>
                      Restore
                      <input type="file" className="hidden" accept=".json" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const text = await file.text();
                           if (storage.importData(text)) {
                             setSessions(storage.getSessions());
                             alert('Workspace restored!');
                           }
                         }
                      }} />
                    </label>
                  </div>
                </div>

                <div className="bg-[#161920] p-8 rounded-3xl border border-slate-800 shadow-2xl">
                   <h3 className="text-xl font-bold text-white mb-4">Workspace Health</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Active Canvas Groups</span>
                        <span className="text-white font-bold">{sessions.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Total Tabs Stored</span>
                        <span className="text-white font-bold">{sessions.reduce((acc, s) => acc + s.tabs.length, 0)}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
