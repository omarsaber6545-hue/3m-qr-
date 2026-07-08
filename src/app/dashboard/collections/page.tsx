'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  FolderHeart, Plus, Trash2, FolderOpen, Loader2, X 
} from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Create collection modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects/collections');
      setCollections(response.data || []);
    } catch (e) {
      console.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      const response = await api.post('/projects/collections', { name, description });
      setCollections((prev) => [...prev, { ...response.data, _count: { projects: 0 } }]);
      setName('');
      setDescription('');
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collection? Projects in it will not be deleted.')) return;
    try {
      await api.delete(`/projects/collections/${id}`);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-purple-500" /> Collections
          </h1>
          <p className="text-xs text-gray-500 mt-1">Organize your QR artworks in folders.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition flex items-center gap-2 glow-btn"
        >
          <Plus className="w-4 h-4" /> Create Collection
        </button>
      </div>

      {/* LISTING OR EMPTY STATE */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl bg-white/5 border border-white/5 text-center text-gray-500 max-w-md mx-auto">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="font-bold text-gray-400 text-base">No collections created</h3>
          <p className="text-xs mt-1">Create dynamic folders to group your different branding campaigns.</p>
          <button 
            onClick={() => setModalOpen(true)}
            className="mt-6 px-6 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((coll) => (
            <div
              key={coll.id}
              className="glass-panel border border-white/5 rounded-2xl p-6 bg-white/5 hover:border-purple-500/30 transition duration-300 flex flex-col justify-between group h-44"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shadow-inner shrink-0">
                    <FolderHeart className="w-5 h-5 text-purple-400" />
                  </div>
                  <button 
                    onClick={(e) => handleDeleteCollection(coll.id, e)}
                    className="p-1.5 rounded-lg hover:bg-red-950/20 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-base text-gray-200 truncate group-hover:text-purple-400 transition">{coll.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{coll.description || 'No description'}</p>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider border-t border-white/5 pt-3">
                {coll._count?.projects || 0} QR projects
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 bg-[#06060c] border border-white/10 relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Create New Collection</h2>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Collection Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Campaign" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. QRs for summer landing promotions" 
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4 glow-btn"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
