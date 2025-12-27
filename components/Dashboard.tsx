
import React, { useState } from 'react';
import { Session } from '../types';
import SessionCard from './SessionCard';

interface DashboardProps {
  sessions: Session[];
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onDeleteSession, onRenameSession }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Workspace Dashboard</h2>
          <p className="text-slate-500 mt-1">Organize your tab sessions and reclaim your focus.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search sessions or tags..." 
              className="bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 w-full md:w-72 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            New Session
          </button>
        </div>
      </header>

      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSessions.map(session => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onDelete={onDeleteSession}
              onRename={onRenameSession}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <i className="fas fa-layer-group text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800">No sessions found</h3>
          <p className="text-slate-500 mt-2 text-center max-w-sm">
            Try searching for something else or create a new session to start managing your workflow.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
