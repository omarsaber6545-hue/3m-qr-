'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/utils/api';
import { 
  Settings, User, Key, Users, Check, Copy, RefreshCw, AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // API Key stubs
  const [apiKey, setApiKey] = useState<string>('qr_studio_live_55a29f8841d904b3cfc918e7e108ba5f');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Team workspace states
  const [teamName, setTeamName] = useState<string>('My Design Team');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<string[]>([
    'collaborator@company.com (Invited)',
    'designer@3mqrstudio.com (Editor)'
  ]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      // Stub endpoint updates
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMsg('Profile settings updated successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateKey = () => {
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substring(2, 10);
    setApiKey(`qr_studio_live_${timestamp}${random}`);
    setSuccessMsg('New API Key generated successfully.');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeamMembers((prev) => [...prev, `${inviteEmail} (Invited)`]);
    setInviteEmail('');
    setSuccessMsg(`Invitation email sent to ${inviteEmail}.`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-500" /> Account Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">Configure profile details, API integrations, and team workflows.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex gap-2 items-center">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* USER PROFILE UPDATES */}
      <div className="glass-panel p-8 rounded-2xl bg-white/5 border border-white/5 space-y-6">
        <h3 className="font-bold text-base text-gray-200 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" /> Profile Configurations
        </h3>

        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-40 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 mt-4 glow-btn"
          >
            {isSubmitting ? 'Updating...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* TEAM WORKSPACE SETTINGS */}
      <div className="glass-panel p-8 rounded-2xl bg-white/5 border border-white/5 space-y-6">
        <h3 className="font-bold text-base text-gray-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Team Workspaces
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team Name</label>
              <input 
                type="text" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <form onSubmit={handleInviteMember} className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Invite Member</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="designer@company.com" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button type="submit" className="px-4 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold transition">Invite</button>
              </div>
            </form>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Workspace Members</label>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 text-gray-300">
                <span>{user?.email} (You)</span>
                <span className="text-[10px] text-purple-400 font-bold uppercase">Owner</span>
              </li>
              {teamMembers.map((member, idx) => (
                <li key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 text-gray-400">
                  <span>{member}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* API KEYS CONFIGS */}
      <div className="glass-panel p-8 rounded-2xl bg-white/5 border border-white/5 space-y-6">
        <h3 className="font-bold text-base text-gray-200 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-400" /> API Access Keys
        </h3>

        <p className="text-xs text-gray-400">Generate authorization tokens to integrate 3M QR Studio directly into your workflows, web applications, or pipelines.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={apiKey} 
              readOnly
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 h-12 text-xs text-purple-400 font-mono focus:outline-none pr-12"
            />
            <button 
              onClick={handleCopyKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition"
              title="Copy to Clipboard"
            >
              {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button 
            onClick={handleGenerateKey}
            className="px-6 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-bold text-xs text-gray-200 hover:text-white flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Roll API Token
          </button>
        </div>
      </div>
    </div>
  );
}
