const express = require('express');
const router = express.Router();
const { Visitor } = require('../models/DatabaseModels');

// 1. GET ALL VISITORS
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ _id: -1 });
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// 2. LOG NEW VISITOR (Guard Only)
router.post('/', async (req, res) => {
  try {
    const now = new Date();
    const newVisitor = new Visitor({
      ...req.body,
      id: Date.now(), // Unique ID
      date: now.toLocaleDateString('en-GB'),
      timeIn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timeOut: null
    });
    
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (error) {
    res.status(400).json({ error: "Failed to log visitor" });
  }
});

// 3. CHECK OUT VISITOR
router.put('/:id/checkout', async (req, res) => {
  try {
    const timeOut = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      req.params.id, 
      { timeOut: timeOut }, 
      { new: true }
    );
    res.status(200).json(updatedVisitor);
  } catch (error) {
    res.status(500).json({ error: "Failed to checkout visitor" });
  }
});

module.exports = router;