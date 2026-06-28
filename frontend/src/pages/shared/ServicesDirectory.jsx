import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Phone, User, Search, Plus, Trash2, X, Briefcase, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const ServicesDirectory = () => {
  const { user } = useAuth(); 
  const isAdmin = user?.role === 'admin'; 

  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Modal for new Category (Parent)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Inline form state for new Contact (Child)
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  // --- 1. FETCH SERVICES ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://https://smart-society-rr5e.onrender.com/api/services');
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  // --- 2. TOGGLE ACCORDION ---
  const toggleCategory = (id) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  // --- 3. PARENT CATEGORY ACTIONS (ADMIN ONLY) ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newCategoryName.trim()) return;

    try {
      const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/services', { category: newCategoryName });
      setServices([...services, response.data]);
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      // Auto-expand the newly created category
      setExpandedCategories(prev => [...prev, response.data._id]);
    } catch (error) {
      alert("Failed to add category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this entire category and ALL its contacts?")) {
      try {
        await axios.delete(`http://https://smart-society-rr5e.onrender.com/api/services/${id}`);
        setServices(services.filter(srv => srv._id !== id));
      } catch (error) {
        alert("Failed to delete category.");
      }
    }
  };

  // --- 4. CHILD CONTACT ACTIONS (ADMIN ONLY) ---
  const handleAddContact = async (e, categoryId) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const response = await axios.post(`http://https://smart-society-rr5e.onrender.com/api/services/${categoryId}/contacts`, newContact);
      setServices(services.map(srv => srv._id === categoryId ? response.data : srv));
      setActiveCategoryId(null);
      setNewContact({ name: '', phone: '' });
    } catch (error) {
      alert("Failed to add contact.");
    }
  };

  const handleDeleteContact = async (categoryId, contactId) => {
    if (!isAdmin) return;
    try {
      const response = await axios.delete(`http://https://smart-society-rr5e.onrender.com/api/services/${categoryId}/contacts/${contactId}`);
      setServices(services.map(srv => srv._id === categoryId ? response.data : srv));
    } catch (error) {
      alert("Failed to delete contact.");
    }
  };

  // --- SEARCH FILTER ---
  const filteredServices = services.filter(service => 
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Briefcase size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Local Services</h1>
            <p className="text-slate-500 text-sm mt-1">Directory of trusted society maintenance contacts.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search categories or names..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={18} /> New Category
            </button>
          )}
        </div>
      </div>

      {/* DIRECTORY GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              // Smart trick: auto-expand if typing in search bar!
              const isExpanded = expandedCategories.includes(service._id) || searchTerm.length > 0;

              return (
                <div key={service._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  
                  {/* PARENT CARD HEADER (Now Clickable!) */}
                  <div 
                    onClick={() => toggleCategory(service._id)}
                    className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <h2 className="text-lg font-bold text-slate-800">{service.category}</h2>
                    
                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); // Stops the card from expanding when clicking delete!
                            handleDeleteCategory(service._id); 
                          }} 
                          className="text-slate-400 hover:text-red-500 transition-colors" 
                          title="Delete Category"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      
                      {/* Dropdown chevron arrows */}
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* CHILD CONTACTS LIST (Hidden if not expanded) */}
                  {isExpanded && (
                    <>
                      <div className="p-4 space-y-3 bg-white">
                        {service.contacts.length === 0 ? (
                          <p className="text-sm text-slate-400 italic text-center py-4">No contacts added yet.</p>
                        ) : (
                          service.contacts.map(contact => (
                            <div key={contact._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors shadow-sm">
                              <div>
                                <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                  <User size={14} className="text-slate-400"/> {contact.name}
                                </p>
                                <a href={`tel:${contact.phone}`} className="text-blue-600 font-medium text-sm flex items-center gap-2 mt-1 hover:underline">
                                  <Phone size={14}/> {contact.phone}
                                </a>
                              </div>
                              {isAdmin && (
                                <button onClick={() => handleDeleteContact(service._id, contact._id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors" title="Remove Contact">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* INLINE FORM TO ADD CONTACT (ADMIN ONLY) */}
                      {isAdmin && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                          {activeCategoryId === service._id ? (
                            <form onSubmit={(e) => handleAddContact(e, service._id)} className="space-y-2">
                              <input type="text" required placeholder="Contact Name" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                              <input type="text" required placeholder="Phone Number" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                              <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-bold transition-colors">Save</button>
                                <button type="button" onClick={() => setActiveCategoryId(null)} className="flex-1 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 py-1.5 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <button onClick={() => setActiveCategoryId(service._id)} className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                              <Plus size={16} /> Add Serviceman
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              No service categories found.
            </div>
          )}
        </div>
      )}

      {/* MODAL TO ADD PARENT CATEGORY (ADMIN ONLY) */}
      {isCategoryModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Add Service Category</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
                <input 
                  type="text" required autoFocus placeholder="e.g. Plumbing, Cleaning, Security"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                  value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServicesDirectory;