
import React, { useState } from 'react';
import { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(session.name);

  const handleRename = () => {
    onRename(session.id, editedName);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          {isEditing ? (
            <input
              autoFocus
              className="text-lg font-bold text-slate-800 border-b border-blue-500 outline-none w-full"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          ) : (
            <h3 
              className="text-lg font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {session.name}
            </h3>
          )}
          <p className="text-sm text-slate-400 mt-1">
            {new Date(session.createdAt).toLocaleDateString()} • {session.tabs.length} tabs
          </p>
        </div>
        <button 
          onClick={() => onDelete(session.id)}
          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {session.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {session.tabs.slice(0, 5).map(tab => (
          <div key={tab.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group/tab">
            <img 
              src={tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}&sz=32`} 
              className="w-4 h-4 rounded-sm flex-shrink-0"
              alt=""
            />
            <span className="text-sm text-slate-600 truncate flex-1">{tab.title}</span>
            <i className="fas fa-external-link-alt text-xs text-slate-300 group-hover/tab:text-blue-400"></i>
          </div>
        ))}
        {session.tabs.length > 5 && (
          <p className="text-xs text-slate-400 font-medium text-center pt-2">
            + {session.tabs.length - 5} more tabs
          </p>
        )}
      </div>

      <button className="w-full mt-5 bg-slate-900 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors">
        Restore Session
      </button>
    </div>
  );
};

export default SessionCard;
