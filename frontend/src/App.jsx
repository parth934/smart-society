import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// ==========================================
// 1. LAYOUTS & GUARDS
// ==========================================
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// ==========================================
// 2. PUBLIC PAGES
// ==========================================
import LandingPage from './pages/LandingPage'; // <-- ADDED THIS IMPORT
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';

// ==========================================
// 3. ADMIN PAGES
// ==========================================
import AdminDashboard from './pages/admin/AdminDashboard';
import NoticeBoard from './pages/admin/notices/NoticeBoard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminBilling from './pages/admin/AdminBilling';
import AdminResidents from './pages/admin/AdminResidents';

// ==========================================
// 4. RESIDENT PAGES
// ==========================================
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentComplaints from './pages/resident/ResidentComplaints';
import ResidentBilling from './pages/resident/ResidentBilling';

// ==========================================
// 5. SECURITY PAGES
// ==========================================
import SecurityDashboard from './pages/security/SecurityDashboard';

// ==========================================
// 6. SHARED PAGES (Used by Multiple Roles)
// ==========================================
import AmenitiesBooking from './pages/shared/AmenitiesBooking';
import ServicesDirectory from './pages/shared/ServicesDirectory';
import DocumentCenter from './pages/shared/DocumentCenter';
import VisitorHistory from './pages/shared/VisitorHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          
          {/* ========================================== */}
          {/* PUBLIC ROUTES                              */}
          {/* ========================================== */}
          <Route path="/" element={<LandingPage />} /> {/* <-- ADDED THIS ROUTE */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ========================================== */}
          {/* PROTECTED ROUTES (Wrapped in MainLayout)   */}
          {/* ========================================== */}
          <Route element={<MainLayout />}>
            
            {/* --- ADMIN ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/notices" element={<NoticeBoard />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/billing" element={<AdminBilling />} />
              <Route path="/admin/residents" element={<AdminResidents />} />

              {/* Admin Shared Feature Routes */}
              <Route path="/admin/amenities" element={<AmenitiesBooking />} />
              <Route path="/admin/services" element={<ServicesDirectory />} />
              <Route path="/admin/documents" element={<DocumentCenter />} />
              <Route path="/admin/visitors" element={<VisitorHistory />} />
            </Route>

            {/* --- RESIDENT ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/resident/complaints" element={<ResidentComplaints />} />
              <Route path="/resident/billing" element={<ResidentBilling />} />
              
              {/* Resident Shared Feature Routes */}
              <Route path="/resident/amenities" element={<AmenitiesBooking />} />
              <Route path="/resident/services" element={<ServicesDirectory />} />
              <Route path="/resident/documents" element={<DocumentCenter />} />
            </Route>

            {/* --- SECURITY GUARD ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['guard']} />}>
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/security/history" element={<VisitorHistory />} />
            </Route>

          </Route>
          
          {/* ========================================== */}
          {/* DEFAULT ROUTE (Fallback)                   */}
          {/* ========================================== */}
          {/* If they type a random URL, send them to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;