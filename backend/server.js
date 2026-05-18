require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Database Connected Successfully!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Simple test route
app.get('/api/status', (req, res) => {
  res.json({ message: "Backend and Database are running smoothly!" });
});

// ==========================================
// IMPORT ROUTES
// ==========================================
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const billRoutes = require('./routes/billRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

// ==========================================
// MOUNT ROUTES
// ==========================================
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/documents', require('./routes/documentRoutes'));

// Billing Routes (Mapping both to the same file just to be safe)
app.use('/api/bills', billRoutes);
app.use('/api/billing', billRoutes);

// Settings Route (This was the missing line for your ₹17000 fixed amount!)
app.use('/api/settings', require('./routes/settingsRoutes'));

// ==========================================
// CUSTOM UTILITY ROUTES
// ==========================================
const { User } = require('./models/DatabaseModels');

app.get('/api/residents', async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' });
    res.json(residents);
  } catch (error) {
    console.error("Error fetching residents:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});