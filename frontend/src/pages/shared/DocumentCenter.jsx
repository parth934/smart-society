import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FileText, Plus, Edit, Trash2, ExternalLink, Loader2, Search, Folder, FileBarChart, Scale, Users } from 'lucide-react';
import Modal from '../../components/common/Modal'; // Assuming you have this from the Amenities page!

const DocumentCenter = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'Rules & By-laws', fileUrl: '' });

  const categories = ['All', 'Rules & By-laws', 'Financial Reports', 'Meeting Minutes', 'Forms & Applications'];

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documents');
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // --- 2. SAVE (CREATE / UPDATE) ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await axios.put(`http://localhost:5000/api/documents/${editingId}`, formData);
        setDocuments(documents.map(d => d._id === editingId ? response.data : d));
      } else {
        const response = await axios.post('http://localhost:5000/api/documents', formData);
        setDocuments([response.data, ...documents]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save document.");
    }
  };

  // --- 3. DELETE ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document link?")) {
      try {
        await axios.delete(`http://localhost:5000/api/documents/${id}`);
        setDocuments(documents.filter(d => d._id !== id));
      } catch (error) {
        alert("Failed to delete document.");
      }
    }
  };

  // Helpers
  const openModal = (doc = null) => {
    if (doc) {
      setFormData({ title: doc.title, category: doc.category, fileUrl: doc.fileUrl });
      setEditingId(doc._id);
    } else {
      setFormData({ title: '', category: 'Rules & By-laws', fileUrl: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Rules & By-laws': return <Scale size={20} className="text-purple-500" />;
      case 'Financial Reports': return <FileBarChart size={20} className="text-emerald-500" />;
      case 'Meeting Minutes': return <Users size={20} className="text-amber-500" />;
      default: return <FileText size={20} className="text-blue-500" />;
    }
  };

  // Filter Logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Folder size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Society Documents</h1>
            <p className="text-slate-500 text-sm mt-1">Official records, forms, and financial reports.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none bg-slate-50"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap">
              <Plus size={18} /> Add Document
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors border ${
              selectedCategory === cat 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* DOCUMENT GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow group relative">
              
              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(doc)} className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(doc._id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {getCategoryIcon(doc.category)}
                </div>
                <div className="flex-1 pr-12"> {/* Padding to prevent text overlapping with admin buttons */}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{doc.category}</p>
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-500 mt-2">Added: {doc.dateAdded}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors text-sm"
                >
                  <ExternalLink size={16} /> Open Document
                </a>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              No documents found in this category.
            </div>
          )}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Document' : 'Add New Document'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Document Title *</label>
            <input type="text" required placeholder="e.g. AGM Meeting Minutes 2024" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="Rules & By-laws">Rules & By-laws</option>
              <option value="Financial Reports">Financial Reports</option>
              <option value="Meeting Minutes">Meeting Minutes</option>
              <option value="Forms & Applications">Forms & Applications</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Document Link (URL) *</label>
            <input type="url" required placeholder="https://drive.google.com/..." className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} />
            <p className="text-xs text-slate-500 mt-1">Paste a link to Google Drive, Dropbox, or a hosted PDF.</p>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors mt-2">
            {editingId ? 'Update Document' : 'Save Document'}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default DocumentCenter;