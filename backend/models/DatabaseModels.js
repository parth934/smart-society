const mongoose = require('mongoose');

// 1. USERS
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident', 'guard'] }, 
  flat: { type: String } 
});

// 2. COMPLAINTS
const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  residentName: { type: String },
  residentEmail: { type: String },
  flat: { type: String },
  date: { type: String }, 
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'] }
});

// 3. NOTICES
const noticeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Alert', 'Important', 'General Notice'] },
  date: { type: String }
});

// 4. BILLING
const billSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  residentName: { type: String },
  residentEmail: { type: String },
  flat: { type: String },
  month: { type: String },
  amount: { type: Number },
  dueDate: { type: String }, 
  issuedOn: { type: String },
  status: { type: String, enum: ['Unpaid', 'Paid'] }
});

// 5. DOCUMENTS
const documentSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  category: { type: String },
  size: { type: String }, 
  date: { type: String }
});

// 6. SECURITY GUARD LOG 
const visitorSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // The timestamp ID
  visitorName: { type: String, required: true },
  flatToVisit: { type: String, default: 'N/A' },
  purpose: { type: String, default: 'Not Specified' },
  vehicleNumber: { type: String, default: 'N/A' },
  photoUrl: { type: String, default: '' }, 
  date: { type: String },
  timeIn: { type: String },
  timeOut: { type: String, default: null }
});

// 7. ESSENTIAL SERVICES
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  contact: { type: String, required: true },
  rating: { type: String, default: "5.0" },
  availability: { type: String, default: "9 AM - 6 PM" },
  createdAt: { type: Date, default: Date.now }
});

// 8. AMENITY BOOKINGS (Adding this for your Shared Amenities page!)
const amenityBookingSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "BKG-12345"
  residentName: { type: String, required: true },
  residentEmail: { type: String, required: true },
  facilityName: { type: String, required: true },
  date: { type: String, required: true }, 
  timeSlot: { type: String, required: true }, 
  status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected'], default: 'Confirmed' },
  bookedOn: { type: String }
});



// ==========================================
// SINGLE, CLEAN EXPORT AT THE VERY BOTTOM
// ==========================================
module.exports = {
  User: mongoose.model('User', userSchema),
  Complaint: mongoose.model('Complaint', complaintSchema),
  Notice: mongoose.model('Notice', noticeSchema),
  Bill: mongoose.model('Bill', billSchema),
  Document: mongoose.model('Document', documentSchema),
  Visitor: mongoose.model('Visitor', visitorSchema),
  Service: mongoose.model('Service', serviceSchema),
  AmenityBooking: mongoose.model('AmenityBooking', amenityBookingSchema)
};