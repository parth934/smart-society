// backend/routes/noticeRoutes.js
const express = require('express');
const router = express.Router();
const { Notice } = require('../models/DatabaseModels');

// GET all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ _id: -1 }); // Newest first
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

// POST a new notice
router.post('/', async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    await newNotice.save();
    res.status(201).json({ message: "Notice created", data: newNotice });
  } catch (error) {
    res.status(400).json({ error: "Failed to create notice", details: error.message });
  }
});

// DELETE a notice
router.delete('/:id', async (req, res) => {
  try {
    // Finding by the custom 'id' field (Number) we defined in the schema
    await Notice.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

module.exports = router;