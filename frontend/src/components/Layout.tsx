import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen text-slate-200 selection:bg-blue-500/30">
      {/* Background Blobs Inspired by Dribbble Design */}
      <div className="premium-blur-blob bg-blue-600 w-[500px] h-[500px] top-[-10%] left-[-10%]" />
      <div className="premium-blur-blob bg-purple-600 w-[600px] h-[600px] bottom-[-10%] right-[-10%]" />
      <div className="premium-blur-blob bg-indigo-500 w-[400px] h-[400px] top-[40%] left-[60%]" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <header className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-blue-400">
            Secure Infrastructure
          </div>
          <h1 className="text-6xl font-black mb-6 premium-gradient-text tracking-tight">
            Docker Guardian
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Intelligent analysis for your container images. Uncover metadata,
            detect risks, and implement hardening with AI.
          </p>
        </header>

        {children}
      </div>

      <footer className="py-12 text-center text-slate-600 text-sm font-medium relative z-10">
        Built for Security Experts & DevOps Engineers who love Harry Potter, Stranger Things, cats and AI
      </footer>
    </div>
  );
};
