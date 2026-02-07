import React, { useState } from 'react';

interface LayerInfo {
  CreatedBy: string;
  Size: number;
}

interface DockerMetadata {
  image_id: string;
  author?: string;
  os: string;
  architecture: string;
  size: number;
  user?: string;
  exposed_ports?: string[];
  env_vars?: string[];
  history: LayerInfo[];
}

interface AnalysisResponse {
  image: string;
  metadata: DockerMetadata;
  recommendations: string;
}

interface DockerfileResponse {
  dockerfile: string;
}

const App: React.FC = () => {
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Dockerfile Generation State
  const [loadingDockerfile, setLoadingDockerfile] = useState(false);
  const [dockerfileContent, setDockerfileContent] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageName) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setDockerfileContent(null); // Reset dockerfile on new analysis
    setShowAllHistory(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_name: imageName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze image');
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDockerfile = async () => {
    if (!result) return;

    setLoadingDockerfile(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-dockerfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_name: result.image }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Dockerfile');
      }

      const data: DockerfileResponse = await response.json();
      setDockerfileContent(data.dockerfile);
    } catch (err: any) {
      alert("Error generating Dockerfile: " + err.message);
    } finally {
      setLoadingDockerfile(false);
    }
  };

  const historyDisplayCount = showAllHistory ? result?.metadata.history.length : 3;

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

        <section className="mb-20">
          <div className="glass-card p-10 max-w-3xl mx-auto glass-card-hover group">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="Enter image name: e.g. redis:alpine"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${loading
                  ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                  : 'bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/5'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing
                  </span>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </form>
            {error && <p className="mt-4 text-red-500 text-sm font-semibold flex items-center gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
              {error}
            </p>}
          </div>
        </section>

        {result && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Stats / Metadata Section */}
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
                  {result.metadata.history.slice(0, historyDisplayCount).map((layer, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-white/10 pb-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-purple-500" />
                      <p className="text-[10px] font-mono text-slate-300 truncate opacity-70 mb-1">{layer.CreatedBy}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{(layer.Size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-[10px] font-bold tracking-widest uppercase text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    {showAllHistory ? 'Show Less ▴' : `Show Layers (${result.metadata.history.length}) ▾`}
                  </button>

                  {/* Generate Dockerfile Button within the card context */}
                  <button
                    onClick={handleGenerateDockerfile}
                    disabled={loadingDockerfile}
                    className="text-[10px] font-bold tracking-widest uppercase text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    {loadingDockerfile ? 'Generating... ⏳' : 'Build Dockerfile ⚡'}
                  </button>
                </div>
              </div>
            </div>

            {/* Reconstructed Dockerfile Section (Conditionally Rendered) */}
            {dockerfileContent && (
              <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-gradient-to-r from-indigo-600/20 via-blue-600/20 to-transparent px-10 py-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </span>
                    Reconstructed Dockerfile
                  </h2>
                  <button
                    onClick={() => { navigator.clipboard.writeText(dockerfileContent); alert("Copied!") }}
                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-slate-300"
                  >
                    Copy Code
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <pre className="p-6 text-sm font-mono text-blue-100 bg-black/30 leading-relaxed custom-scrollbar">
                    <code>{dockerfileContent}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* AI Insights Section */}
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-transparent px-10 py-8 border-b border-white/10">
                <h2 className="text-2xl font-black flex items-center gap-4 text-white">
                  <span className="flex items-center justify-center bg-white text-black w-10 h-10 rounded-2xl shadow-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" /></svg>
                  </span>
                  AI Security Intelligence
                </h2>
              </div>
              <div className="p-10">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-lg font-light antialiased">
                    {result.recommendations.split('\n').map((line, i) => {
                      if (line.startsWith('###')) return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-white">{line.replace('###', '')}</h3>;
                      if (line.startsWith('##')) return <h2 key={i} className="text-2xl font-bold mt-10 mb-6 text-white border-b border-white/10 pb-2">{line.replace('##', '')}</h2>;
                      return <p key={i} className="mb-4">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-12 text-center text-slate-600 text-sm font-medium">
        Built for Security Experts & DevOps Engineers who love Harry Potter, Stranger Things, cats and AI
      </footer>
    </div>
  );
};

export default App;
