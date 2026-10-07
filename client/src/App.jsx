import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Download, Plus, Laptop, Terminal, 
  Briefcase, Palette, Shield, X, ExternalLink, 
  BarChart3, Trash2, ArrowLeft, Lock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/software';
const CATEGORIES = ['All', 'Development', 'Office', 'Design', 'Utilities', 'Security'];
const SECRET_PIN = 'admin123'; // Aap apna pasandeeda secret code yahan set kar sakte hain

export default function App() {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Stealth Admin States
  const [isAdminView, setIsAdminView] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    version: '1.0.0',
    os: 'Windows 64-bit',
    fileSize: '',
    driveUrl: '',
    instructions: '1. Download setup. 2. Run as administrator. 3. Follow default prompts.'
  });

  // Secret Shortcut Listener: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminView) {
          setIsAdminView(false); // agar pehle se admin mein hai toh wapas normal user ban jaye
        } else {
          setShowPinModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminView]);

  // Fetch Softwares
  const fetchSoftwares = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE, {
        params: {
          category: activeCategory,
          search: search
        }
      });
      setSoftwares(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, [activeCategory, search]);

  // Handle Download Tracking
  const handleDownload = async (software) => {
    try {
      await axios.post(`${API_BASE}/${software._id}/download`);
      window.open(software.directDownloadUrl || software.driveUrl, '_blank');
      setSoftwares((prev) =>
        prev.map((s) => s._id === software._id ? { ...s, downloadCount: (s.downloadCount || 0) + 1 } : s)
      );
    } catch (err) {
      window.open(software.directDownloadUrl || software.driveUrl, '_blank');
    }
  };

  // Admin: Delete Software
  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap waqai is software ko catalog se delete karna chahte hain?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchSoftwares();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Handle PIN verification
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === SECRET_PIN) {
      setIsAdminView(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid Secret Key');
    }
  };

  // Add Software Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE, formData);
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Development',
        version: '1.0.0',
        os: 'Windows 64-bit',
        fileSize: '',
        driveUrl: '',
        instructions: ''
      });
      fetchSoftwares();
    } catch (err) {
      alert('Error adding software: ' + (err.response?.data?.error || err.message));
    }
  };

  // Total Analytics
  const totalDownloads = softwares.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const mostDownloaded = softwares.length > 0 
    ? [...softwares].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))[0] 
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Organization App Hub</h1>
              <p className="text-[11px] text-slate-400">Verified Workstation Software</p>
            </div>
          </div>

          {/* Admin Mode Badge (Sirf tab dikhega jab secret key se admin login hoga) */}
          {isAdminView && (
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono font-medium">
                Admin Session Active
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Software</span>
              </button>
              <button
                onClick={() => setIsAdminView(false)}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Admin Secret Analytics Overview (Sirf admin ko nazar aayega) */}
        {isAdminView && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Total Softwares Listed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{softwares.length}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Total Downloads Handled</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{totalDownloads}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs text-slate-400">Most Downloaded App</p>
              <h3 className="text-lg font-bold text-indigo-400 mt-1 truncate">
                {mostDownloaded ? `${mostDownloaded.title} (${mostDownloaded.downloadCount || 0})` : 'N/A'}
              </h3>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search software..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Softwares Grid */}
        {loading ? (
          <div className="text-center py-24 text-slate-500 text-sm">Loading applications...</div>
        ) : softwares.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">No software found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {softwares.map((sw) => (
              <div 
                key={sw._id} 
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md">
                      {sw.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">v{sw.version}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-3">{sw.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sw.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{sw.os}</span>
                    {sw.fileSize && (
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{sw.fileSize}</span>
                    )}
                    {isAdminView && (
                      <span className="bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50 font-medium">
                        {sw.downloadCount || 0} Downloads
                      </span>
                    )}
                  </div>

                  {sw.instructions && (
                    <div className="mt-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Install Guide</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sw.instructions}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  {isAdminView ? (
                    <button
                      onClick={() => handleDelete(sw._id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Verified by IT</span>
                  )}

                  <button
                    onClick={() => handleDownload(sw)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Secret PIN Entry Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xs rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-indigo-400 mb-3">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Administrator Access</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Enter management passkey to proceed.</p>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="Enter PIN"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              {pinError && <p className="text-[11px] text-rose-400 text-center">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Software */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-100">Add Software to Catalog</h2>
            <p className="text-xs text-slate-400 mb-4">Paste Google Drive link for direct employee download.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Software Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Visual Studio Code, Slack"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Platform OS</label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">File Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 120 MB"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Google Drive Share Link</label>
                <input
                  required
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Short Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What is this software used for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Installation Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Run setup as admin, tick Add to PATH"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Publish Software
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}