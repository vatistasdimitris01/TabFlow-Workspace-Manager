
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CanvasWorkspace from './components/CanvasWorkspace';
import { Session, ViewType, Tab } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('workspace');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveTabs, setLiveTabs] = useState<Tab[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Load data on mount
  useEffect(() => {
    const saved = storage.getSessions();
    setSessions(saved);
  }, []);

  // Update storage whenever sessions change
  useEffect(() => {
    storage.saveSessions(sessions);
  }, [sessions]);

  const fetchExtensionTabs = async () => {
    setIsFetching(true);
    // Note: In a real environment, you'd use the Extension ID from your build
    // For this demo, we simulate the extension bridge
    try {
      // In production: chrome.runtime.sendMessage(EXTENSION_ID, { type: "GET_TABS" }, ...)
      console.log("Requesting tabs from extension...");
      
      // Simulating a response from the extension
      setTimeout(() => {
        const mockTabs: Tab[] = [
          { id: 'ext-1', title: 'GitHub - TabFlow', url: 'https://github.com' },
          { id: 'ext-2', title: 'React Documentation', url: 'https://react.dev' },
          { id: 'ext-3', title: 'Linear - Workspace', url: 'https://linear.app' },
          { id: 'ext-4', title: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
        ];
        setLiveTabs(mockTabs);
        setIsFetching(false);
      }, 800);
    } catch (e) {
      console.error("Extension not found", e);
      setIsFetching(false);
    }
  };

  const handleUpdateSessions = (updated: Session[]) => {
    setSessions(updated);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      if (storage.importData(text)) {
        setSessions(storage.getSessions());
        alert('Workspace restored!');
      }
    }
  };

  return (
    <div className="flex bg-[#0f1115] text-slate-300 min-h-screen selection:bg-blue-500/30">
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
          <div className="p-12 max-w-4xl mx-auto overflow-y-auto w-full">
            <h2 className="text-4xl font-bold text-white mb-4">Configuration</h2>
            <p className="text-slate-500 mb-12">Manage your workspace persistence and portable data.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1a1d23] p-8 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center text-xl mb-6">
                  <i className="fas fa-download"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Export Workspace</h3>
                <p className="text-slate-400 mb-8 text-sm">Create a portable snapshot of all your sessions and tabs.</p>
                <button 
                  onClick={() => storage.exportData()}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
                  Download .json
                </button>
              </div>

              <div className="bg-[#1a1d23] p-8 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-xl mb-6">
                  <i className="fas fa-upload"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Restore Backup</h3>
                <p className="text-slate-400 mb-8 text-sm">Warning: This will replace your current workspace layout.</p>
                <label className="block w-full text-center bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all cursor-pointer">
                  Upload File
                  <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
