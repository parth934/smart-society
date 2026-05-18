const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- SCHEMA 1: The Facility / Amenity ---
const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  iconName: { type: String, default: 'building' },
  price: { type: String, default: 'Free' },
  maxCapacity: { type: Number, required: true },
  description: { type: String, required: true }
});
const Amenity = mongoose.models.Amenity || mongoose.model('Amenity', amenitySchema);

// --- SCHEMA 2: The Booking Receipt ---
const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  residentName: { type: String, required: true },
  residentEmail: { type: String, required: true },
  facilityName: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  bookedOn: { type: String }
});
// This creates the 'amenitybookings' collection you saw!
const Booking = mongoose.models.AmenityBooking || mongoose.model('AmenityBooking', bookingSchema);

// ==========================================
// 🏢 ROUTES FOR FACILITIES (Amenities)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const amenities = await Amenity.find();
    res.status(200).json(amenities);
  } catch (err) { res.status(500).json({ error: "Error fetching amenities" }); }
});

router.post('/', async (req, res) => {
  try {
    const newAmenity = new Amenity(req.body);
    await newAmenity.save();
    res.status(201).json(newAmenity);
  } catch (err) { res.status(400).json({ error: "Error creating amenity" }); }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Amenity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) { res.status(500).json({ error: "Error updating amenity" }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Amenity.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Amenity deleted" });
  } catch (err) { res.status(500).json({ error: "Error deleting amenity" }); }
});

// ==========================================
// 📅 ROUTES FOR BOOKINGS
// ==========================================
router.get('/bookings/all', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ _id: -1 });
    res.status(200).json(bookings);
  } catch (err) { res.status(500).json({ error: "Error fetching bookings" }); }
});

router.post('/bookings/new', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) { res.status(400).json({ error: "Error creating booking" }); }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const query = req.params.id.startsWith('BKG-') ? { id: req.params.id } : { _id: req.params.id };
    const updated = await Booking.findOneAndUpdate(query, { status: req.body.status }, { new: true });
    res.status(200).json(updated);
  } catch (err) { res.status(500).json({ error: "Error updating booking" }); }
});

module.exports = router;