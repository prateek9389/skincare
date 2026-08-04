"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FirestoreProduct } from "./ProductManager";

export default function HeroManager({ searchQuery = "" }: { searchQuery?: string }) {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Aesthetics");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const tabs = ["Aesthetics", "Comfort", "Care"];

  useEffect(() => {
    setIsLoading(true);
    const unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const prods = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as FirestoreProduct));
        setProducts(prods);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to listen to products:", error);
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const addProductToCategory = async (prod: FirestoreProduct) => {
    try {
      const prodRef = doc(db, "products", prod.id);
      await setDoc(prodRef, { isFeatured: true, heroCategory: activeTab }, { merge: true });
      setIsAddModalOpen(false);
      setModalSearchQuery("");
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    }
  };

  const removeProduct = async (prod: FirestoreProduct) => {
    try {
      const prodRef = doc(db, "products", prod.id);
      await setDoc(prodRef, { isFeatured: false }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Failed to remove product.");
    }
  };

  const featuredInActiveTab = products.filter(p => p.isFeatured && p.heroCategory === activeTab);
  const availableToAdd = products.filter(p => !p.isFeatured && p.name.toLowerCase().includes(modalSearchQuery.toLowerCase()));

  if (isLoading) {
    return <div className="p-8 text-sm text-[#00A896] uppercase tracking-widest animate-pulse">Loading hero settings...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border border-[#B0B7C3] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-[#B0B7C3] pb-4">
          <div>
            <h3 className="font-serif text-xl text-[#0D3C6A]">Hero Products</h3>
            <p className="text-xs text-[#00A896]">Manage products shown in the homepage video carousel.</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#0D3C6A] text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
            + Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-[#0D3C6A] text-white shadow-md" : "bg-[#FAF6F0] text-[#00A896] border border-[#B0B7C3] hover:border-[#0D3C6A] hover:text-[#0D3C6A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid for active tab */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[200px]">
          <AnimatePresence>
            {featuredInActiveTab.map((p, idx) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }} 
                className="relative bg-[#FAF6F0] rounded-2xl border border-[#B0B7C3] overflow-hidden group p-4 flex flex-col items-center"
              >
                <button 
                  onClick={() => removeProduct(p)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white"
                  title="Remove from Hero"
                >
                  &times;
                </button>
                <div className="relative w-full aspect-square bg-white rounded-xl mb-3 overflow-hidden border border-[#B0B7C3]">
                  {p.mainImage ? (
                    <Image data-pin-nopin="true" src={p.mainImage} alt={p.name} fill className="object-contain p-2" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-[10px] text-[#00A896]">No Image</div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-[#0D3C6A] text-center line-clamp-1">{p.name}</h4>
                <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-1">Featured in {activeTab}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {featuredInActiveTab.length === 0 && (
            <div className="col-span-full p-8 text-center text-xs text-[#00A896] border border-dashed border-[#B0B7C3] rounded-2xl bg-[#FAF6F0] flex flex-col items-center justify-center">
              <span className="text-2xl mb-2 block">ðŸ“­</span>
              No products currently featured in {activeTab}.<br/> Click "+ Add Product" to add one.
            </div>
          )}
        </div>
      </section>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#B0B7C3] pb-4 mb-4">
              <h3 className="font-serif text-xl text-[#0D3C6A]">Add Product to {activeTab}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF6F0] text-[#00A896] border border-[#B0B7C3] hover:bg-[#0D3C6A] hover:text-white transition-colors">&times;</button>
            </div>
            
            <input 
              type="text" 
              placeholder="Search available products..." 
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#0D3C6A] mb-6"
            />
            
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableToAdd.map((p, idx) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.05 }} className="relative bg-white rounded-2xl border border-[#B0B7C3] hover:border-[#0D3C6A] overflow-hidden group p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md" onClick={() => addProductToCategory(p)}>
                    <div className="relative w-12 h-12 rounded-lg bg-[#FAF6F0] border border-[#B0B7C3] overflow-hidden shrink-0">
                      {p.mainImage && <Image data-pin-nopin="true" src={p.mainImage} alt={p.name} fill className="object-contain p-1" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-semibold text-[#0D3C6A] line-clamp-1">{p.name}</h4>
                      <p className="text-[9px] text-[#00A896] uppercase tracking-widest">{p.category}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-[#B0B7C3] text-[#BCAE9E] flex items-center justify-center group-hover:bg-[#0D3C6A] group-hover:border-[#0D3C6A] group-hover:text-white transition-colors text-lg pb-0.5 shrink-0">
                      +
                    </div>
                  </motion.div>
                ))}
                {availableToAdd.length === 0 && (
                  <div className="col-span-full p-8 text-center text-xs text-[#00A896]">
                    No available products found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
