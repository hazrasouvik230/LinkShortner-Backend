// const express = require("express");
// const router = express.Router();
// const LinkModel = require("../models/Link.Model");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

// // Generate a random short link
// const generateShortLink = async () => {
//   const shortLink = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character string
//   const existingLink = await LinkModel.findOne({ shortLink }); // Check for uniqueness
//   return existingLink ? generateShortLink() : shortLink;
// };

// // Middleware to authenticate user
// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// // Create a new link
// router.post("/", authenticate, async (req, res) => {
//   const { originalLink, remarks, expirationDate } = req.body;

//   try {
//     const shortLink = await generateShortLink(); // Generate a unique short link
//     const newLink = new LinkModel({
//       userId: req.userId,
//       originalLink,
//       shortLink,
//       remarks,
//       expirationDate,
//     });

//     await newLink.save();
//     res.status(201).json({ message: "Link created successfully", link: newLink });
//   } catch (error) {
//     console.error("Error creating link:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Periodic check to update expired links
// setInterval(async () => {
//   try {
//     const now = new Date();
//     const expiredLinks = await LinkModel.updateMany(
//       { expirationDate: { $lte: now }, status: "Active" },
//       { $set: { status: "Inactive" } }
//     );
//     console.log(`Expired links updated: ${expiredLinks.nModified}`);
//   } catch (error) {
//     console.error("Error updating expired links:", error);
//   }
// }, 60 * 1000); // Check every minute

// // Fetch all links for a user
// router.get("/", authenticate, async (req, res) => {
//   try {
//     const links = await LinkModel.find({ userId: req.userId });
//     res.status(200).json({ links });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Delete a specific link by ID
// router.delete("/:id", authenticate, async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Find the link by ID and verify that it belongs to the authenticated user
//     const link = await LinkModel.findOne({ _id: id, userId: req.userId });
//     if (!link) {
//       return res.status(404).json({ error: "Link not found or not authorized" });
//     }

//     // Delete the link
//     await LinkModel.deleteOne({ _id: id });
//     res.status(200).json({ message: "Link deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Log link click
// const getDeviceName = (userAgent) => {
//   if (/android/i.test(userAgent)) {
//     return "Android";
//   } else if (/iphone|ipad|ipod/i.test(userAgent)) {
//     return "iOS";
//   } else if (/windows/i.test(userAgent)) {
//     return "Windows";
//   } else if (/macintosh|mac os x/i.test(userAgent)) {
//     return "MacOS";
//   } else if (/linux/i.test(userAgent)) {
//     return "Linux";
//   } else if (/chrome/i.test(userAgent)) {
//     return "Chrome";
//   } else if (/firefox/i.test(userAgent)) {
//     return "Firefox";
//   } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
//     return "Safari";
//   } else {
//     return "Unknown Device";
//   }
// };

// router.post("/click/:id", async (req, res) => {
//   const { id } = req.params;
//   const userAgent = req.headers["user-agent"];
  
//   try {
//     const link = await LinkModel.findById(id);
//     if (!link) {
//       return res.status(404).json({ error: "Link not found" });
//     }

//     link.clicks += 1;
//     await link.save();

//     const device = getDeviceName(userAgent);

//     res.status(200).json({
//       message: "Click logged successfully",
//       originalLink: link.originalLink,
//       shortLink: link.shortLink,
//       clicks: link.clicks,
//       timestamp: new Date(),
//       ipAddress: req.ip,
//       userDevice: device,
//     });
//   } catch (error) {
//     console.error("Error logging click:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Update an existing link
// router.put("/:id", authenticate, async (req, res) => {
//   const { id } = req.params;
//   const { originalLink, remarks, expirationDate, status } = req.body;

//   try {
//     const updatedLink = await LinkModel.findByIdAndUpdate(
//       id,
//       { originalLink, remarks, expirationDate, status },
//       { new: true }
//     );

//     if (!updatedLink) {
//       return res.status(404).json({ error: "Link not found" });
//     }

//     res.status(200).json({ link: updatedLink });
//   } catch (error) {
//     console.error("Error updating link:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const LinkModel = require("../models/Link.Model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate a random short link
const generateShortLink = async () => {
  const shortLink = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character string
  const existingLink = await LinkModel.findOne({ shortLink }); // Check for uniqueness
  return existingLink ? generateShortLink() : shortLink;
};

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
  const { originalLink, remarks, expirationDate } = req.body;

  try {
    const shortLink = await generateShortLink(); // Generate a unique short link
    const newLink = new LinkModel({
      userId: req.userId,
      originalLink,
      shortLink,
      remarks,
      expirationDate,
    });

    await newLink.save();
    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    console.error("Error creating link:", error);
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

// Log link click
const getDeviceName = (userAgent) => {
  if (/android/i.test(userAgent)) {
    return "Android";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "iOS";
  } else if (/windows/i.test(userAgent)) {
    return "Windows";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    return "MacOS";
  } else if (/linux/i.test(userAgent)) {
    return "Linux";
  } else if (/chrome/i.test(userAgent)) {
    return "Chrome";
  } else if (/firefox/i.test(userAgent)) {
    return "Firefox";
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    return "Safari";
  } else {
    return "Unknown Device";
  }
};

router.post("/click/:id", async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers["user-agent"];
  
  try {
    const link = await LinkModel.findById(id);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    link.clicks += 1;
    await link.save();

    const device = getDeviceName(userAgent);

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (clientIp) {
      clientIp = clientIp.split(",")[0].trim(); // Get first IP in case of multiple
    }
    
    res.status(200).json({
      message: "Click logged successfully",
      originalLink: link.originalLink,
      shortLink: link.shortLink,
      clicks: link.clicks,
      timestamp: new Date(),
      ipAddress: clientIp,
      userDevice: device,
    });
  } catch (error) {
    console.error("Error logging click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an existing link
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { originalLink, remarks, expirationDate, status } = req.body;

  try {
    const updatedLink = await LinkModel.findByIdAndUpdate(
      id,
      { originalLink, remarks, expirationDate, status },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.status(200).json({ link: updatedLink });
  } catch (error) {
    console.error("Error updating link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;