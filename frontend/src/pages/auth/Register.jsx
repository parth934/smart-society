import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'resident', flat: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- BASIC VALIDATIONS ---
  const validateForm = () => {
    // 1. Name Check
    if (formData.name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      return false;
    }

    // 2. Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // 3. Standard Password Validation Check
    // Requires: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return false;
    }

    // 4. Flat Number Check (Only if Resident)
    if (formData.role === 'resident' && formData.flat.trim() === '') {
      setError("Flat Number is required for Residents.");
      return false;
    }

    return true; // If all checks pass
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // Run Validations before touching the backend
    if (!validateForm()) {
      return; 
    }

    setIsLoading(true);

    // If they aren't a resident, remove the flat number before sending to DB
    const dataToSend = { ...formData };
    if (dataToSend.role !== 'resident') {
      delete dataToSend.flat;
    } else {
      // Force flat number to uppercase (e.g. "a-101" -> "A-101")
      dataToSend.flat = dataToSend.flat.toUpperCase(); 
    }

    // Call the real backend register function
    const result = await register(dataToSend);
    
    if (!result.success) {
      setError(result.error); // Display backend error
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="p-8 text-center bg-slate-900">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 mt-1">Join the Smart Society platform</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100 animate-pulse">
              <AlertCircle size={16} className="flex-shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ramesh Patel"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="ramesh@example.com"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="resident">Resident</option>
              </select>
            </div>
          </div>

          {/* Conditional Flat Number Input */}
          {formData.role === 'resident' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flat Number</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none uppercase"
                  placeholder="A-101"
                  value={formData.flat} onChange={(e) => setFormData({...formData, flat: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="••••••••"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><ArrowRight size={20} /> Create Account</>}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;