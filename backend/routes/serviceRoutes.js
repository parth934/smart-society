const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Parent/Child Schema right here to keep it safe!
const serviceSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., "Plumbing"
  contacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true }
    }
  ]
});

const LocalService = mongoose.models.LocalService || mongoose.model('LocalService', serviceSchema);

// 1. GET ALL SERVICES (Parent + Children)
router.get('/', async (req, res) => {
  try {
    const services = await LocalService.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// 2. CREATE A NEW PARENT CATEGORY (Admin)
router.post('/', async (req, res) => {
  try {
    const newCategory = new LocalService({ category: req.body.category, contacts: [] });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Failed to create category" });
  }
});

// 3. DELETE A PARENT CATEGORY (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await LocalService.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// 4. ADD A CHILD CONTACT TO A CATEGORY (Admin)
router.post('/:id/contacts', async (req, res) => {
  try {
    const service = await LocalService.findById(req.params.id);
    service.contacts.push({ name: req.body.name, phone: req.body.phone });
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ error: "Failed to add contact" });
  }
});

// 5. DELETE A CHILD CONTACT FROM A CATEGORY (Admin)
router.delete('/:categoryId/contacts/:contactId', async (req, res) => {
  try {
    const service = await LocalService.findById(req.params.categoryId);
    service.contacts = service.contacts.filter(c => c._id.toString() !== req.params.contactId);
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// 6. UPDATE A PARENT CATEGORY (Admin)
router.put('/:id', async (req, res) => {
  try {
    const updatedService = await LocalService.findByIdAndUpdate(
      req.params.id, 
      { category: req.body.category }, 
      { new: true }
    );
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// 7. UPDATE A CHILD CONTACT (Admin)
router.put('/:categoryId/contacts/:contactId', async (req, res) => {
  try {
    const service = await LocalService.findById(req.params.categoryId);
    
    // Find the exact contact in the array
    const contactIndex = service.contacts.findIndex(c => c._id.toString() === req.params.contactId);
    
    if (contactIndex > -1) {
      service.contacts[contactIndex].name = req.body.name;
      service.contacts[contactIndex].phone = req.body.phone;
      await service.save();
      res.status(200).json(service);
    } else {
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
});

module.exports = router;