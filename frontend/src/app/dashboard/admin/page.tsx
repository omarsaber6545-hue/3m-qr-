'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, Users, History, CreditCard, BarChart2, Sparkles, 
  Terminal, Trash2, Edit2, Check, CheckCircle2, UserCheck, 
  Lock, Unlock, Shield, Loader2, Coins
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('stats');

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [latestLogs, setLatestLogs] = useState<any[]>([]);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Projects State
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Payments State
  const [paymentsList, setPaymentsList] = useState<any[]>([]);

  // Logs State
  const [logsList, setLogsList] = useState<any[]>([]);

  // Styles State
  const [stylesList, setStylesList] = useState<any[]>([]);
  const [newStyleName, setNewStyleName] = useState<string>('');
  const [newStylePrompt, setNewStylePrompt] = useState<string>('');
  const [newStylePreview, setNewStylePreview] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is Admin
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats);
      setLatestLogs(statsRes.data.latestLogs || []);
    } catch (e) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data.users || []);
      setTotalUsers(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects');
      setProjectsList(res.data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments');
      setPaymentsList(res.data.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStyles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/styles');
      setStylesList(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      setLogsList(res.data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'stats') loadStats();
    else if (tab === 'users') loadUsers();
    else if (tab === 'projects') loadProjects();
    else if (tab === 'payments') loadPayments();
    else if (tab === 'styles') loadStyles();
    else if (tab === 'logs') loadLogs();
  };

  // --- Actions ---

  const handleToggleBlockUser = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${id}/status`, { status: nextStatus });
      setUsersList((prev) => 
        prev.map((u) => u.id === id ? { ...u, status: nextStatus } : u)
      );
    } catch (e) {
      console.error('Failed to change user status');
    }
  };

  const handleToggleAdminRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${id}/role`, { role: nextRole });
      setUsersList((prev) => 
        prev.map((u) => u.id === id ? { ...u, role: nextRole } : u)
      );
    } catch (e) {
      console.error('Failed to change user role');
    }
  };

  const handleAddCredits = async (id: string, currentCredits: number) => {
    const amount = prompt('Enter new credits amount:', currentCredits.toString());
    if (amount === null || isNaN(parseInt(amount))) return;
    try {
      const newCredits = parseInt(amount, 10);
      await api.put(`/admin/users/${id}/credits`, { credits: newCredits });
      setUsersList((prev) => 
        prev.map((u) => u.id === id ? { ...u, credits: newCredits } : u)
      );
    } catch (e) {
      console.error('Failed to update credits');
    }
  };

  const handleCreateStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleName || !newStylePrompt) return;
    try {
      const res = await api.post('/admin/styles', {
        name: newStyleName,
        promptTemplate: newStylePrompt,
        previewUrl: newStylePreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      });
      setStylesList((prev) => [...prev, res.data]);
      setNewStyleName('');
      setNewStylePrompt('');
      setNewStylePreview('');
    } catch (err) {
      console.error('Failed to create style');
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this style preset?')) return;
    try {
      await api.delete(`/admin/styles/${id}`);
      setStylesList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete style');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2 text-red-500">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" /> Admin Panel
        </h1>
        <p className="text-xs text-gray-500 mt-1">Platform-wide statistics, payment audits, users control, and logs.</p>
      </div>

      {/* TABS CONTROLS BAR */}
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {[
          { id: 'stats', label: 'Stats & Queue', icon: BarChart2 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'projects', label: 'Projects', icon: History },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'styles', label: 'AI Presets', icon: Sparkles },
          { id: 'logs', label: 'System Logs', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition
                ${activeTab === tab.id ? 'bg-red-950/20 border border-red-500/30 text-red-400' : 'text-gray-400 hover:text-white'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT WINDOWS */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* STATS & QUEUE TAB */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              {/* CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Users</span>
                  <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total QRs Created</span>
                  <div className="text-3xl font-black text-white mt-1">{stats.totalProjects}</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Gross Revenue</span>
                  <div className="text-3xl font-black text-green-400 mt-1">${stats.totalRevenue}</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">AI Queue Status</span>
                  <div className="text-sm font-bold text-white mt-2 flex gap-2">
                    <span className="text-green-400">{stats.queue.active} active</span> |
                    <span className="text-purple-400">{stats.queue.waiting} waiting</span> |
                    <span className="text-red-400">{stats.queue.failed} failed</span>
                  </div>
                </div>
              </div>

              {/* RECENT SYSTEM LOGS PREVIEW */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-200">Recent Server Traces</h3>
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl font-mono text-[10px] space-y-2 max-h-[300px] overflow-y-auto">
                  {latestLogs.map((log) => (
                    <div key={log.id} className="text-gray-400 flex gap-2">
                      <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-500' : 'text-gray-500'}`}>[{log.level}]</span>
                      <span className="text-gray-600">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                      <span className="text-purple-400">[{log.context}]</span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-white/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 border-b border-white/5 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Name / Email</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="border-b border-white/5 text-gray-300">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white">{usr.name || 'No Name'}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{usr.email}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">{usr.subscriptionPlan}</td>
                      <td className="px-6 py-4 font-semibold">{usr.credits}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${usr.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-gray-400'}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={usr.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>{usr.status}</span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button 
                          onClick={() => handleAddCredits(usr.id, usr.credits)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Add Credits"
                        >
                          <Coins className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleToggleAdminRole(usr.id, usr.role)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Toggle Admin Privilege"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleToggleBlockUser(usr.id, usr.status)}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title={usr.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                        >
                          {usr.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Unlock className="w-3.5 h-3.5 text-green-400" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-white/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 border-b border-white/5 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Project ID / Owner</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Prompt</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsList.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 text-gray-300">
                      <td className="px-6 py-4">
                        <span className="block font-mono text-[10px] text-gray-400">{p.id.slice(0, 10)}...</span>
                        <span className="text-[10px] text-gray-500">{p.user?.email || 'Unknown User'}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">{p.qrType}</td>
                      <td className="px-6 py-4 truncate max-w-xs">{p.prompt || 'Standard QR'}</td>
                      <td className="px-6 py-4 font-bold uppercase text-[10px]">
                        <span className={p.status === 'COMPLETED' ? 'text-green-400' : p.status === 'FAILED' ? 'text-red-400' : 'text-purple-400 animate-pulse'}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={p.generatedQrUrl || p.originalQrUrl} 
                          target="_blank" 
                          className="text-purple-400 hover:underline"
                        >
                          View Image
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-white/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 border-b border-white/5 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Stripe Session / User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 text-gray-300">
                      <td className="px-6 py-4">
                        <span className="block font-mono text-gray-400 text-[10px]">{p.stripeSessionId.slice(0, 20)}...</span>
                        <span className="text-[10px] text-gray-500">{p.user?.email}</span>
                      </td>
                      <td className="px-6 py-4 font-bold uppercase">{p.type}</td>
                      <td className="px-6 py-4 text-green-400 font-bold">${p.amount}</td>
                      <td className="px-6 py-4 font-bold text-green-400 uppercase">{p.status}</td>
                      <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI STYLES PRESETS TAB */}
          {activeTab === 'styles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CREATE PANEL */}
              <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5 h-fit space-y-4">
                <h3 className="font-bold text-sm text-white">Create Preset Style</h3>
                <form onSubmit={handleCreateStyle} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Style Name</label>
                    <input 
                      type="text" 
                      value={newStyleName}
                      onChange={(e) => setNewStyleName(e.target.value)}
                      placeholder="e.g. Dreamy Cyberpunk"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Prompt Template</label>
                    <textarea 
                      value={newStylePrompt}
                      onChange={(e) => setNewStylePrompt(e.target.value)}
                      placeholder="e.g. Watercolor design style, soft mist, {prompt}"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Preview Image URL</label>
                    <input 
                      type="text" 
                      value={newStylePreview}
                      onChange={(e) => setNewStylePreview(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition">
                    Save Style Preset
                  </button>
                </form>
              </div>

              {/* LISTING GRID */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                {stylesList.map((style) => (
                  <div key={style.id} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden relative aspect-square group">
                    <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleDeleteStyle(style.id)}
                          className="p-1 rounded bg-black/40 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-white truncate">{style.name}</span>
                        <span className="block text-[8px] text-gray-400 truncate mt-0.5">{style.promptTemplate.slice(0, 30)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYSTEM LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-gray-200">System Activity Logs</h3>
              <div className="bg-black/50 border border-white/5 p-6 rounded-xl font-mono text-[10px] space-y-2 max-h-[500px] overflow-y-auto">
                {logsList.map((log) => (
                  <div key={log.id} className="text-gray-400 flex gap-2">
                    <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-500' : 'text-gray-500'}`}>[{log.level}]</span>
                    <span className="text-gray-600">[{new Date(log.createdAt).toLocaleString()}]</span>
                    <span className="text-purple-400">[{log.context}]</span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
