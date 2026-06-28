import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, Plus, X, Loader2, Clock, CheckCircle } from 'lucide-react';

const ResidentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', category: 'Maintenance', description: ''
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://https://smart-society-rr5e.onrender.com/api/complaints');
        const myComplaints = response.data.filter(c => c.residentEmail === user.email);
        setComplaints(myComplaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [user.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // BACK TO THE ORIGINAL VARIABLES THAT THE DATABASE LIKES!
    const newComplaint = {
      id: `#C-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      residentName: user.name,
      residentEmail: user.email,
      flat: user.flat,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Open' 
    };

    try {
      const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/complaints', newComplaint);
      setComplaints([response.data, ...complaints]); 
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Maintenance', description: '' });
    } catch (error) {
      console.error("Error logging complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-slate-500 mt-1">Raise and track your maintenance requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Raise Complaint
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
              You haven't raised any complaints yet.
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-500">{complaint.id}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{complaint.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{complaint.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{complaint.description}</p>
                  <p className="text-xs text-slate-400 mt-2">Logged on: {complaint.date}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 w-max capitalize ${
                    complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                    complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {complaint.status === 'Resolved' ? <CheckCircle size={16} /> : 
                     complaint.status === 'In Progress' ? <Loader2 size={16} className="animate-spin" /> : 
                     <AlertCircle size={16} />}
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Raise a Complaint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" required placeholder="e.g. Leaking Tap in Kitchen" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option>Maintenance</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Cleanliness</option>
                  <option>Security</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows="3" required placeholder="Please describe the issue..." className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Submit Complaint</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentComplaints;