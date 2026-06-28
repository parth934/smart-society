import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Users, AlertCircle, CreditCard, ShieldCheck, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Real Data States
  const [stats, setStats] = useState({
    totalVisitorsToday: 0,
    activeComplaints: 0,
    totalAmenities: 0,
    totalMaintenance: 0
  });
  
  // Chart Data States
  const [complaintData, setComplaintData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch EVERYTHING from your real backend
        const [visitorsRes, amenitiesRes, complaintsRes, billsRes] = await Promise.all([
          axios.get('http://https://smart-society-rr5e.onrender.com/api/visitors').catch(() => ({ data: [] })),
          axios.get('http://https://smart-society-rr5e.onrender.com/api/amenities').catch(() => ({ data: [] })),
          axios.get('http://https://smart-society-rr5e.onrender.com/api/complaints').catch(() => ({ data: [] })),
          axios.get('http://https://smart-society-rr5e.onrender.com/api/billing').catch(() => ({ data: [] })) 
        ]);

        const visitors = visitorsRes.data;
        const complaints = complaintsRes.data;
        const bills = billsRes.data;

        // --- CALCULATE TOP CARDS ---
        const today = new Date().toLocaleDateString('en-GB');
        const visitorsToday = visitors.filter(v => v.date === today).length;
        const activeComplaintsList = complaints.filter(c => c.status !== 'Resolved');
        
        // Calculate total collected maintenance
        const totalCollected = bills.reduce((sum, bill) => {
          return bill.status === 'Paid' ? sum + Number(bill.amount) : sum;
        }, 0);

        setStats({
          totalVisitorsToday: visitorsToday,
          activeComplaints: activeComplaintsList.length,
          totalAmenities: amenitiesRes.data.length,
          totalMaintenance: totalCollected
        });

        // --- CALCULATE REAL PIE CHART DATA (COMPLAINTS) ---
        let pending = 0, inProgress = 0, resolved = 0;
        complaints.forEach(c => {
          if (c.status === 'Pending') pending++;
          if (c.status === 'In Progress') inProgress++;
          if (c.status === 'Resolved') resolved++;
        });

        if (complaints.length === 0) {
          // Fallback if society is brand new and has 0 complaints
          setComplaintData([{ name: 'No Data Yet', value: 1, color: '#e2e8f0' }]);
        } else {
          // Only push slices that actually have a number greater than 0
          const realPieData = [];
          if (pending > 0) realPieData.push({ name: 'Pending', value: pending, color: '#f59e0b' });
          if (inProgress > 0) realPieData.push({ name: 'In Progress', value: inProgress, color: '#3b82f6' });
          if (resolved > 0) realPieData.push({ name: 'Resolved', value: resolved, color: '#10b981' });
          setComplaintData(realPieData);
        }

        // --- CALCULATE REAL BAR CHART DATA (REVENUE) ---
        if (bills.length > 0) {
          const monthTotals = {};
          
          bills.forEach(bill => {
            if (bill.status === 'Paid') {
              let monthName = "Unknown";

              // 1. Use your existing 'month' field if it has data (e.g., "May")
              if (bill.month) {
                monthName = bill.month.substring(0, 3); // Gets "Jan", "Feb", etc.
              } 
              // 2. Or, extract the month from your 'issuedOn' date (e.g., "15/05/2026")
              else if (bill.issuedOn) {
                const dateParts = bill.issuedOn.includes('/') ? bill.issuedOn.split('/').reverse().join('-') : bill.issuedOn;
                const dateObj = new Date(dateParts); 
                monthName = dateObj.toLocaleString('default', { month: 'short' });
              } 
              // 3. Fallback: Current month
              else {
                monthName = new Date().toLocaleString('default', { month: 'short' });
              }
              
              if (!monthTotals[monthName]) monthTotals[monthName] = 0;
              monthTotals[monthName] += Number(bill.amount);
            }
          });

          // Convert the object into the Array format Recharts needs
          const realBarData = Object.keys(monthTotals).map(month => ({
            name: month,
            amount: monthTotals[month]
          }));
          
          setRevenueData(realBarData);
        } else {
          // Fallback if no bills exist yet
          setRevenueData([
            { name: 'No Data', amount: 0 }
          ]);
        }

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // --- UI COMPONENTS ---
  const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, bgColorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '-' : value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColorClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={`flex items-center font-medium ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
          {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}
        </span>
        <span className="text-slate-400">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-500 mt-1">Here is real-time data from your society database.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm border border-indigo-100 flex items-center gap-2">
          <TrendingUp size={18} /> System Status: Optimal
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Maintenance Paid" 
          value={`₹${stats.totalMaintenance.toLocaleString('en-IN')}`} 
          icon={CreditCard} trend="Real-time" trendUp={true}
          colorClass="text-emerald-600" bgColorClass="bg-emerald-50"
        />
        <StatCard 
          title="Active Complaints" 
          value={stats.activeComplaints} 
          icon={AlertCircle} trend="Requires Action" trendUp={false}
          colorClass="text-amber-600" bgColorClass="bg-amber-50"
        />
        <StatCard 
          title="Visitors Today" 
          value={stats.totalVisitorsToday} 
          icon={ShieldCheck} trend="Gate Active" trendUp={true}
          colorClass="text-blue-600" bgColorClass="bg-blue-50"
        />
        <StatCard 
          title="Active Amenities" 
          value={stats.totalAmenities} 
          icon={Users} trend="Operational" trendUp={true}
          colorClass="text-purple-600" bgColorClass="bg-purple-50"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Revenue */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Maintenance Collection Overview</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Collection']}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Complaints */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Complaint Status</h3>
          <p className="text-xs text-slate-500 mb-6">Current distribution of resident tickets.</p>
          
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complaintData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text (Total complaints) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">
                {complaintData.reduce((acc, curr) => acc + (curr.name !== 'No Data Yet' ? curr.value : 0), 0)}
              </span>
              <span className="text-xs text-slate-500 font-medium">Total Tickets</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="mt-4 space-y-3">
            {complaintData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;