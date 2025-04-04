const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { db, storage } = require("./firebase");
const multer = require("multer");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory before uploading to Firebase
});

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Get All Posts
app.get("/api/posts", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Post with Image
app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log request data
    console.log("File:", req.file); // Log uploaded file
    const { title, paragraph, link } = req.body;
    let imageUrl = "";

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const fileRef = storage.bucket().file(`images/${fileName}`);
      await fileRef.save(req.file.buffer, { contentType: req.file.mimetype });
      imageUrl = await fileRef.getSignedUrl({ action: "read", expires: "03-09-2491" });
      imageUrl = imageUrl[0];
    }

    const postData = { title, paragraph, image: imageUrl, link };
    const docRef = await db.collection("posts").add(postData);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error("Error in /api/posts:", error); // Log error
    res.status(500).json({ error: error.message });
  }
});

// Delete Post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("posts").doc(id).delete();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});