import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { Bell, AlertTriangle, Info, Plus, Trash2, Loader2, X, Megaphone } from 'lucide-react';

const NoticeBoard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'General Notice'
  });

  // --- 1. FETCH NOTICES FROM MONGODB ---
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notices');
        setNotices(response.data);
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  // --- 2. CREATE NEW NOTICE (Admin Only) ---
  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const newNotice = {
      id: Math.floor(Math.random() * 1000000), // Generate a unique numeric ID
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    try {
      const response = await axios.post('http://localhost:5000/api/notices', newNotice);
      setNotices([response.data.data, ...notices]); // Add to top of the list
      setIsModalOpen(false);
      setFormData({ title: '', description: '', type: 'General Notice' });
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice.");
    }
  };

  // --- 3. DELETE NOTICE (Admin Only) ---
  const handleDelete = async (id) => {
    if (!isAdmin) return;
    
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        // Our backend expects the custom 'id' field
        await axios.delete(`http://localhost:5000/api/notices/${id}`);
        setNotices(notices.filter(n => n.id !== id));
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("Failed to delete notice.");
      }
    }
  };

  const getNoticeStyles = (type) => {
    switch(type) {
      case 'Alert': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertTriangle size={24} className="text-red-500" /> };
      case 'Important': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Bell size={24} className="text-amber-500" /> };
      default: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Info size={24} className="text-blue-500" /> };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" /> Society Notice Board
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with the latest announcements.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus size={18} /> Publish Notice
          </button>
        )}
      </div>

      {/* NOTICES LIST */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : notices.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
          No active notices at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const style = getNoticeStyles(notice.type);
            return (
              <div key={notice._id || notice.id} className={`p-6 rounded-2xl border ${style.border} ${style.bg} relative group transition-all hover:shadow-md`}>
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{style.icon}</div>
                  <div className="flex-grow pr-8">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-white ${style.text}`}>
                        {notice.type}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{notice.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{notice.title}</h3>
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">{notice.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NOTICE MODAL (Admin Only) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Publish New Notice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notice Title *</label>
                <input 
                  type="text" required placeholder="e.g. Water Supply Interruption"
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" 
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notice Type</label>
                <select 
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white" 
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="General Notice">General Notice</option>
                  <option value="Important">Important</option>
                  <option value="Alert">Alert (Red)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea 
                  rows="4" required placeholder="Type the announcement details here..."
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 resize-none" 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;