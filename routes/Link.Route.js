const express = require("express");
const router = express.Router();
const LinkModel = require("../models/Link.Model");
const jwt = require("jsonwebtoken");

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Create a new link
router.post("/", authenticate, async (req, res) => {
  const { originalLink, shortLink, remarks, expirationDate } = req.body;
  try {
    const newLink = new LinkModel({
      userId: req.userId,
      originalLink,
      shortLink,
      remarks,
      expirationDate
    });
    await newLink.save();
    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Periodic check to update expired links
setInterval(async () => {
  try {
    const now = new Date();
    const expiredLinks = await LinkModel.updateMany(
      { expirationDate: { $lte: now }, status: "Active" },
      { $set: { status: "Inactive" } }
    );
    console.log(`Expired links updated: ${expiredLinks.nModified}`);
  } catch (error) {
    console.error("Error updating expired links:", error);
  }
}, 60 * 1000); // Check every minute

// Fetch all links for a user
router.get("/", authenticate, async (req, res) => {
  try {
    const links = await LinkModel.find({ userId: req.userId });
    res.status(200).json({ links });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific link by ID
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the link by ID and verify that it belongs to the authenticated user
    const link = await LinkModel.findOne({ _id: id, userId: req.userId });
    if (!link) {
      return res.status(404).json({ error: "Link not found or not authorized" });
    }

    // Delete the link
    await LinkModel.deleteOne({ _id: id });
    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
