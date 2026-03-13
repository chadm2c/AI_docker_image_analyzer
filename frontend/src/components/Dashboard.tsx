import React from 'react';
import type { AnalysisResponse } from '../types';

export const Dashboard: React.FC<{ result: AnalysisResponse }> = ({ result }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="glass-card p-8 glass-card-hover">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs">Image Identity</h3>
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-slate-500 text-xs mb-1">REPOSITORY:TAG</p>
            <p className="text-lg font-bold text-white break-all">{result.image}</p>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="text-slate-500 text-xs mb-1">PLATFORM</p>
              <p className="font-bold text-white">{result.metadata.os}/{result.metadata.architecture}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">SIZE</p>
              <p className="font-bold text-white">{(result.metadata.size / 1024 / 1024).toFixed(1)} <span className="text-slate-500 font-normal">MB</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 glass-card-hover">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs">Runtime Security</h3>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-0.382-3.016z" /></svg>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-slate-500 text-xs mb-1">USER CONTEXT</p>
            <div className="flex items-center gap-2">
              <p className={`font-bold ${result.metadata.user ? 'text-white' : 'text-orange-400'}`}>
                {result.metadata.user || 'Root (Insecure)'}
              </p>
              {!result.metadata.user && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">EXPOSED NETWORK PORTS</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.metadata.exposed_ports?.length ? result.metadata.exposed_ports.map(p => (
                <span key={p} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm font-mono text-blue-300">{p}</span>
              )) : <span className="text-slate-500 italic">None</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 glass-card-hover flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xs">Layer History</h3>
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
          {result.metadata.history.slice(0, 3).map((layer, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-white/10 pb-4 last:pb-0">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-purple-500" />
              <p className="text-[10px] font-mono text-slate-300 truncate opacity-70 mb-1">{layer.CreatedBy}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{(layer.Size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
