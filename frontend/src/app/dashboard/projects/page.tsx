'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  History, Search, Heart, Trash2, Download, ExternalLink, 
  Sparkles, Calendar, Info, X, Eye
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  
  // Selected project details modal
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [search, isFavorite]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const favParam = isFavorite !== null ? `&isFavorite=${isFavorite}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await api.get(`/projects?limit=50${favParam}${searchParam}`);
      setProjects(response.data.projects || []);
      setTotal(response.data.total || 0);
    } catch (e) {
      console.error('Failed to load projects history');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/projects/${id}/favorite`);
      // Update local state
      setProjects((prev) => 
        prev.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
      );
      if (selectedProject?.id === id) {
        setSelectedProject((prev: any) => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
    } catch (err) {
      console.error('Failed to toggle favorite');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setSelectedProject(null);
    } catch (err) {
      console.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <History className="w-6 h-6 text-purple-500" /> Recent Projects
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage and download your generated designs.</p>
        </div>

        {/* FILTERS BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project name..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 h-11 text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-64 transition"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 h-11">
            <button
              onClick={() => setIsFavorite(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isFavorite === null ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setIsFavorite(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${isFavorite === true ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> Favorites
            </button>
          </div>
        </div>
      </div>

      {/* GRID LOGIC */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl bg-white/5 border border-white/5 text-center text-gray-500 max-w-md mx-auto">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="font-bold text-gray-400 text-base">No projects found</h3>
          <p className="text-xs mt-1">Start generating standard and AI styled codes inside the Studio sandbox.</p>
          <a href="/dashboard/studio" className="mt-6 inline-flex px-6 h-10 items-center rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white transition">
            Go to Studio
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="glass-panel border border-white/5 rounded-2xl overflow-hidden bg-white/5 group hover:border-purple-500/30 transition duration-300 cursor-pointer"
            >
              {/* IMAGE HOVER FRAME */}
              <div className="aspect-square bg-gray-950 overflow-hidden relative flex items-center justify-center">
                <img 
                  src={proj.generatedQrUrl || proj.originalQrUrl} 
                  alt={proj.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => handleToggleFavorite(proj.id, e)}
                    className="w-9 h-9 rounded-full bg-[#030307]/80 hover:bg-[#030307] flex items-center justify-center border border-white/10 transition"
                  >
                    <Heart className={`w-4 h-4 ${proj.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="w-9 h-9 rounded-full bg-red-950/80 hover:bg-red-900 flex items-center justify-center border border-red-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                {proj.prompt && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-purple-600 text-[8px] font-bold uppercase tracking-wider text-white flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" /> AI Styled
                  </div>
                )}
              </div>

              {/* CARD DETAILS */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm text-gray-200 truncate group-hover:text-purple-400 transition">{proj.name}</h3>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">{proj.qrType}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                  {proj.status === 'FAILED' && <span className="text-red-400 font-bold uppercase">FAILED</span>}
                  {proj.status === 'GENERATING' && <span className="text-purple-400 font-bold uppercase animate-pulse">STYLING</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden bg-[#06060c] border border-white/10 flex flex-col md:flex-row relative">
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {/* IMAGE PREVIEW PANEL */}
            <div className="md:w-1/2 bg-gray-950 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
              <div className="w-72 h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                <img 
                  src={selectedProject.generatedQrUrl || selectedProject.originalQrUrl} 
                  alt={selectedProject.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* METRICS & CONTROLS PANEL */}
            <div className="md:w-1/2 p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">{selectedProject.qrType} Code</span>
                  <h2 className="text-xl font-bold mt-1 text-white leading-tight">{selectedProject.name}</h2>
                </div>

                {selectedProject.prompt && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Prompt</span>
                    <p className="text-xs bg-white/5 p-3 rounded-lg border border-white/5 text-gray-300 italic">{selectedProject.prompt}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Scannable redirect</span>
                    <a 
                      href={`http://localhost:5000/scan/${selectedProject.id}`} 
                      target="_blank" 
                      className="text-purple-400 hover:underline truncate block mt-1.5 flex items-center gap-1"
                    >
                      scan/{selectedProject.id.slice(0, 6)} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Created At</span>
                    <span className="block font-semibold mt-1 text-gray-300">{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedProject.generatedQrUrl || selectedProject.originalQrUrl;
                    link.download = `${selectedProject.name}.png`;
                    link.click();
                  }}
                  className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={(e) => handleToggleFavorite(selectedProject.id, e)}
                  className="px-3 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                >
                  <Heart className={`w-4.5 h-4.5 ${selectedProject.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
