import React, { useState } from 'react';
import type { FileNode } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  onClose: () => void;
  onFileSelect: (path: string, name: string) => void;
}

const FileExplorerItem = ({
  node,
  depth = 0,
  parentPath = "",
  onFileSelect
}: {
  node: FileNode;
  depth?: number;
  parentPath?: string;
  onFileSelect: (path: string, name: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;

  return (
    <div className="select-none">
      <div
        onClick={() => {
          if (node.type === 'directory') {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(fullPath, node.name);
          }
        }}
        className={`group flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
      >
        <span className="text-slate-500">
          {node.type === 'directory' ? (
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        </span>
        <span className={`text-sm ${node.type === 'directory' ? 'text-blue-300 font-medium' : 'text-slate-300'}`}>
          {node.name}
        </span>
        {node.type === 'file' && (
          <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {(node.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      {isOpen && node.type === 'directory' && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          {hasChildren ? (
            node.children!.map((child, idx) => (
              <FileExplorerItem key={idx} node={child} depth={depth + 1} parentPath={fullPath} onFileSelect={onFileSelect} />
            ))
          ) : (
            <div
              className="text-[10px] py-1 text-slate-500 italic"
              style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem` }}
            >
              (empty or beyond exploration depth)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onClose, onFileSelect }) => {
  return (
    <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000 mt-12">
      <div className="bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-transparent px-10 py-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </span>
          Visual File Explorer
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar bg-black/40">
        <div className="space-y-1">
          {files.map((node, idx) => (
            <FileExplorerItem key={idx} node={node} onFileSelect={onFileSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
