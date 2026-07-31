import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
loadEnvConfig(process.cwd());

// Mock Data
export const PRODUCTS = [
  {
    id: "cream-cleanser",
    name: "Cream Cleanser",
    category: "Cleansers",
    description: "Gentle daily cleanser for all skin types",
    price: 32.00,
    image: "/cream-cleanser.png",
    ingredients: ["Salicylic acid", "Vitamin E"]
  },
  {
    id: "radiance-serum",
    name: "Radiance Serum",
    category: "Serums",
    description: "Brightening & hydrating vitamin C serum",
    price: 48.00,
    image: "/radiance-serum.png",
    ingredients: ["Vitamin C", "Hyaluronic acid"]
  },
  {
    id: "daily-moisturizer",
    name: "Daily Moisturizer",
    category: "Moisturizers",
    description: "Nourishing moisturizer for healthy skin barrier",
    price: 36.00,
    image: "/daily-moisturizer.png",
    ingredients: ["Hyaluronic acid", "Niacinamide"]
  },
  {
    id: "mineral-sunscreen",
    name: "Mineral Sunscreen",
    category: "Sun Care",
    description: "Broad spectrum SPF 50 for daily protection",
    price: 28.00,
    image: "/mineral-sunscreen.png",
    ingredients: ["Vitamin E"]
  },
  {
    id: "niacinamide-toner",
    name: "Niacinamide Toner",
    category: "Toners",
    description: "Pore refining & balancing daily toner",
    price: 26.00,
    image: "/niacinamide-toner.png",
    ingredients: ["Niacinamide", "Salicylic acid"]
  },
  {
    id: "jaluellicin-serum",
    name: "Jaluellicin Serum",
    category: "Serums",
    description: "Intense hydrating serum with hyaluronic acid",
    price: 20.00,
    image: "/category-serums.png",
    tag: "HIT",
    ingredients: ["Hyaluronic acid"]
  },
  {
    id: "noni-ointment",
    name: "Noni Eczema Treatment Ointment",
    category: "Body Care",
    description: "Soothing natural relief for eczema & skin rashes",
    price: 15.00,
    image: "/instagram-blue-jar.png",
    tag: "HIT",
    ingredients: ["Vitamin E"]
  },
  {
    id: "jaluellicin-cream",
    name: "Jaluellicin Cream",
    category: "Moisturizers",
    description: "Rich anti-aging treatment with pure retinol support",
    price: 35.00,
    image: "/category-moisturizers.png",
    tag: "HIT",
    ingredients: ["Retinol", "Hyaluronic acid"]
  },
  {
    id: "jaluellicin-eye",
    name: "Jaluellicin Eye Cream",
    category: "Eye & Lip Care",
    description: "Targeted smoothing cream for fine lines & puffiness",
    price: 20.00,
    image: "/instagram-hands-cream.png",
    ingredients: ["Retinol", "Vitamin E"]
  },
  {
    id: "premium-cbd-oil",
    name: "Premium CBD Oil",
    category: "Serums",
    description: "Calming face oil with active hemp botanical extracts",
    price: 25.00,
    image: "/radiance-serum.png",
    ingredients: ["Vitamin E"]
  },
  {
    id: "coconut-body-butter",
    name: "Coconut Body Butter",
    category: "Body Care",
    description: "Deeply moisturizing whipped body butter",
    price: 8.00,
    image: "/coconut-body-butter.png",
    ingredients: ["Lactic acid", "Vitamin E"]
  },
  {
    id: "peeling-gel",
    name: "Peeling Gel",
    category: "Cleansers",
    description: "Gentle exfoliating gel with natural AHAs",
    price: 20.00,
    image: "/category-cleansers.png",
    ingredients: ["Lactic acid", "Salicylic acid"]
  }
];

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
    return "";
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

async function seed() {
  console.log("Starting seed process...");
  
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

  for (const product of PRODUCTS) {
    console.log(`Processing product: ${product.name}`);
    
    // 1. Upload main image
    console.log(`Uploading ${product.image}...`);
    let mainImageUrl = "";
    try {
      mainImageUrl = await uploadImageToCloudinary(product.image);
    } catch (e) {
      console.error(`Failed to upload ${product.image}`, e);
    }
    
    // Upload extra slide images just to populate some nice defaults
    // Let's use some nice public images or reuse mainImageUrl
    const leftImage = mainImageUrl; // fallback
    const textureImage = "";
    
    // 2. Build Firestore product structure
    const firestoreProduct = {
      id: product.id,
      category: product.category,
      name: product.name,
      ingredients: product.ingredients || [],
      price: product.price,
      description: product.description,
      mainImage: mainImageUrl,
      textureImage: textureImage,
      carouselSlides: [
        { leftImage: mainImageUrl, rightImage: mainImageUrl, textLine1: "PURE", textLine2: "collection", textLine3: "BEAUTY" },
        { leftImage: mainImageUrl, rightImage: mainImageUrl, textLine1: "GLOW", textLine2: "daily ritual", textLine3: "SKIN" },
        { leftImage: mainImageUrl, rightImage: mainImageUrl, textLine1: "FRESH", textLine2: "botanicals", textLine3: "CARE" },
      ],
      bestSellerIds: [],
      bottomSection: {
        tags: ["beauty", "care"],
        title: "The " + product.category + " Ritual",
        description: product.description + " Experience true skin transformation.",
        image: mainImageUrl,
      },
      inventory: Math.floor(Math.random() * 150) + 10,
      gallery: [mainImageUrl, mainImageUrl, mainImageUrl, mainImageUrl],
      testimonials: [
        { name: "Sarah J.", rating: 5, text: `Absolutely love this ${product.name}! My skin has never looked better. It's now a staple in my routine.` },
        { name: "Emily R.", rating: 5, text: "I've tried so many products but this one truly delivers on its promises. Highly recommend it to everyone." },
        { name: "Jessica T.", rating: 4, text: "Very hydrating and feels luxurious. It took a few days to see results, but I'm very happy with it." },
        { name: "Amanda K.", rating: 5, text: "The texture is amazing. It sinks right in without leaving any greasy residue. A must-have!" },
        { name: "Lauren M.", rating: 5, text: `I get compliments on my glow all the time now. Thank you Aura for creating this ${product.category} gem.` },
      ]
    };

    // 3. Write to Firestore
    console.log(`Saving ${product.id} to Firestore...`);
    await setDoc(doc(db, "products", product.id), firestoreProduct);
    
    count++;
  }

  console.log(`Seeding complete! Successfully seeded ${count} products.`);
  process.exit(0);
}

seed().catch(console.error);
