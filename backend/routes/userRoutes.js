// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/DatabaseModels');

// 1. REGISTER A NEW USER
router.post('/register', async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = new User(req.body);
    await newUser.save();
    
    // We don't send the password back to the frontend for security!
    const { password, ...userWithoutPassword } = newUser._doc;
    res.status(201).json({ message: "User registered successfully", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists AND password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Login successful! Send user data back to React context
    const { password: userPass, ...userWithoutPassword } = user._doc;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// 3. GET ALL USERS (For Admin to see Resident List)
router.get('/', async (req, res) => {
  try {
    // .select('-password') ensures we NEVER send passwords to the frontend network tab
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 4. DELETE A USER (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// UPDATE A USER (Admin Only)
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Returns the newly updated document
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;