const express = require("express");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const axios = require("axios"); // Add axios for REST API calls

const router = express.Router();

// Path to the service account key JSON file
const serviceAccountPath = "C:\\Users\\nadin\\VS Projects\\versammlungsassistent\\Versammlungsassistent\\backend\\src\\main\\resources\\gesellschafter-assistent-firebase-adminsdk-fbsvc-501c1862fd.json";

// Initialize Firebase Admin SDK only if it hasn't been initialized already
if (!getApps().length) {
  initializeApp({
    credential: require("firebase-admin").credential.cert(serviceAccountPath),
  });
}

const FIREBASE_API_KEY = "AIzaSyAaaceQCMb6V1FoBMxFaKY6wD12Ctv1LIo"; // Replace with your Firebase Web API Key

router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use Firebase Authentication REST API to verify email and password
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId } = response.data;

    // Optionally, generate a custom token using Firebase Admin SDK
    const customToken = await getAuth().createCustomToken(localId);

    res.status(200).json({ idToken, customToken });
  } catch (error) {
    console.error("Authentication error:", error.response?.data || error.message);
    res.status(401).send("Authentication failed");
  }
});

module.exports = router;
