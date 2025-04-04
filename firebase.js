const admin = require("firebase-admin");
require("dotenv").config(); // Load environment variables

// Decode base64 string back to JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "your-project-id.appspot.com", // Replace with your actual bucket
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, storage };