// backend/routes/billRoutes.js
const express = require('express');
const router = express.Router();
const { Bill, User } = require('../models/DatabaseModels');


// 1. GET ALL BILLS
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ _id: -1 });
    res.status(200).json(bills); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// 2. CREATE A NEW BILL (Admin Only)
router.post('/', async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(400).json({ error: "Failed to generate bill", details: error.message });
  }
});

// 3. UPDATE BILL STATUS (Mark as Paid)
router.put('/:id', async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status || 'Paid' }, 
      { new: true }
    );
    res.status(200).json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: "Failed to update bill" });
  }
});

// 4. DELETE BILL (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bill" });
  }
});

// Bulk Billing Route
router.post('/bulk', async (req, res) => {
  try {
    const { amount, month, dueDate, issuedOn } = req.body;

    // 1. Find all users who are Residents (to get their flat numbers)
    // Adjust 'User' to match your actual Mongoose model name
    const residents = await User.find({ role: 'resident' }); 

    // 2. Map through them to create an array of new bills
    const newBills = residents.map(resident => ({
      id: `#B-${Math.floor(1000 + Math.random() * 9000)}`,
      residentName: resident.name,
      residentEmail: resident.email,
      flat: resident.flat,
      amount,
      month,
      dueDate,
      issuedOn,
      status: 'Unpaid'
    }));

    // 3. Save all of them to the database at once!
    await Bill.insertMany(newBills); // Adjust 'Bill' to match your model name

    res.status(201).json({ message: `Successfully created ${newBills.length} invoices.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating bulk bills' });
  }
});

module.exports = router;