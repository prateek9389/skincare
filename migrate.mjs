import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwaBvMoN7DcTLupkTRKqJLyAjE1ctFews",
  authDomain: "gunalife-af57e.firebaseapp.com",
  projectId: "gunalife-af57e",
  storageBucket: "gunalife-af57e.firebasestorage.app",
  messagingSenderId: "559866546455",
  appId: "1:559866546455:web:4529881cf5bc00f14acf52",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Starting migration...");
  const snap = await getDocs(collection(db, "products"));
  for (const document of snap.docs) {
    const data = document.data();
    const basePrice = data.price || 0;
    
    const quantities = [
      { label: "25ml", price: basePrice, image: data.mainImage },
      { label: "50ml", price: Math.round(basePrice * 1.8), image: data.mainImage },
      { label: "100ml", price: Math.round(basePrice * 3), image: data.mainImage }
    ];
    
    console.log(`Updating ${document.id}...`);
    await updateDoc(doc(db, "products", document.id), { quantities });
  }
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
