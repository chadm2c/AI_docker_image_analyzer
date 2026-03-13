import React from 'react';

interface OptimizationSuggestion {
  title: string;
  description: string;
  potential_savings: string;
}

interface OptimizationResult {
  suggestions: OptimizationSuggestion[];
  total_size: number;
  potential_total_savings: string;
}

interface OptimizationWizardProps {
  optimizing: boolean;
  optimizationResult: OptimizationResult | null;
  onOptimize: () => void;
  onReset: () => void;
}

export const OptimizationWizard: React.FC<OptimizationWizardProps> = ({
  optimizing,
  optimizationResult,
  onOptimize,
  onReset
}) => {
  return (
    <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000 mt-12">
      <div className="bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-transparent px-10 py-8 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-4 text-white">
          <span className="flex items-center justify-center bg-orange-500 text-white w-10 h-10 rounded-2xl shadow-lg shadow-orange-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          Optimization Wizard
        </h2>
        {!optimizationResult && (
          <button
            onClick={onOptimize}
            disabled={optimizing}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${optimizing ? 'bg-slate-800 text-slate-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
          >
            {optimizing ? 'Analyzing Layers...' : 'Run Optimization Scan'}
          </button>
        )}
      </div>

      <div className="p-10">
        {!optimizationResult ? (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4 font-light">Want to shrink your image? Our AI can find redundant layers and smaller base images.</p>
            <button
              onClick={onOptimize}
              disabled={optimizing}
              className="text-orange-400 font-bold tracking-widest uppercase text-xs hover:text-orange-300 transition-colors"
            >
              {optimizing ? 'Please wait...' : '→ Identify Potential Savings'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Potential Total Savings</p>
                <p className="text-3xl font-black text-orange-400">{optimizationResult.potential_total_savings}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Current Image Size</p>
                <p className="text-xl font-bold text-white">{(optimizationResult.total_size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optimizationResult.suggestions.map((s, i) => (
                <div key={i} className="p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-orange-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-white group-hover:text-orange-300 transition-colors">{s.title}</h4>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold whitespace-nowrap">
                      -{s.potential_savings}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 text-center">
              <button
                onClick={onReset}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Reset Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
