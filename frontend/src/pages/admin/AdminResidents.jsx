import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable'; 
import Modal from '../../components/common/Modal'; 

const AdminResidents = () => {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: 'password123', flat: '', role: 'resident'
  });

  // --- 1. FETCH FROM MONGODB ---
  const loadResidents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://https://smart-society-rr5e.onrender.com/api/users');
      setResidents(response.data.filter(u => u.role === 'resident'));
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadResidents(); }, []);

  // --- 2. CREATE & UPDATE (Save to MongoDB) ---
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    // Duplicate Flat Validation
    const isFlatTaken = residents.some(
      (res) => res.flat?.toUpperCase() === formData.flat.toUpperCase() && res._id !== editingId
    );

    if (isFlatTaken) {
      setFormError(`Flat ${formData.flat.toUpperCase()} is already occupied!`);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        // UPDATE existing user
        const response = await axios.put(`http://https://smart-society-rr5e.onrender.com/api/users/${editingId}`, formData);
        setResidents(residents.map(r => r._id === editingId ? response.data : r));
      } else {
        // CREATE new user
        const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/users/register', {
          ...formData, flat: formData.flat.toUpperCase()
        });
        setResidents([response.data.user, ...residents]);
      }
      closeModal();
    } catch (error) {
      setFormError(error.response?.data?.error || "Failed to save resident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. DELETE FROM MONGODB ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`🚨 Are you sure you want to permanently remove ${name}?`)) {
      try {
        await axios.delete(`http://https://smart-society-rr5e.onrender.com/api/users/${id}`);
        setResidents(residents.filter(r => r._id !== id));
      } catch (error) {
        alert("Failed to delete resident.");
      }
    }
  };

  // --- MODAL CONTROLS ---
  const openEditModal = (resident) => {
    setEditingId(resident._id); // MongoDB uses _id
    setFormData({ 
      name: resident.name, email: resident.email, 
      flat: resident.flat || '', role: 'resident' 
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError('');
    setFormData({ name: '', email: '', password: 'password123', flat: '', role: 'resident' });
  };

  // --- DATATABLE COLUMNS ---
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Flat No.', 
      accessor: 'flat', 
      render: (row) => row.flat ? (
        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200 uppercase">
          {row.flat}
        </span>
      ) : <span className="text-slate-400">N/A</span> 
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row._id, row.name)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resident Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage society members and flats.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm font-medium transition-colors"
        >
          <Plus size={18} /> Add Resident
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <DataTable columns={columns} data={residents} />
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Resident Details" : "Add New Resident"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} /> {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login ID)</label>
            <input 
              type="email" required 
              disabled={editingId !== null} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flat Number</label>
              <input type="text" required placeholder="e.g. A-101" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none uppercase" value={formData.flat} onChange={(e) => setFormData({...formData, flat: e.target.value})} />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (editingId ? 'Update Resident' : 'Save Resident')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminResidents;