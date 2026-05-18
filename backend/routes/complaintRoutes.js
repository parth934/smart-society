// backend/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const { Complaint } = require('../models/DatabaseModels');

// 1. GET ALL COMPLAINTS
router.get('/', async (req, res) => {
  try {
    // .sort({ _id: -1 }) fetches the newest complaints first
    const complaints = await Complaint.find().sort({ _id: -1 }); 
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// 2. CREATE A NEW COMPLAINT (For Resident)
router.post('/', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint); // Sending back just the document to match our frontend
  } catch (error) {
    res.status(400).json({ error: "Failed to log complaint", details: error.message });
  }
});

// 3. UPDATE COMPLAINT STATUS (For Admin)
router.put('/:id', async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

// 4. DELETE COMPLAINT (For Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

module.exports = router;