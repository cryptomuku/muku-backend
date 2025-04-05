const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { db, storage } = require("./firebase");
const multer = require("multer");

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: "https://muku-frontend.vercel.app", // Remove trailing slash
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Routes
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
  /* ... existing code ... */
});

app.delete("/api/posts/:id", async (req, res) => {
  /* ... existing code ... */
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});