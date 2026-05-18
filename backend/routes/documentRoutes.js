const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema for Society Documents
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Rules", "Financial", "Forms", "Minutes"
  fileUrl: { type: String, required: true },  // The Google Drive / Cloud link
  dateAdded: { type: String, default: () => new Date().toLocaleDateString('en-GB') }
});

const SocietyDoc = mongoose.models.SocietyDoc || mongoose.model('SocietyDoc', documentSchema);

// 1. GET ALL DOCUMENTS
router.get('/', async (req, res) => {
  try {
    const docs = await SocietyDoc.find().sort({ _id: -1 });
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// 2. ADD A DOCUMENT (Admin)
router.post('/', async (req, res) => {
  try {
    const newDoc = new SocietyDoc(req.body);
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(400).json({ error: "Failed to add document" });
  }
});

// 3. UPDATE A DOCUMENT (Admin)
router.put('/:id', async (req, res) => {
  try {
    const updatedDoc = await SocietyDoc.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: "Failed to update document" });
  }
});

// 4. DELETE A DOCUMENT (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await SocietyDoc.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;