import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

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

// Cloudinary Setup
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadImageToCloudinary(localPath: string) {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary missing config");
  }

  const fullPath = path.join(process.cwd(), "public", localPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Warning: File not found ${fullPath}`);
    return localPath; // fallback to local path
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append("file", blob, path.basename(localPath));
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData as any,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to upload image");
  }

  return data.secure_url;
}

const CATEGORIES = [
  { name: "Cleansers", image: "/category-cleansers.png", description: "Gentle and effective cleansers for all skin types." },
  { name: "Serums", image: "/category-serums.png", description: "Targeted serums for brightening and hydration." },
  { name: "Moisturizers", image: "/category-moisturizers.png", description: "Rich and nourishing moisturizers for healthy skin." },
  { name: "Sun Care", image: "/mineral-sunscreen.png", description: "Broad spectrum SPF protection for daily use." },
  { name: "Toners", image: "/niacinamide-toner.png", description: "Balancing and refining toners." },
  { name: "Sets & Kits", image: "/hero-products.png", description: "Curated collections of our best sellers." },
  { name: "New Arrivals", image: "/coconut-body-butter.png", description: "The latest additions to our skincare line." },
];

async function seed() {
  console.log("Starting category seed process...");
  
  // Authenticate as Admin to allow Firestore writes
  try {
    console.log("Authenticating with Firebase...");
    await signInWithEmailAndPassword(auth, "auraadmin123@gmail.com", "auraadmin123");
    console.log("Authenticated successfully.");
  } catch (err) {
    console.error("Failed to authenticate:", err);
    process.exit(1);
  }

  let count = 0;

  for (const category of CATEGORIES) {
    console.log(`Processing category: ${category.name}`);
    
    // Upload image
    console.log(`Uploading ${category.image}...`);
    let imageUrl = category.image;
    try {
      imageUrl = await uploadImageToCloudinary(category.image);
    } catch (e) {
      console.error(`Failed to upload ${category.image}`, e);
    }
    
    const id = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    const firestoreCategory = {
      name: category.name,
      description: category.description,
      image: imageUrl,
      updatedAt: new Date()
    };

    console.log(`Saving ${id} to Firestore...`);
    await setDoc(doc(db, "categories", id), firestoreCategory);
    count++;
  }

  console.log(`Seeding complete! Successfully seeded ${count} categories.`);
  process.exit(0);
}

seed().catch(console.error);
