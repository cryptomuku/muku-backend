const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { db, storage } = require("./firebase");
const multer = require("multer");

dotenv.config();
const app = express();

app.use(cors({ origin: "https://muku-frontend.vercel.app" }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    console.log("Received POST /api/posts:", req.body, req.file);
    const { title, paragraph, link } = req.body;
    let imageUrl = "";

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      console.log("Uploading image:", fileName);
      const fileRef = storage.bucket().file(`images/${fileName}`);
      await fileRef.save(req.file.buffer, { contentType: req.file.mimetype });
      imageUrl = await fileRef.getSignedUrl({ action: "read", expires: "03-09-2491" });
      imageUrl = imageUrl[0];
      console.log("Image URL:", imageUrl);
    }

    const postData = { title, paragraph, image: imageUrl, link };
    console.log("Saving to Firestore:", postData);
    const docRef = await db.collection("posts").add(postData);
    console.log("Post saved with ID:", docRef.id);
    res.status(201).json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error("Error in /api/posts POST:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received DELETE /api/posts/:id:", id);
    await db.collection("posts").doc(id).delete();
    console.log("Post deleted with ID:", id);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Error in /api/posts DELETE:", error);
    res.status(500).json({ error: error.message });
  }
});

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});