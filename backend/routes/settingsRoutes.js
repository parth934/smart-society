const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// We define the Setting schema right here to keep it simple!
const settingSchema = new mongoose.Schema({
  type: { type: String, default: 'global' },
  maintenanceAmount: { type: Number, default: 0 }
});

// If the model exists, use it. If not, create it.
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

// 1. GET THE FIXED AMOUNT
router.get('/maintenance', async (req, res) => {
  try {
    let settings = await Setting.findOne({ type: 'global' });
    // If admin hasn't set it yet, create a default of 0
    if (!settings) {
      settings = await Setting.create({ type: 'global', maintenanceAmount: 0 });
    }
    res.json({ amount: settings.maintenanceAmount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. ADMIN UPDATES THE FIXED AMOUNT
router.post('/maintenance', async (req, res) => {
  try {
    const updatedSetting = await Setting.findOneAndUpdate(
      { type: 'global' },
      { maintenanceAmount: req.body.amount },
      { new: true, upsert: true } // Upsert means "Update if it exists, insert if it doesn't"
    );
    res.json({ amount: updatedSetting.maintenanceAmount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;