const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const router = express.Router();

// Ensure public directories exist
const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExistence(path.join(__dirname, "../public/resume"));
ensureDirectoryExistence(path.join(__dirname, "../public/profile"));

// Multer storage configuration
const storage = multer.memoryStorage(); // Store file in memory buffer
const upload = multer({ storage: storage });

// Resume Upload Endpoint
router.post("/resume", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Invalid format. Only PDF allowed" });
  }

  const filename = `${uuidv4()}.pdf`;
  const filePath = path.join(__dirname, "../public/resume", filename);

  fs.writeFile(filePath, file.buffer, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Error while saving file" });
    }
    res.json({
      message: "File uploaded successfully",
      url: `/host/resume/${filename}`,
    });
  });
});

// Profile Image Upload Endpoint
router.post("/profile", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
    return res.status(400).json({ message: "Invalid format. Only JPG/PNG allowed" });
  }

  const ext = file.mimetype === "image/png" ? ".png" : ".jpg";
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(__dirname, "../public/profile", filename);

  fs.writeFile(filePath, file.buffer, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Error while saving file" });
    }
    res.json({
      message: "Profile image uploaded successfully",
      url: `/host/profile/${filename}`,
    });
  });
});

module.exports = router;
