import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, Plus, Search, FileText, 
  CheckCircle, Clock, X, Building, Users, Filter
} from 'lucide-react';

const AdminBilling = () => {
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]); // State to hold dynamic flat numbers
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Paid', 'Unpaid'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState('single'); 
  const [newBill, setNewBill] = useState({
    flat: '', amount: '', month: '', dueDate: ''
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // 1. Fetch all bills
      const billsRes = await axios.get('https://smart-society-rr5e.onrender.com/api/billing');
      setBills(billsRes.data);

      // 2. Fetch all residents to extract dynamic flat numbers
      // (Assuming you have a route that returns users/residents)
      try {
        const residentsRes = await axios.get('https://smart-society-rr5e.onrender.com/api/residents');
        // Extract flats, remove duplicates using Set, and sort them alphabetically
        const flatList = residentsRes.data.map(user => user.flat).filter(Boolean);
        const uniqueFlats = [...new Set(flatList)].sort();
        setFlats(uniqueFlats);
      } catch (err) {
        console.warn("Could not fetch residents for dropdown, using fallback.");
        setFlats(['A-101', 'A-102', 'B-101']); // Fallback just in case
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CALCULATE STATS ---
  const totalCollected = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + Number(b.amount), 0);
  const unpaidCount = bills.filter(b => b.status === 'Unpaid').length;

  // --- FILTER LOGIC ---
  const filteredBills = bills.filter(bill => {
    // 1. Check Search Term
    const matchesSearch = 
      (bill.flat && bill.flat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.month && bill.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.id && bill.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Check Status Tabs
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- HANDLE CREATE BILL ---
  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      if (invoiceMode === 'single') {
        const billData = {
          ...newBill,
          id: `#B-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Unpaid',
          issuedOn: new Date().toLocaleDateString('en-GB')
        };
        await axios.post('https://smart-society-rr5e.onrender.com/api/billing', billData);
        alert(`Invoice created for Flat ${newBill.flat}`);
      } 
      else {
        const bulkData = {
          amount: newBill.amount,
          month: newBill.month,
          dueDate: newBill.dueDate,
          issuedOn: new Date().toLocaleDateString('en-GB')
        };
        await axios.post('https://smart-society-rr5e.onrender.com/api/billing/bulk', bulkData);
        alert(`Successfully generated invoices for ALL flats!`);
      }

      setIsModalOpen(false);
      setNewBill({ flat: '', amount: '', month: '', dueDate: '' });
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Failed to create bill. Ensure backend is connected.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-indigo-600" /> Financial Center
          </h1>
          <p className="text-slate-500 mt-1">Manage society maintenance, generate bills, and track payments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={20} /> Generate Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Collected</p>
          <h3 className="text-3xl font-bold text-slate-800">₹{totalCollected.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Dues</p>
          <h3 className="text-3xl font-bold text-slate-800">₹{totalPending.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Defaulters</p>
          <h3 className="text-3xl font-bold text-slate-800">{unpaidCount} Flats</h3>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Toolbar (Search & Filter) */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search Flat or Month..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Paid', 'Unpaid'].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">Loading financials...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Flat</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Cycle</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><FileText size={18} /></div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{bill.id}</p>
                          <p className="text-xs text-slate-500">Issued: {bill.issuedOn || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        <Building size={14} className="text-slate-400"/> {bill.flat}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-700">{bill.month}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Due: {bill.dueDate || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base font-black text-slate-800">₹{bill.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      {bill.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock size={14} /> Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
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

      {/* CREATE BILL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">Generate Invoice</h3>
                <p className="text-slate-400 text-sm mt-1">Issue maintenance bills</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBill} className="p-6 space-y-5">
              
              {/* SINGLE VS BULK TOGGLE */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  type="button" onClick={() => setInvoiceMode('single')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${invoiceMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Building size={16} /> Single Flat
                </button>
                <button 
                  type="button" onClick={() => setInvoiceMode('bulk')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-all ${invoiceMode === 'bulk' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Users size={16} /> All Flats (Bulk)
                </button>
              </div>

              {invoiceMode === 'bulk' && (
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-sm text-indigo-700 flex gap-2">
                  <CreditCard className="flex-shrink-0" size={20} />
                  <p>This will automatically generate a separate invoice for <b>every registered flat</b> in the society database.</p>
                </div>
              )}

              {/* Dynamic Database Dropdown for Single Flat */}
              {invoiceMode === 'single' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Target Flat</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none bg-white font-medium text-slate-700"
                    value={newBill.flat} onChange={(e) => setNewBill({...newBill, flat: e.target.value})}
                  >
                    <option value="" disabled>-- Choose a Flat --</option>
                    {flats.map((flat) => (
                      <option key={flat} value={flat}>{flat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Month</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-slate-700"
                  value={newBill.month} onChange={(e) => setNewBill({...newBill, month: e.target.value})}
                >
                  <option value="" disabled>-- Select Month --</option>
                  <option value="January 2026">January 2026</option>
                  <option value="February 2026">February 2026</option>
                  <option value="March 2026">March 2026</option>
                  <option value="April 2026">April 2026</option>
                  <option value="May 2026">May 2026</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" required placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={newBill.amount} onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-slate-700"
                    value={newBill.dueDate} onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  {invoiceMode === 'bulk' ? 'Issue Bulk Invoices' : 'Issue Single Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;