import { loadEnvConfig } from '@next/env';
import { fileURLToPath } from 'url';

// Load .env.local
loadEnvConfig(process.cwd());

// Firebase Setup
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seedShippingZones() {
  console.log("Starting seed shipping zones process...");
  
  // Authenticate as Admin to allow Firestore writes
  try {
    console.log("Authenticating with Firebase...");
    await signInWithEmailAndPassword(auth, "auraadmin123@gmail.com", "auraadmin123");
    console.log("Authenticated successfully.");
  } catch (err) {
    console.error("Failed to authenticate:", err);
    process.exit(1);
  }

  const shippingZones = [
    { id: "domestic-us", zone: "Domestic (US)", std: "Free", exp: "₹15", cov: "All 50 states" },
    { id: "europe", zone: "Europe", std: "₹8", exp: "₹22", cov: "EU + UK" },
    { id: "asia-pacific", zone: "Asia Pacific", std: "₹12", exp: "₹28", cov: "IN, SG, AU, JP" },
    { id: "rest-of-world", zone: "Rest of World", std: "₹18", exp: "₹40", cov: "Selected countries" },
  ];

  try {
    for (const z of shippingZones) {
      await setDoc(doc(db, "shippingZones", z.id), z);
      console.log(`Seeded shipping zone: ${z.zone}`);
    }
    console.log("Shipping zones successfully seeded!");
  } catch (err) {
    console.error("Failed to save shipping zones:", err);
  }

  process.exit(0);
}

seedShippingZones().catch(console.error);
