import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, CheckCircle, Trash2, Loader2 } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('https://smart-society-rr5e.onrender.com/api/complaints');
        const sortedComplaints = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComplaints(sortedComplaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`https://smart-society-rr5e.onrender.com/api/complaints/${id}`, {
        status: newStatus
      });
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await axios.delete(`https://smart-society-rr5e.onrender.com/api/complaints/${id}`);
        setComplaints(complaints.filter(c => c._id !== id));
      } catch (error) {
        alert("Failed to delete complaint.");
      }
    }
  };

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={14} /> Resolved</span>;
      case 'in progress':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={14} /> In Progress</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200"><AlertCircle size={14} /> Open</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
          <AlertCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Complaints</h1>
          <p className="text-slate-500 text-sm">Review and resolve resident issues.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {complaints.length > 0 ? complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:border-blue-200 transition-colors">
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">{complaint.title}</h3>
                  {renderStatusBadge(complaint.status)}
                </div>
                <p className="text-slate-600 text-sm">{complaint.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mt-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    Flat: {complaint.flat || 'N/A'}
                  </span>
                  <span>Posted by: {complaint.residentName || 'Resident'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <select 
                  value={complaint.status || 'Open'} 
                  onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                
                <button 
                  onClick={() => handleDelete(complaint._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Complaint"
                >
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          )) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Pending Complaints!</h3>
              <p className="text-slate-500">The society is running smoothly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;