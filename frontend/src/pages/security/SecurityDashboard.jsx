import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Webcam from 'react-webcam';
import { UserPlus, Clock, ShieldCheck, CheckCircle, Car, Building, Loader2, Camera, RefreshCcw, User } from 'lucide-react';

const SecurityDashboard = () => {
  const { user } = useAuth(); 

  // Form State
  const [visitorName, setVisitorName] = useState('');
  const [flatToVisit, setFlatToVisit] = useState(''); 
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState(''); 
  
  // Camera State
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null); // Stores the captured image

  // Database State
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. FETCH VISITOR LOGS ---
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('http://https://smart-society-rr5e.onrender.com/api/visitors');
        setVisitors(response.data);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  // --- 2. CAPTURE PHOTO ---
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  }, [webcamRef]);

  // --- 3. LOG NEW VISITOR ENTRY ---
  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return; 
    setIsSubmitting(true);

    let uploadedPhotoUrl = '';

    // If a photo was taken, upload it to Cloudinary first
    if (photo) {
      try {
        const formData = new FormData();
        formData.append('file', photo);
        
        // cloudinary.com deatils
        formData.append('upload_preset', 'smart_soc_preset'); 
        const cloudName = 'dpv3bvkhd'; 

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
        uploadedPhotoUrl = res.data.secure_url; // This is the safe URL we save to MongoDB!
      } catch (error) {
        console.error("Failed to upload image to Cloudinary", error);
        alert("Image upload failed. Check Cloudinary settings.");
        setIsSubmitting(false);
        return; // Stop the form submission if image fails
      }
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString('en-GB');

    const newVisitor = {
      id: Date.now(),
      visitorName: visitorName.trim(),
      flatToVisit: flatToVisit.trim() ? flatToVisit.trim().toUpperCase() : 'N/A',
      purpose: purpose.trim() ? purpose : 'Not Specified', 
      vehicleNumber: vehicleNumber.trim() ? vehicleNumber.toUpperCase() : 'N/A', 
      photoUrl: uploadedPhotoUrl, // <-- Saving the Cloudinary URL!
      date: currentDate,
      timeIn: currentTime,
      timeOut: null
    };

    try {
      const response = await axios.post('http://https://smart-society-rr5e.onrender.com/api/visitors', newVisitor);
      setVisitors([response.data.data || response.data, ...visitors]);
      
      // Reset form
      setVisitorName('');
      setFlatToVisit('');
      setPurpose('');
      setVehicleNumber('');
      setPhoto(null); // Clear the camera
    } catch (error) {
      console.error("Error logging visitor:", error);
      alert("Failed to log visitor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. MARK VISITOR EXIT ---
  const handleMarkExit = async (id) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const response = await axios.put(`http://https://smart-society-rr5e.onrender.com/api/visitors/${id}`, { timeOut: currentTime });
      setVisitors(visitors.map(visitor => visitor.id === id || visitor._id === id ? response.data.data || response.data : visitor));
    } catch (error) {
      alert("Failed to record exit time.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={28} /> Security Checkpoint
            </h1>
            <p className="text-slate-500 mt-1">Duty Officer: <span className="font-medium text-slate-700">{user?.name || 'Guard'}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Entry Form & Camera */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" /> New Visitor Entry
              </h2>
              
              {/* CAMERA SECTION */}
              <div className="mb-6 flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                {photo ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={photo} alt="Visitor" className="object-cover w-full h-full" />
                    <button onClick={() => setPhoto(null)} className="absolute bottom-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors" title="Retake Photo">
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover"
                    />
                    <button onClick={capturePhoto} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-colors">
                      <Camera size={18} /> Capture
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2 text-center">Capture visitor photo for security records</p>
              </div>

              <form onSubmit={handleAddVisitor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visitor Name <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Flat to Visit <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none uppercase" value={flatToVisit} onChange={(e) => setFlatToVisit(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none uppercase" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purpose <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all mt-4 disabled:opacity-70 flex justify-center items-center">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Log Entry"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={20} className="text-slate-500"/> Live Gate Log</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{visitors.filter(v => !v.timeOut).length} Inside</span>
              </div>
              
              <div className="overflow-x-auto min-h-[300px]">
                {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Visitor</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Details</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {visitors.map((visitor) => (
                        <tr key={visitor._id || visitor.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* VISITOR PHOTO & NAME */}
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300">
                              {visitor.photoUrl ? (
                                <img src={visitor.photoUrl} alt={visitor.visitorName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20}/></div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{visitor.visitorName}</p>
                              <p className="text-xs text-slate-400">{visitor.date}</p>
                            </div>
                          </td>
                          
                          {/* DETAILS */}
                          <td className="py-4 px-6">
                            <p className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                              {visitor.flatToVisit !== 'N/A' && <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1"><Building size={12} /> {visitor.flatToVisit}</span>}
                              <span>{visitor.flatToVisit !== 'N/A' ? '• ' : ''}{visitor.purpose}</span>
                            </p>
                            {visitor.vehicleNumber !== 'N/A' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200"><Car size={12} /> {visitor.vehicleNumber}</span>}
                          </td>

                          {/* STATUS */}
                          <td className="py-4 px-6">
                            <p className="text-xs font-medium text-emerald-600 mb-1">In: {visitor.timeIn}</p>
                            {visitor.timeOut ? (
                              <p className="text-xs font-medium text-slate-500">Out: {visitor.timeOut}</p>
                            ) : (
                              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Inside</span>
                            )}
                          </td>
                          
                          {/* ACTION */}
                          <td className="py-4 px-6 text-right">
                            {!visitor.timeOut ? (
                              <button onClick={() => handleMarkExit(visitor.id || visitor._id)} className="text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors border border-red-200 hover:border-red-600">
                                Mark Exit
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-400"><CheckCircle size={16} /> Exited</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {visitors.length === 0 && <tr><td colSpan="4" className="py-12 text-center text-slate-500">No visitors logged yet.</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;