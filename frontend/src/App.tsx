import React, { useState } from 'react';
import type { AnalysisResponse, DockerfileResponse, FileNode } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FileExplorer } from './components/FileExplorer';
import { ChatAssistant } from './components/ChatAssistant';
import { OptimizationWizard } from './components/OptimizationWizard';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const App: React.FC = () => {
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dockerfile Generation State
  const [loadingDockerfile, setLoadingDockerfile] = useState(false);
  const [dockerfileContent, setDockerfileContent] = useState<string | null>(null);

  // Optimization State
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // File Explorer State
  const [files, setFiles] = useState<FileNode[] | null>(null);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);

  // File Preview State
  const [selectedFile, setSelectedFile] = useState<{ path: string, name: string } | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [isBinary, setIsBinary] = useState(false);


  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageName) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setDockerfileContent(null);
    setOptimizationResult(null);
    setExplorerOpen(false);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
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
      const response = await fetch(`${API_URL}/generate-dockerfile`, {
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

  const handleOptimize = async () => {
    if (!result) return;
    setOptimizing(true);
    setOptimizationResult(null);
    try {
      const response = await fetch(`${API_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_name: result.image }),
      });

      if (!response.ok) {
        throw new Error('Failed to get optimization suggestions');
      }

      const data = await response.json();
      setOptimizationResult(data);
    } catch (err: any) {
      alert("Error during optimization analysis: " + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleFetchFiles = async () => {
    if (!result) return;
    setFetchingFiles(true);
    try {
      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_name: result.image }),
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
      setExplorerOpen(true);
    } catch (err: any) {
      alert("Error fetching files: " + err.message);
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleFetchFileContent = async (path: string, name: string) => {
    if (!result) return;
    setSelectedFile({ path, name });
    setFetchingContent(true);
    setFileContent(null);
    setIsBinary(false);

    try {
      const response = await fetch(`${API_URL}/file-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_name: result.image, file_path: path }),
      });

      if (!response.ok) throw new Error('Failed to fetch file content');
      const data = await response.json();
      setFileContent(data.content);
      setIsBinary(data.is_binary);
    } catch (err: any) {
      setFileContent("Error: " + err.message);
    } finally {
      setFetchingContent(false);
    }
  };

  return (
    <Layout>
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
          <Dashboard result={result} />
          
          <div className="flex justify-center gap-6">
            <button 
              onClick={handleFetchFiles} 
              disabled={fetchingFiles}
              className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all"
            >
              {fetchingFiles ? 'Searching...' : 'Explore Filesystem'}
            </button>
            <button 
              onClick={handleGenerateDockerfile}
              disabled={loadingDockerfile}
              className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-bold hover:bg-blue-500/20 transition-all"
            >
              {loadingDockerfile ? 'Generating...' : 'Reconstruct Dockerfile'}
            </button>
          </div>

          {explorerOpen && files && (
            <FileExplorer 
              files={files} 
              onClose={() => setExplorerOpen(false)} 
              onFileSelect={handleFetchFileContent}
            />
          )}

          <OptimizationWizard 
            optimizing={optimizing}
            optimizationResult={optimizationResult}
            onOptimize={handleOptimize}
            onReset={() => setOptimizationResult(null)}
          />

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
          
          <ChatAssistant imageName={result.image} />
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedFile.path}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-black/40 custom-scrollbar">
              {fetchingContent ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm font-medium animate-pulse">Extracting file content from container...</p>
                </div>
              ) : (
                <pre className={`text-sm font-mono leading-relaxed ${isBinary ? 'text-slate-500 italic flex items-center justify-center h-full' : 'text-blue-100'}`}>
                  <code>{fileContent}</code>
                </pre>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (fileContent) {
                    navigator.clipboard.writeText(fileContent);
                    alert("Copied to clipboard!");
                  }
                }}
                disabled={!fileContent || isBinary}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors disabled:opacity-50"
              >
                Copy Content
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
