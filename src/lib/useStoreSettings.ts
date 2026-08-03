import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface StoreSettings {
  brandName: string;
  currency: string;
  supportEmail: string;
  promoText: string;
  footerBrandDescription: string;
  footerShopLinks: string;
  footerCollectionsLinks: string;
  footerAboutLinks: string;
  footerHelpLinks: string;
  footerSocialInstagram: string;
  footerSocialPinterest: string;
  footerSocialTiktok: string;
  freeShippingThreshold: number;
  standardShippingRate: number;
}

const defaultSettings: StoreSettings = {
  brandName: "AURA Skincare",
  currency: "INR (₹)",
  supportEmail: "support@auraskincare.com",
  promoText: "FREE SHIPPING ON ORDERS OVER ₹499",
  footerBrandDescription: "Elevated skincare made with clean ingredients and backed by science. We build routines to empower your skin.",
  footerShopLinks: "All Products|#\nBestsellers|#\nNew Arrivals|#\nSets & Kits|#\nGift Cards|#",
  footerCollectionsLinks: "Hydration|#\nBrightening|#\nAnti-Aging|#\nSensitive Skin|#\nClear Skin|#",
  footerAboutLinks: "Our Story|#\nIngredients|#\nSustainability|#\nPress|#\nCareers|#",
  footerHelpLinks: "FAQ|#\nShipping & Returns|#\nTrack Order|#\nContact Us|#\nPrivacy Policy|#",
  footerSocialInstagram: "#",
  footerSocialPinterest: "#",
  footerSocialTiktok: "#",
  freeShippingThreshold: 499,
  standardShippingRate: 50,
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
        try {
          setDoc(docRef, defaultSettings, { merge: true });
        } catch(e) {
          console.error("Could not initialize default settings:", e);
        }
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to store settings:", error);
      // Gracefully fallback to default settings on permission error
      setSettings(defaultSettings);
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
