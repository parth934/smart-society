import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Building, CreditCard, Users, 
  Smartphone, ArrowRight, CheckCircle2, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- REUSABLE COMPONENTS ---
  const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* NAVIGATION */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Building size={24} />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Smart<span className="text-indigo-600">Soc</span></span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it Works</a>
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Log In</Link>
                <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-slate-200">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 shadow-xl">
            <a href="#features" className="block text-slate-600 font-medium py-2">Features</a>
            <a href="#how-it-works" className="block text-slate-600 font-medium py-2">How it Works</a>
            <hr className="border-slate-100" />
            <Link to="/login" className="block w-full text-center bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl">Log In</Link>
            <Link to="/login" className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl">Get Started</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl -z-10 rounded-full mix-blend-multiply"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            SmartSoc v2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            The intelligent way to manage <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              your residential society.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace chaotic WhatsApp groups and paper registers with a unified platform for security, billing, and resident communication.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
              Try SmartSoc Free <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 rounded-full font-bold text-lg transition-all shadow-sm">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to run your society smoothly.</h2>
            <p className="text-lg text-slate-500">Powerful tools designed for Committee Members, Security Guards, and Residents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Digital Gate Security" 
              desc="Log visitors instantly with cloud photo capture, vehicle tracking, and real-time alerts to residents."
            />
            <FeatureCard 
              icon={CreditCard} 
              title="Automated Billing" 
              desc="Generate monthly maintenance invoices instantly, track pending dues, and view real-time revenue charts."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Resident Helpdesk" 
              desc="Residents can raise tickets for plumbing or electrical issues and track resolution progress dynamically."
            />
            <FeatureCard 
              icon={Users} 
              title="Amenity Bookings" 
              desc="Avoid double-booking the clubhouse. Residents can reserve amenities digitally through their dashboard."
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Notice Board" 
              desc="Publish digital notices and important PDFs that reach every resident instantly without getting lost in chats."
            />
            <FeatureCard 
              icon={Building} 
              title="Central Admin Control" 
              desc="A beautiful God-view dashboard to monitor security logs, finances, and active complaints in one place."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
              <Building size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SmartSoc</span>
          </div>
          
          <p className="text-sm">© {new Date().getFullYear()} SmartSoc Residential Solutions. All rights reserved.</p>
          
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;