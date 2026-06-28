import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  CalendarDays, Clock, CheckCircle, 
  Dumbbell, Waves, PartyPopper, Trophy, 
  Plus, Edit, Trash2, Building, Loader2, XCircle
} from 'lucide-react';
import Modal from '../../components/common/Modal';

const AmenitiesBooking = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('facilities');
  
  // Database States
  const [facilities, setFacilities] = useState([]);
  const [allBookings, setAllBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: '', time: 'Morning (08:00 AM - 12:00 PM)' });

  // Facility CRUD States (Admin)
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState(null);
  const [facilityForm, setFacilityForm] = useState({ name: '', iconName: 'building', price: 'Free', maxCapacity: '', description: '' });

  // --- 1. LOAD DATA FROM MONGODB ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Facilities
        const facRes = await axios.get('http://https://smart-society-rr5e.onrender.com/api/amenities');
        setFacilities(facRes.data);

        // Fetch Bookings
        const bkgRes = await axios.get('http://https://smart-society-rr5e.onrender.com/api/amenities/bookings/all');
        setAllBookings(bkgRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. FACILITY CRUD (ADMIN ONLY) ---
  const handleSaveFacility = async (e) => {
    e.preventDefault();
    try {
      if (editingFacilityId) {
        const response = await axios.put(`http://https://smart-society-rr5e.onrender.com/api/amenities/${editingFacilityId}`, facilityForm);
        setFacilities(facilities.map(f => f._id === editingFacilityId ? response.data : f));
      } else {
        const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/amenities', facilityForm);
        setFacilities([...facilities, response.data]);
      }
      setIsFacilityModalOpen(false);
    } catch (error) {
      alert("Failed to save facility to database.");
    }
  };

  const handleDeleteFacility = async (id) => {
    if (window.confirm("Are you sure you want to delete this facility?")) {
      try {
        await axios.delete(`http://https://smart-society-rr5e.onrender.com/api/amenities/${id}`);
        setFacilities(facilities.filter(f => f._id !== id));
      } catch (error) {
        alert("Failed to delete facility.");
      }
    }
  };

  const openAddFacilityModal = () => {
    setFacilityForm({ name: '', iconName: 'building', price: 'Free', maxCapacity: '', description: '' });
    setEditingFacilityId(null);
    setIsFacilityModalOpen(true);
  };

  const openEditFacilityModal = (facility) => {
    setFacilityForm(facility);
    setEditingFacilityId(facility._id);
    setIsFacilityModalOpen(true);
  };

  // --- 3. CREATE A BOOKING (Resident & Admin) ---
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const newBooking = {
      id: `BKG-${Math.floor(10000 + Math.random() * 90000)}`,
      residentName: user?.name,
      residentEmail: user?.email,
      facilityName: selectedFacility.name,
      date: bookingForm.date,
      timeSlot: bookingForm.time,
      status: 'Pending',
      bookedOn: new Date().toLocaleDateString('en-GB')
    };
    
    try {
      const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/amenities/bookings/new', newBooking);
      setAllBookings([response.data, ...allBookings]);
      setIsBookingModalOpen(false);
      setActiveTab('bookings');
    } catch (error) {
      alert("Failed to book facility.");
    }
  };

  // --- 4. UPDATE BOOKING STATUS (Admin Only) ---
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://https://smart-society-rr5e.onrender.com/api/amenities/bookings/${id}`, { status: newStatus });
      setAllBookings(allBookings.map(b => (b._id === id || b.id === id) ? response.data : b));
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleOpenBooking = (facility) => {
    setSelectedFacility(facility);
    setBookingForm({ ...bookingForm, date: new Date().toISOString().split('T')[0] });
    setIsBookingModalOpen(true);
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'party': return <PartyPopper size={28} />;
      case 'waves': return <Waves size={28} />;
      case 'trophy': return <Trophy size={28} />;
      case 'dumbbell': return <Dumbbell size={28} />;
      default: return <Building size={28} />;
    }
  };

  const displayedBookings = isAdmin ? allBookings : allBookings.filter(b => b.residentEmail === user?.email);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'Manage Amenities' : 'Amenities & Booking'}</h1>
          <p className="text-slate-500 mt-1">{isAdmin ? 'Manage society facilities and resident bookings.' : 'Reserve society facilities.'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setActiveTab('facilities')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'facilities' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Facilities
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {isAdmin ? 'All Bookings' : 'My Bookings'}
            </button>
          </div>

          {isAdmin && activeTab === 'facilities' && (
            <button onClick={openAddFacilityModal} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
              <Plus size={18} /> Add Facility
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <>
          {/* FACILITIES TAB */}
          {activeTab === 'facilities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                  No facilities found. {isAdmin && "Add one above!"}
                </div>
              ) : facilities.map((facility) => (
                <div key={facility._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow relative group">
                  
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditFacilityModal(facility)} className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteFacility(facility._id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">{getIcon(facility.iconName)}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ${isAdmin ? 'mt-8' : 'mt-1'}`}>{facility.price}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{facility.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-3">Max Capacity: {facility.maxCapacity} people</p>
                  <p className="text-sm text-slate-500 mb-6 flex-grow">{facility.description}</p>
                  
                  <button onClick={() => handleOpenBooking(facility)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {displayedBookings.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">No bookings found.</div>
              ) : displayedBookings.map((booking) => (
                <div key={booking._id || booking.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-blue-200 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{booking.facilityName}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-1.5 font-medium">
                      <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-slate-400"/> {booking.date}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> {booking.timeSlot}</span>
                    </div>
                    {isAdmin && (
                      <p className="text-xs font-bold text-slate-600 mt-3 bg-slate-50 inline-flex items-center px-2.5 py-1 rounded-md border border-slate-200">
                        Resident: <span className="text-blue-600 ml-1">{booking.residentName}</span> ({booking.residentEmail})
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isAdmin ? (
                      <select 
                        className={`text-sm font-bold px-3 py-2 rounded-xl border-2 outline-none cursor-pointer transition-colors ${
                          booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          booking.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        value={booking.status} onChange={(e) => handleStatusUpdate(booking._id || booking.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 ${
                        booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.status === 'Confirmed' ? <CheckCircle size={16} /> : booking.status === 'Rejected' ? <XCircle size={16} /> : <Loader2 size={16} className="animate-spin" />}
                        {booking.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL: BOOKING FORM */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={`Book ${selectedFacility?.name}`}>
        <form onSubmit={handleConfirmBooking} className="space-y-5">
          <div><label className="block text-sm font-medium mb-1">Select Date</label><input type="date" required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-xl" value={bookingForm.date} onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Time Slot</label><select className="w-full px-4 py-2 border rounded-xl bg-white" value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}><option>Morning (08:00 AM - 12:00 PM)</option><option>Afternoon (12:00 PM - 04:00 PM)</option><option>Evening (04:00 PM - 08:00 PM)</option></select></div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Confirm Booking</button>
        </form>
      </Modal>

      {/* MODAL: ADMIN ADD/EDIT FACILITY */}
      <Modal isOpen={isFacilityModalOpen} onClose={() => setIsFacilityModalOpen(false)} title={editingFacilityId ? 'Edit Facility' : 'Add New Facility'}>
        <form onSubmit={handleSaveFacility} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Facility Name *</label><input type="text" required placeholder="e.g. Yoga Studio" className="w-full px-4 py-2 border rounded-xl" value={facilityForm.name} onChange={(e) => setFacilityForm({...facilityForm, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Icon Style</label><select className="w-full px-4 py-2 border rounded-xl bg-white" value={facilityForm.iconName} onChange={(e) => setFacilityForm({...facilityForm, iconName: e.target.value})}><option value="building">Standard</option><option value="waves">Pool / Water</option><option value="dumbbell">Gym / Fitness</option><option value="party">Party / Event</option><option value="trophy">Sports / Games</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Price Label</label><input type="text" placeholder="e.g. Free" className="w-full px-4 py-2 border rounded-xl" value={facilityForm.price} onChange={(e) => setFacilityForm({...facilityForm, price: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Max Capacity *</label><input type="number" required className="w-full px-4 py-2 border rounded-xl" value={facilityForm.maxCapacity} onChange={(e) => setFacilityForm({...facilityForm, maxCapacity: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Rules / Description *</label><textarea required rows="2" className="w-full px-4 py-2 border rounded-xl" value={facilityForm.description} onChange={(e) => setFacilityForm({...facilityForm, description: e.target.value})}></textarea></div>
          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">{editingFacilityId ? 'Update Facility' : 'Save Facility'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default AmenitiesBooking;