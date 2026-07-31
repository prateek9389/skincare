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

async function seedAdminStats() {
  console.log("Starting seed admin stats process...");
  
  // Authenticate as Admin to allow Firestore writes
  try {
    console.log("Authenticating with Firebase...");
    await signInWithEmailAndPassword(auth, "auraadmin123@gmail.com", "auraadmin123");
    console.log("Authenticated successfully.");
  } catch (err) {
    console.error("Failed to authenticate:", err);
    process.exit(1);
  }

  const adminStats = {
    activeCustomers: 184,
    monthlyTarget: 84.2,
    revenueOffset: 12450.0,
    ordersOffset: 312,
    conversionRate: 2.8,
    bounceRate: 38.2,
    returnRate: 3.1,
    delivered7dOffset: 130, // Offset for delivered items in last 7 days
    avgDeliveryDays: 3.4,
    onTimeRate: 96,
    updatedAt: new Date().toISOString()
  };

  try {
    console.log("Saving admin/dashboardStats to Firestore...");
    await setDoc(doc(db, "admin", "dashboardStats"), adminStats);
    console.log("Admin stats successfully seeded!");
  } catch (err) {
    console.error("Failed to save admin stats:", err);
  }

  process.exit(0);
}

seedAdminStats().catch(console.error);
