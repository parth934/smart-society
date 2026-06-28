import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, User, X, Shield, Clock, Building } from 'lucide-react';

const VisitorHistory = () => {
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal State for Enlarged Photo
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // --- 1. FETCH ALL VISITORS ---
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('https://smart-society-rr5e.onrender.com/api/visitors');
        setVisitors(response.data);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  // --- 2. FILTER LOGIC ---
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.flatToVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If dateFilter is empty, show all. If not, match the date strings.
    // Assuming backend saves date as "DD/MM/YYYY" or similar. Adjust formatting if needed.
    const matchesDate = dateFilter === '' || visitor.date.includes(dateFilter.split('-').reverse().join('/'));

    return matchesSearch && matchesDate;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="bg-slate-900 p-3 rounded-xl text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Security Logs & History</h1>
            <p className="text-slate-500 text-sm mt-1">Search and filter all visitor records.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Flat, or Vehicle No..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date Filter */}
          <div className="relative w-full sm:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 text-slate-700"
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">Loading records...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Photo</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor Info</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id || visitor.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* PHOTO THUMBNAIL */}
                    <td className="py-4 px-6">
                      <div 
                        onClick={() => visitor.photoUrl ? setSelectedPhoto(visitor.photoUrl) : null}
                        className={`w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300 ${visitor.photoUrl ? 'cursor-pointer hover:ring-2 ring-slate-900 ring-offset-2 transition-all' : ''}`}
                      >
                        {visitor.photoUrl ? (
                          <img src={visitor.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20}/></div>
                        )}
                      </div>
                    </td>
                    
                    {/* VISITOR INFO */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{visitor.visitorName}</p>
                      <p className="text-xs text-slate-500 mt-1">{visitor.purpose}</p>
                    </td>
                    
                    {/* DESTINATION & VEHICLE */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <Building size={14} className="text-slate-400"/> {visitor.flatToVisit}
                        </span>
                        {visitor.vehicleNumber !== 'N/A' && (
                          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-max border border-slate-200">
                            {visitor.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DATE & TIME */}
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-700">{visitor.date}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={12}/> {visitor.timeIn} - {visitor.timeOut || 'Present'}
                      </p>
                    </td>
                    
                    {/* STATUS */}
                    <td className="py-4 px-6 text-right">
                      {visitor.timeOut ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse">
                          Inside Society
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500 bg-slate-50 border-t border-dashed border-slate-300">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="relative max-w-3xl w-full">
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors p-2"
            >
              <X size={32} />
            </button>
            <img 
              src={selectedPhoto} 
              alt="Enlarged Visitor" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-700 bg-black"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default VisitorHistory;