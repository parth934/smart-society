import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit, Trash2, Loader2, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AdminAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', timings: '6:00 AM - 10:00 PM', status: 'Available'
  });

  // Fetch Amenities on load
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get('https://smart-society-rr5e.onrender.com/api/amenities');
        setAmenities(response.data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAmenities();
  }, []);

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE
        const response = await axios.put(`https://smart-society-rr5e.onrender.com/api/amenities/${editingId}`, formData);
        setAmenities(amenities.map(a => a._id === editingId ? response.data : a));
      } else {
        // CREATE
        const response = await axios.post('https://smart-society-rr5e.onrender.com/api/amenities', formData);
        setAmenities([...amenities, response.data]);
      }
      closeModal();
    } catch (error) {
      alert("Failed to save amenity.");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this amenity?")) {
      try {
        await axios.delete(`https://smart-society-rr5e.onrender.com/api/amenities/${id}`);
        setAmenities(amenities.filter(a => a._id !== id));
      } catch (error) {
        alert("Failed to delete amenity.");
      }
    }
  };

  // Modal Handlers
  const openAddModal = () => {
    setFormData({ name: '', description: '', timings: '6:00 AM - 10:00 PM', status: 'Available' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (amenity) => {
    setFormData(amenity);
    setEditingId(amenity._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Building2 size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Amenities</h1>
            <p className="text-slate-500 text-sm mt-1">Create and update society facilities for residents.</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Add Facility
        </button>
      </div>

      {/* AMENITIES GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-purple-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.length > 0 ? amenities.map((amenity) => (
            <div key={amenity._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
              
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-slate-800">{amenity.name}</h2>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${
                    amenity.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {amenity.status === 'Available' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                    {amenity.status}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{amenity.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Clock size={16} className="text-purple-500"/>
                  <span className="font-medium">{amenity.timings}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => openEditModal(amenity)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-lg text-sm font-bold transition-all"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(amenity._id)}
                  className="flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          )) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              No amenities created yet. Click "Add Facility" to start!
            </div>
          )}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Facility' : 'Add New Facility'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amenity Name *</label>
                <input 
                  type="text" required placeholder="e.g. Swimming Pool, Gym"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea 
                  required rows="2" placeholder="Brief description of the facility..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Operating Hours</label>
                  <input 
                    type="text" placeholder="e.g. 6 AM - 10 PM"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                    value={formData.timings} onChange={(e) => setFormData({...formData, timings: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none bg-white"
                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                  {editingId ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAmenities;