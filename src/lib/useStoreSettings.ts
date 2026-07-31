import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface StoreSettings {
  brandName: string;
  currency: string;
  supportEmail: string;
  promoText: string;
}

const defaultSettings: StoreSettings = {
  brandName: "AURA Skincare",
  currency: "INR (₹)",
  supportEmail: "support@auraskincare.com",
  promoText: "FREE SHIPPING ON ORDERS OVER ₹499",
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "storeConfig");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      } else {
        // Initialize with default settings if it doesn't exist
        setDoc(docRef, defaultSettings, { merge: true });
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to store settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const docRef = doc(db, "settings", "storeConfig");
      await setDoc(docRef, newSettings, { merge: true });
    } catch (error) {
      console.error("Error updating store settings:", error);
      throw error;
    }
  };

  return { settings, loading, updateSettings };
}
