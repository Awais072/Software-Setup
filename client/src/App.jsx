import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Download, Trash2, Edit3, Plus, Shield, CheckCircle, 
  ExternalLink, HardDrive, Key, X, Monitor, Laptop, FileText 
} from 'lucide-react';

const API_BASE = '/api/software';

const CATEGORIES = ['All', 'Development', 'Office', 'Design', 'Utilities', 'Security'];

export default function App() {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Modal states for Add & Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSoftware, setSelectedSoftware] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    category: 'Development',
    version: '1.0.0',
    os: 'Windows 64-bit',
    fileSize: 'N/A',
    driveUrl: '',
    instructions: '1. Download setup. 2. Run as administrator. 3. Follow default prompts.'
  };
  const [formData, setFormData] = useState(initialForm);

  // Keyboard shortcut Ctrl + Alt + A for admin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (isAdmin) {
          setIsAdmin(false);
        } else {
          setShowAdminPinModal(true);
          setPinError('');
          setAdminPinInput('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const fetchSoftwares = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        params: {
          category: selectedCategory,
          search: searchQuery
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
  }, [selectedCategory, searchQuery]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (adminPinInput === 'admin123') {
      setIsAdmin(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid PIN code');
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Development',
      version: item.version || '',
      os: item.os || 'Windows 64-bit',
      fileSize: item.fileSize || '',
      driveUrl: item.driveUrl || '',
      instructions: item.instructions || ''
    });
    setShowAddModal(true);
  };

  const handleSaveSoftware = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Edit mode (PUT)
        await axios.put(`${API_BASE}/${editingId}`, formData);
      } else {
        // Add mode (POST)
        await axios.post(API_BASE, formData);
      }
      setShowAddModal(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchSoftwares();
    } catch (err) {
      alert(`Error saving software: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this software?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchSoftwares();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleDownload = async (software) => {
    try {
      await axios.post(`${API_BASE}/${software._id}/download`);
      window.open(software.directDownloadUrl || software.driveUrl, '_blank');
      fetchSoftwares();
    } catch (err) {
      console.error(err);
      window.open(software.driveUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Organization App Hub
                {isAdmin && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin Mode
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400">Verified Workstation Software</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Search software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Software
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading catalog...</div>
        ) : softwares.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No software found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {softwares.map(item => (
              <div 
                key={item._id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <h3 className="font-semibold text-slate-100 text-base">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                          v{item.version}
                        </span>
                        <span className="text-[11px] text-blue-400 font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="text-slate-400 hover:text-blue-400 p-1 rounded-md hover:bg-slate-800 transition"
                          title="Edit Software"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition"
                          title="Delete Software"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Platform</span>
                      <span className="text-slate-300">{item.os}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Size</span>
                      <span className="text-slate-300">{item.fileSize}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Downloads</span>
                      <span className="text-slate-300">{item.downloadCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <button 
                    onClick={() => handleDownload(item)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Direct Download
                  </button>
                  <button 
                    onClick={() => setSelectedSoftware(item)}
                    className="w-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" /> Install Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Admin PIN Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                <Key className="w-4 h-4 text-amber-400" /> Enter Admin PIN
              </h3>
              <button onClick={() => setShowAdminPinModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter secret PIN" 
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs transition"
              >
                Unlock Admin Mode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Software Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100 text-sm">
                {editingId ? 'Edit Software Details' : 'Add Software to Catalog'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSoftware} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Software Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Version</label>
                  <input 
                    type="text" 
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Platform OS</label>
                  <input 
                    type="text" 
                    value={formData.os}
                    onChange={(e) => setFormData({...formData, os: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">File Size</label>
                  <input 
                    type="text" 
                    value={formData.fileSize}
                    onChange={(e) => setFormData({...formData, fileSize: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Google Drive Share Link</label>
                <input 
                  type="url" 
                  required
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Short Description</label>
                <textarea 
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Installation Notes</label>
                <textarea 
                  rows="2"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition"
                >
                  {editingId ? 'Save Changes' : 'Publish Software'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes / Details Modal */}
      {selectedSoftware && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> {selectedSoftware.title} Notes
              </h3>
              <button onClick={() => setSelectedSoftware(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-4">
              {selectedSoftware.instructions}
            </div>
            <button 
              onClick={() => handleDownload(selectedSoftware)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}