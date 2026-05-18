import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  CreditCard, Loader2, CheckCircle, 
  FileText, Clock, ShieldCheck, X, Download
} from 'lucide-react';

const ResidentBilling = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulated Checkout Modal State
  const [checkoutBill, setCheckoutBill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Fetch Resident's personal bills (matching by flat or email)
        const billsRes = await axios.get('http://localhost:5000/api/billing');
        const myBills = billsRes.data.filter(b => 
          b.residentEmail === user.email || b.flat === user.flat
        );
        setBills(myBills);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchBills();
  }, [user]);

  // --- PROCESS PAYMENT LOGIC ---
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Simulate network delay for realistic "Stripe" processing effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hit your real backend update route
      const response = await axios.put(`http://localhost:5000/api/billing/${checkoutBill._id}`, { status: 'Paid' });
      
      // Update local state to reflect payment instantly
      setBills(bills.map(b => b._id === checkoutBill._id ? response.data : b));
      setPaymentSuccess(true);
      
    } catch (error) {
      alert("Payment gateway simulation failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutBill(null);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  // --- CALCULATIONS ---
  const totalDue = bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + Number(b.amount), 0);
  const unpaidCount = bills.filter(b => b.status === 'Unpaid').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Maintenance & Billing</h1>
        <p className="text-slate-500 mt-1">View your invoices and pay dues securely.</p>
      </div>

      {/* TOP METRIC - Full Width Outstanding Dues */}
      <div className={`p-8 rounded-3xl shadow-sm text-white flex items-center justify-between ${totalDue > 0 ? 'bg-slate-900' : 'bg-emerald-600'}`}>
        <div>
          <p className="text-white/80 font-medium mb-1">Total Outstanding Dues</p>
          <h2 className="text-4xl md:text-5xl font-bold">₹{totalDue.toLocaleString('en-IN')}</h2>
          {unpaidCount > 0 && (
            <p className="text-sm mt-3 text-white/80 bg-white/10 w-max px-4 py-1.5 rounded-full font-medium tracking-wide">
              {unpaidCount} Pending Invoice{unpaidCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="hidden md:flex bg-white/10 p-6 rounded-full text-white">
          <CreditCard size={48} strokeWidth={1.5} />
        </div>
      </div>

      {/* INVOICE LIST */}
      <h2 className="text-xl font-bold text-slate-800 pt-6 border-b border-slate-100 pb-3">My Invoices</h2>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="bg-slate-50 p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
              <p className="text-lg font-medium text-slate-700">All caught up!</p>
              <p>You have no pending maintenance bills.</p>
            </div>
          ) : (
            bills.map(bill => (
              <div key={bill._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                
                {/* Bill Info */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Maintenance - {bill.month}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{bill.id}</span>
                      <span>Issued: {bill.issuedOn || 'N/A'}</span>
                      {bill.status === 'Unpaid' && <span className="flex items-center gap-1 text-amber-600 font-medium"><Clock size={14}/> Due: {bill.dueDate || 'N/A'}</span>}
                    </div>
                  </div>
                </div>
                
                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none pt-4 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-2xl font-black text-slate-800">₹{bill.amount}</span>
                  </div>
                  
                  {bill.status === 'Paid' ? (
                    <button 
                      onClick={() => window.print()} 
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors"
                    >
                      <Download size={18} /> Receipt
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCheckoutBill(bill)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SIMULATED STRIPE CHECKOUT MODAL */}
      {checkoutBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white relative">
              <button onClick={closeCheckout} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
              <ShieldCheck size={32} className="text-emerald-400 mb-3" />
              <h3 className="text-xl font-bold">Secure Checkout</h3>
              <p className="text-slate-400 text-sm mt-1">{checkoutBill.month} Maintenance • Flat {user.flat}</p>
            </div>

            {paymentSuccess ? (
              /* SUCCESS STATE */
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Payment Successful!</h3>
                <p className="text-slate-500">Your maintenance due of ₹{checkoutBill.amount} has been cleared.</p>
                <button 
                  onClick={closeCheckout}
                  className="w-full py-3 mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              /* PAYMENT FORM STATE */
              <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Amount to Pay</span>
                  <span className="text-2xl font-black text-slate-900">₹{checkoutBill.amount}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cardholder Name</label>
                    <input type="text" required defaultValue={user.name} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Card Number (Simulated)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" required placeholder="•••• •••• •••• ••••" maxLength="19" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono tracking-widest" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                      <input type="text" required placeholder="MM/YY" maxLength="5" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-center" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                      <input type="password" required placeholder="•••" maxLength="3" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-center" />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing Payment...</>
                  ) : (
                    `Pay ₹${checkoutBill.amount} Securely`
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1 mt-2">
                  <ShieldCheck size={14}/> This is a secure, encrypted simulation.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResidentBilling;