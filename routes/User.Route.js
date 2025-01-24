const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, ph, password, confirmpassword } = req.body;

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Passwords must be 8 character long" });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const isExist = await UserModel.findOne({ email });
    if (isExist) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      name,
      email,
      ph,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({
        message: "User registered successfully",
        id: newUser._id,
        token,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user info route
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("name email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout route
router.post("/logout", async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;