import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const updates: any[] = [];
    
    productsSnapshot.forEach((document) => {
      const data = document.data();
      const basePrice = data.price || 0;
      
      const quantities = [
        { label: "25 ml", price: basePrice, image: data.mainImage },
        { label: "50 ml", price: Math.round(basePrice * 1.8), image: data.mainImage },
        { label: "100 ml", price: Math.round(basePrice * 3), image: data.mainImage }
      ];
      
      const productRef = doc(db, "products", document.id);
      updates.push(updateDoc(productRef, { quantities }));
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({ success: true, count: updates.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
