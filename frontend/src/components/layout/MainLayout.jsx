import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Bell, LogOut, 
  ShieldCheck, Home, AlertCircle, CreditCard, 
  CalendarDays, Phone, FileText 
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Role based navigation links
  let navLinks = [];

if (user?.role === 'admin') {
    navLinks = [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Gate Logs', path: '/admin/visitors', icon: ShieldCheck }, // <--- ADD THIS LINE!
      { name: 'Residents', path: '/admin/residents', icon: Users },
      { name: 'Notices', path: '/admin/notices', icon: Bell },
      { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
      { name: 'Maintenance', path: '/admin/billing', icon: CreditCard },
      { name: 'Amenities', path: '/admin/amenities', icon: CalendarDays }, 
      { name: 'Local Services', path: '/admin/services', icon: Phone },
      { name: 'Documents', path: '/admin/documents', icon: FileText },
    ];
  } else if (user?.role === 'resident') {
    navLinks = [
      { name: 'My Home', path: '/resident', icon: Home },
      { name: 'My Complaints', path: '/resident/complaints', icon: AlertCircle },
      { name: 'My Dues', path: '/resident/billing', icon: CreditCard },
      { name: 'Book Amenities', path: '/resident/amenities', icon: CalendarDays }, 
      { name: 'Local Services', path: '/resident/services', icon: Phone },
      { name: 'Documents', path: '/resident/documents', icon: FileText },
    ];
  } else if (user?.role === 'guard') { 
    navLinks = [
      { name: 'Checkpoint', path: '/security', icon: ShieldCheck },
      { name: 'Gate History', path: '/security/history', icon: CalendarDays }, // <-- ADDED THIS!
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-500" /> 
            SmartSoc
          </h2>
        </div>

        <nav className="p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
                            (link.path !== '/admin' && link.path !== '/resident' && 
                             location.pathname.startsWith(link.path));

            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div>
            <span className="text-sm font-medium text-slate-500">Access Level: </span>
            <span className="text-sm font-bold uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;