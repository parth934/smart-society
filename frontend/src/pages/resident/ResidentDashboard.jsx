import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  IndianRupee, AlertCircle, CalendarDays, Megaphone, 
  ArrowRight, Loader2, CreditCard, Plus, CheckCircle, Bell
} from 'lucide-react';

const ResidentDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    unpaidAmount: 0,
    openComplaints: 0,
    upcomingBookings: 0
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all relevant data concurrently!
        const [billsRes, complaintsRes, amenitiesRes, noticesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/bills'),
          axios.get('http://localhost:5000/api/complaints'),
          axios.get('http://localhost:5000/api/amenities'),
          axios.get('http://localhost:5000/api/notices')
        ]);

        // 1. Calculate Unpaid Bills for THIS resident
        const myUnpaidBills = billsRes.data.filter(b => b.residentEmail === user.email && b.status === 'Unpaid');
        const totalDue = myUnpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

        // 2. Calculate Open Complaints for THIS resident
        const myOpenComplaints = complaintsRes.data.filter(c => c.residentEmail === user.email && c.status !== 'Resolved');

        // 3. Calculate Pending/Confirmed Bookings for THIS resident
        const myActiveBookings = amenitiesRes.data.filter(a => a.residentEmail === user.email);

        setStats({
          unpaidAmount: totalDue,
          openComplaints: myOpenComplaints.length,
          upcomingBookings: myActiveBookings.length
        });

        // 4. Get the 3 most recent notices
        setRecentNotices(noticesRes.data.slice(0, 3));

      } catch (error) {
        console.error("Error fetching resident dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* Welcome Banner */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-slate-800 text-white">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user?.name}!</h1>
          <p className="text-blue-100 mt-2 flex items-center gap-2">
            Flat {user?.flat} <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Smart Society
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
          <p className="text-sm font-medium text-slate-200">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Stats & Quick Actions (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Bills Stat */}
              <Link to="/resident/billing" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stats.unpaidAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <IndianRupee size={24} />
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-800">
                  {stats.unpaidAmount > 0 ? `₹${stats.unpaidAmount}` : '₹0'}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {stats.unpaidAmount > 0 ? 'Total Due' : 'All Dues Cleared!'}
                </p>
              </Link>

              {/* Complaints Stat */}
              <Link to="/resident/complaints" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                    <AlertCircle size={24} />
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-800">{stats.openComplaints}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Active Complaints</p>
              </Link>

              {/* Bookings Stat */}
              <Link to="/resident/amenities" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={24} />
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-800">{stats.upcomingBookings}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">My Bookings</p>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">I want to...</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/resident/billing" className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl flex items-center gap-3 font-medium transition-colors">
                  <div className="bg-white/20 p-2 rounded-lg"><CreditCard size={20} /></div>
                  Pay Maintenance Bill
                </Link>
                <Link to="/resident/complaints" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center gap-3 font-medium transition-colors">
                  <div className="bg-white/20 p-2 rounded-lg"><Plus size={20} /></div>
                  Raise a Complaint
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Notice Board Mini-View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="text-blue-600" size={20} /> Latest Notices
              </h2>
            </div>
            
            <div className="p-6 flex-grow flex flex-col gap-4">
              {recentNotices.length === 0 ? (
                <div className="text-center text-slate-500 my-auto">
                  <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No recent announcements.</p>
                </div>
              ) : (
                recentNotices.map((notice) => (
                  <div key={notice._id || notice.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        notice.type === 'Alert' ? 'bg-red-100 text-red-700' :
                        notice.type === 'Important' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {notice.type}
                      </span>
                      <span className="text-xs text-slate-400">{notice.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{notice.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{notice.description}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* View All Button */}
            <div className="p-4 border-t border-slate-100 mt-auto">
              {/* Notice how we link to the shared documents/notice component here if you have one, or just hide it if they can't view all */}
              <button className="w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                View All Announcements
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;