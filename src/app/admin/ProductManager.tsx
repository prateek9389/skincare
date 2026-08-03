"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Types
export interface FirestoreProduct {
  id: string;
  category: string;
  name: string;
  ingredients: string[];
  price: number;
  description: string;
  mainImage: string;
  textureImage: string;
  carouselSlides: Array<{
    leftImage: string;
    rightImage: string;
    textLine1: string;
    textLine2: string;
    textLine3: string;
  }>;
  bestSellerIds: string[];
  bottomSection: {
    tags: string[];
    title: string;
    description: string;
    image: string;
  };
  inventory: number;
  testimonials: Array<{
    name: string;
    rating: number;
    text: string;
  }>;
  gallery: string[];
  isFeatured?: boolean;
  heroCategory?: string;
  quantities?: { label: string; price: number; image?: string }[];
  _ingredientsString?: string;
}

const defaultProduct: FirestoreProduct = {
  id: "",
  category: "Skincare",
  name: "",
  ingredients: [],
  price: 0,
  description: "",
  mainImage: "",
  textureImage: "",
  carouselSlides: [
    { leftImage: "", rightImage: "", textLine1: "", textLine2: "", textLine3: "" },
    { leftImage: "", rightImage: "", textLine1: "", textLine2: "", textLine3: "" },
    { leftImage: "", rightImage: "", textLine1: "", textLine2: "", textLine3: "" },
  ],
  bestSellerIds: [],
  bottomSection: {
    tags: [],
    title: "",
    description: "",
    image: "",
  },
  inventory: 100,
  testimonials: [],
  gallery: [],
  isFeatured: false,
  heroCategory: "Aesthetics",
  quantities: [],
};

const ImageUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-16 h-16 rounded-xl border border-[#B0B7C3] overflow-hidden bg-[#FAF6F0]">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer flex items-center justify-center w-full px-4 py-3 bg-[#FAF6F0] border border-dashed border-[#BCAE9E] rounded-xl hover:bg-[#F5F0E6] transition-colors">
            <span className="text-xs text-[#00A896] font-semibold tracking-wider">
              {isUploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
            </span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default function ProductManager({ searchQuery = "" }: { searchQuery?: string }) {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<FirestoreProduct>(defaultProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredByCategory = categoryFilter === "All" ? products : products.filter(p => p.category === categoryFilter);
  const filteredProducts = filteredByCategory.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const prodId = currentProduct.id || generateSlug(currentProduct.name);
      if (!prodId) {
        alert("Please enter a product name first.");
        return;
      }
      
      const prodToSave = { 
        ...currentProduct, 
        id: prodId,
        price: Number(currentProduct.price) || 0,
        inventory: Number(currentProduct.inventory) || 0
      };
      await setDoc(doc(db, "products", prodId), prodToSave);
      
      alert("Product saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (prod: FirestoreProduct) => {
    try {
      const prodRef = doc(db, "products", prod.id);
      await setDoc(prodRef, { isFeatured: !prod.isFeatured }, { merge: true });
      // Optimistically update local state instead of re-fetching everything
      setProducts(products.map(p => p.id === prod.id ? { ...p, isFeatured: !prod.isFeatured } : p));
    } catch (err) {
      console.error(err);
      alert("Failed to update featured status.");
    }
  };

  const openEditor = (prod?: FirestoreProduct) => {
    setCurrentProduct(prod || { ...defaultProduct });
    setIsEditing(true);
  };

  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate");
      }

      const generatedData = await res.json();
      
      // Merge with current product
      setCurrentProduct(prev => ({
        ...prev,
        name: generatedData.name || prev.name,
        category: generatedData.category || prev.category,
        price: generatedData.price || prev.price,
        inventory: generatedData.inventory || prev.inventory,
        ingredients: generatedData.ingredients || prev.ingredients,
        description: generatedData.description || prev.description,
        carouselSlides: prev.carouselSlides.map((slide, i) => ({
          ...slide,
          textLine1: generatedData.carouselSlides?.[i]?.textLine1 || slide.textLine1,
          textLine2: generatedData.carouselSlides?.[i]?.textLine2 || slide.textLine2,
          textLine3: generatedData.carouselSlides?.[i]?.textLine3 || slide.textLine3,
        })),
        bottomSection: {
          ...prev.bottomSection,
          ...(generatedData.bottomSection || {})
        }
      }));
      
      setIsAiModalOpen(false);
      setAiPrompt("");
      alert("Product details generated successfully! Please review the fields and add images.");
    } catch (err: any) {
      console.error(err);
      alert("AI Generation failed: " + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-sm text-[#00A896] uppercase tracking-widest animate-pulse">Loading products...</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-[#B0B7C3] rounded-3xl p-8 shadow-sm relative">
        <div className="flex justify-between items-center mb-8 border-b border-[#B0B7C3] pb-4">
          <h2 className="font-serif text-2xl text-[#0D3C6A]">{currentProduct.id ? "Edit Product" : "Create Product"}</h2>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 bg-[#FAF6F0] text-[#00A896] border border-[#B0B7C3] hover:border-[#00A896] hover:shadow-md px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="aiSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>
                <path d="M10.5 2L12 8L18 9.5L12 11L10.5 17L9 11L3 9.5L9 8L10.5 2Z" fill="url(#aiSparkle)"/>
                <path d="M18.5 14L19.25 16.5L22 17.25L19.25 18L18.5 20.5L17.75 18L15 17.25L17.75 16.5L18.5 14Z" fill="url(#aiSparkle)"/>
                <path d="M4.5 16L5 17.5L6.5 18L5 18.5L4.5 20L4 18.5L2.5 18L4 17.5L4.5 16Z" fill="url(#aiSparkle)"/>
              </svg>
              Auto-Fill with AI
            </button>
            <button onClick={() => setIsEditing(false)} className="text-xs text-[#00A896] hover:text-[#0D3C6A] uppercase tracking-widest font-bold">
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          {/* 1. Basic Info */}
          <section className="space-y-6">
            <h3 className="font-serif text-lg border-b border-[#B0B7C3] pb-2 text-[#00A896]">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Name</label>
                <input required type="text" value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Category</label>
                <input required type="text" value={currentProduct.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Price</label>
                <input required type="number" step="0.01" value={currentProduct.price === 0 && currentProduct.name === "" ? "" : currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value as any })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Inventory (Stock Count)</label>
                <input required type="number" min="0" value={currentProduct.inventory === 0 && currentProduct.name === "" ? "" : currentProduct.inventory} onChange={(e) => setCurrentProduct({ ...currentProduct, inventory: e.target.value as any })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Ingredients (comma separated)</label>
                <input type="text" value={(currentProduct as any)._ingredientsString ?? currentProduct.ingredients.join(", ")} onChange={(e) => setCurrentProduct({ ...currentProduct, _ingredientsString: e.target.value, ingredients: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" placeholder="Hyaluronic Acid, Vitamin C" />
              </div>
            </div>

            <div className="mt-6 border-t border-[#B0B7C3] pt-6">
              <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Multi-Pack Pricing (Optional)</label>
              <p className="text-[10px] text-[#00A896] mb-4">Quickly add standard multi-pack options. Entering a price will automatically add it to the product.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[2, 3, 4].map(num => {
                  const label = `Pack of ${num}`;
                  const existingQty = currentProduct.quantities?.find(q => q.label === label);
                  return (
                    <div key={num} className="bg-[#FAF6F0] p-4 rounded-xl border border-[#B0B7C3] flex flex-col gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">{label} Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={existingQty?.price || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            let newQ = [...(currentProduct.quantities || [])];
                            if (isNaN(val) || val <= 0) {
                              newQ = newQ.filter(q => q.label !== label);
                            } else {
                              const existing = newQ.find(q => q.label === label);
                              if (existing) existing.price = val;
                              else newQ.push({ label, price: val });
                            }
                            setCurrentProduct({ ...currentProduct, quantities: newQ });
                          }}
                          className="w-full px-3 py-2 bg-white border border-[#B0B7C3] rounded-lg text-xs focus:outline-none focus:border-[#0D3C6A]"
                          placeholder="Leave blank to disable"
                        />
                      </div>
                      {existingQty && (
                        <div className="border-t border-[#BCAE9E] pt-3">
                          <ImageUpload
                            label={`${label} Image`}
                            value={existingQty.image || ""}
                            onChange={(url) => {
                              let newQ = [...(currentProduct.quantities || [])];
                              const existing = newQ.find(q => q.label === label);
                              if (existing) {
                                existing.image = url;
                                setCurrentProduct({ ...currentProduct, quantities: newQ });
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center mb-4 pt-4 border-t border-[#B0B7C3]/50">
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest">Custom Size / Quantity Options</label>
                  <p className="text-[10px] text-[#00A896] mt-1">Add custom options like "50ml", "100ml".</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentProduct(prev => ({ ...prev, quantities: [...(prev.quantities || []), { label: "", price: 0 }] }))}
                  className="bg-[#0D3C6A] text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                  + Add Option
                </button>
              </div>
              
              <div className="space-y-3">
                {currentProduct.quantities?.map((qty, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#FAF6F0] p-3 rounded-xl border border-[#B0B7C3]">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Label (e.g., 50ml)</label>
                      <input 
                        type="text" 
                        value={qty.label}
                        onChange={(e) => {
                          const newQ = [...(currentProduct.quantities || [])];
                          newQ[idx].label = e.target.value;
                          setCurrentProduct({ ...currentProduct, quantities: newQ });
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#B0B7C3] rounded-lg text-xs focus:outline-none focus:border-[#0D3C6A]" 
                        placeholder="e.g. 50ml"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Price</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={qty.price}
                        onChange={(e) => {
                          const newQ = [...(currentProduct.quantities || [])];
                          newQ[idx].price = parseFloat(e.target.value) || 0;
                          setCurrentProduct({ ...currentProduct, quantities: newQ });
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#B0B7C3] rounded-lg text-xs focus:outline-none focus:border-[#0D3C6A]" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newQ = [...(currentProduct.quantities || [])];
                        newQ.splice(idx, 1);
                        setCurrentProduct({ ...currentProduct, quantities: newQ });
                      }}
                      className="mt-4 w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#B0B7C3] pt-6">
              <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Description</label>
              <textarea required value={currentProduct.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E] min-h-[100px]" />
            </div>

            <div className="md:col-span-2 mt-4 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0D3C6A] uppercase tracking-widest">Featured Product (Home Page Video)</label>
                <p className="text-[10px] text-[#00A896] mt-1">Check this to display this product inside the glass card over the main video on the homepage.</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {currentProduct.isFeatured && (
                  <select
                    value={currentProduct.heroCategory || "Aesthetics"}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, heroCategory: e.target.value })}
                    className="flex-grow sm:flex-grow-0 bg-white border border-[#B0B7C3] text-[10px] text-[#0D3C6A] uppercase tracking-widest font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-[#0D3C6A]"
                  >
                    <option value="Aesthetics">Aesthetics</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Care">Care</option>
                  </select>
                )}
                <input 
                  type="checkbox" 
                  checked={currentProduct.isFeatured || false} 
                  onChange={(e) => setCurrentProduct({ ...currentProduct, isFeatured: e.target.checked, heroCategory: e.target.checked ? (currentProduct.heroCategory || "Aesthetics") : currentProduct.heroCategory })}
                  className="w-5 h-5 accent-[#0D3C6A] cursor-pointer shrink-0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <ImageUpload label="Main Product Image" value={currentProduct.mainImage} onChange={(url) => setCurrentProduct({ ...currentProduct, mainImage: url })} />
              <ImageUpload label="Texture/Smear Image (Center Section)" value={currentProduct.textureImage} onChange={(url) => setCurrentProduct({ ...currentProduct, textureImage: url })} />
            </div>
          </section>

          {/* 2. Carousel */}
          <section className="space-y-6">
            <h3 className="font-serif text-lg border-b border-[#B0B7C3] pb-2 text-[#00A896]">2. Header Carousel (3 Slides)</h3>
            <div className="space-y-8">
              {currentProduct.carouselSlides.map((slide, idx) => (
                <div key={idx} className="bg-[#FAF6F0]/50 p-6 rounded-2xl border border-[#B0B7C3] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#0D3C6A]">Slide {idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload label="Left Model Image" value={slide.leftImage} onChange={(url) => {
                      const newSlides = [...currentProduct.carouselSlides];
                      newSlides[idx].leftImage = url;
                      setCurrentProduct({ ...currentProduct, carouselSlides: newSlides });
                    }} />
                    <ImageUpload label="Right Product Image" value={slide.rightImage} onChange={(url) => {
                      const newSlides = [...currentProduct.carouselSlides];
                      newSlides[idx].rightImage = url;
                      setCurrentProduct({ ...currentProduct, carouselSlides: newSlides });
                    }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Line 1 (e.g. GLASSY)" value={slide.textLine1} onChange={(e) => {
                      const newSlides = [...currentProduct.carouselSlides];
                      newSlides[idx].textLine1 = e.target.value;
                      setCurrentProduct({ ...currentProduct, carouselSlides: newSlides });
                    }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm" />
                    <input type="text" placeholder="Line 2 (e.g. new collection)" value={slide.textLine2} onChange={(e) => {
                      const newSlides = [...currentProduct.carouselSlides];
                      newSlides[idx].textLine2 = e.target.value;
                      setCurrentProduct({ ...currentProduct, carouselSlides: newSlides });
                    }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm" />
                    <input type="text" placeholder="Line 3 (e.g. SKIN)" value={slide.textLine3} onChange={(e) => {
                      const newSlides = [...currentProduct.carouselSlides];
                      newSlides[idx].textLine3 = e.target.value;
                      setCurrentProduct({ ...currentProduct, carouselSlides: newSlides });
                    }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Bestsellers */}
          <section className="space-y-6">
            <h3 className="font-serif text-lg border-b border-[#B0B7C3] pb-2 text-[#00A896]">3. Best Sellers Selection</h3>
            <div>
              <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Select up to 4 Best Sellers to display</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {products.filter(p => p.id !== currentProduct.id).map(p => (
                  <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${currentProduct.bestSellerIds.includes(p.id) ? "bg-[#0D3C6A] border-black text-white" : "bg-[#FAF6F0] border-[#B0B7C3] text-[#0D3C6A] hover:border-[#BCAE9E]"}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={currentProduct.bestSellerIds.includes(p.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let newIds = [...currentProduct.bestSellerIds];
                        if (isChecked) {
                          if (newIds.length < 4) newIds.push(p.id);
                          else alert("You can only select up to 4 best sellers.");
                        } else {
                          newIds = newIds.filter(id => id !== p.id);
                        }
                        setCurrentProduct({ ...currentProduct, bestSellerIds: newIds });
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{p.name}</p>
                    </div>
                  </label>
                ))}
                {products.length <= 1 && <p className="text-xs text-[#00A896] col-span-full">Not enough products to select bestsellers. Create more products first.</p>}
              </div>
            </div>
          </section>

          {/* 4. Bottom Section */}
          <section className="space-y-6">
            <h3 className="font-serif text-lg border-b border-[#B0B7C3] pb-2 text-[#00A896]">4. Bottom Section (Footer Panel)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Title</label>
                  <input type="text" value={currentProduct.bottomSection.title} onChange={(e) => setCurrentProduct({ ...currentProduct, bottomSection: { ...currentProduct.bottomSection, title: e.target.value }})} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={currentProduct.bottomSection.description} onChange={(e) => setCurrentProduct({ ...currentProduct, bottomSection: { ...currentProduct.bottomSection, description: e.target.value }})} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E] min-h-[80px]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Tags (comma separated)</label>
                  <input type="text" value={currentProduct.bottomSection.tags.join(", ")} onChange={(e) => setCurrentProduct({ ...currentProduct, bottomSection: { ...currentProduct.bottomSection, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }})} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" placeholder="beauty, care, comfort" />
                </div>
              </div>
              <div>
                <ImageUpload label="Side Image" value={currentProduct.bottomSection.image} onChange={(url) => setCurrentProduct({ ...currentProduct, bottomSection: { ...currentProduct.bottomSection, image: url }})} />
              </div>
            </div>
          </section>

          {/* 5. Product Gallery */}
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-[#B0B7C3] pb-2">
              <h3 className="font-serif text-lg text-[#00A896]">5. Product Gallery</h3>
              <button type="button" onClick={() => setCurrentProduct({ ...currentProduct, gallery: [...(currentProduct.gallery || []), ""] })} className="text-[10px] font-bold uppercase tracking-widest text-[#BCAE9E] hover:text-[#0D3C6A] transition-colors">+ Add Image</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(currentProduct.gallery || []).map((img, idx) => (
                <div key={idx} className="relative bg-[#FAF6F0]/50 p-4 rounded-2xl border border-[#B0B7C3] group">
                  <button type="button" onClick={() => {
                    const newGallery = [...currentProduct.gallery];
                    newGallery.splice(idx, 1);
                    setCurrentProduct({ ...currentProduct, gallery: newGallery });
                  }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10 hover:bg-red-500 hover:text-white">&times;</button>
                  <ImageUpload label={`Gallery Image ${idx + 1}`} value={img} onChange={(url) => {
                    const newGallery = [...currentProduct.gallery];
                    newGallery[idx] = url;
                    setCurrentProduct({ ...currentProduct, gallery: newGallery });
                  }} />
                </div>
              ))}
              {(!currentProduct.gallery || currentProduct.gallery.length === 0) && (
                <p className="text-xs text-[#00A896] col-span-full">No gallery images added yet.</p>
              )}
            </div>
          </section>

          {/* 6. Testimonials */}
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-[#B0B7C3] pb-2">
              <h3 className="font-serif text-lg text-[#00A896]">6. Testimonials</h3>
              <button type="button" onClick={() => setCurrentProduct({ ...currentProduct, testimonials: [...(currentProduct.testimonials || []), { name: "", rating: 5, text: "" }] })} className="text-[10px] font-bold uppercase tracking-widest text-[#BCAE9E] hover:text-[#0D3C6A] transition-colors">+ Add Testimonial</button>
            </div>
            <div className="space-y-4">
              {(currentProduct.testimonials || []).map((testimonial, idx) => (
                <div key={idx} className="relative bg-[#FAF6F0]/50 p-6 rounded-2xl border border-[#B0B7C3] group">
                  <button type="button" onClick={() => {
                    const newT = [...currentProduct.testimonials];
                    newT.splice(idx, 1);
                    setCurrentProduct({ ...currentProduct, testimonials: newT });
                  }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10 hover:bg-red-500 hover:text-white">&times;</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Reviewer Name</label>
                      <input type="text" required value={testimonial.name} onChange={(e) => {
                        const newT = [...currentProduct.testimonials];
                        newT[idx].name = e.target.value;
                        setCurrentProduct({ ...currentProduct, testimonials: newT });
                      }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Rating (1-5)</label>
                      <input type="number" required min="1" max="5" value={testimonial.rating} onChange={(e) => {
                        const newT = [...currentProduct.testimonials];
                        newT[idx].rating = parseInt(e.target.value);
                        setCurrentProduct({ ...currentProduct, testimonials: newT });
                      }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Review Text</label>
                    <textarea required value={testimonial.text} onChange={(e) => {
                      const newT = [...currentProduct.testimonials];
                      newT[idx].text = e.target.value;
                      setCurrentProduct({ ...currentProduct, testimonials: newT });
                    }} className="w-full px-4 py-2 bg-white border border-[#B0B7C3] rounded-lg text-sm min-h-[60px]" />
                  </div>
                </div>
              ))}
              {(!currentProduct.testimonials || currentProduct.testimonials.length === 0) && (
                <p className="text-xs text-[#00A896]">No testimonials added yet.</p>
              )}
            </div>
          </section>

          <div className="pt-8 border-t border-[#B0B7C3] flex justify-end gap-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#00A896] hover:bg-[#FAF6F0] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="bg-[#0D3C6A] text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl transition-all shadow-md hover:bg-black disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>

        {/* AI Modal */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
              <h3 className="font-serif text-xl text-[#0D3C6A]">Generate Product Details</h3>
              <p className="text-xs text-[#00A896]">Describe the product you want to create, and our AI will automatically fill in all the text fields.</p>
              
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A luxurious anti-aging night cream with retinol..."
                className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm min-h-[100px] focus:outline-none focus:border-[#0D3C6A]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAiModalOpen(false)} disabled={isAiGenerating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#BCAE9E] hover:text-[#0D3C6A]">Cancel</button>
                <button type="button" onClick={handleAiGenerate} disabled={isAiGenerating || !aiPrompt.trim()} className="bg-[#0D3C6A] text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 flex items-center gap-2">
                  {isAiGenerating ? "Generating..." : "âœ¨ Generate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left flex items-center justify-between shadow-sm">
          <div><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold block">Total Products</span><span className="text-2xl font-bold text-[#0D3C6A] block mt-1">{products.length}</span></div>
        </div>
        <div className="bg-[#F0FAED] border border-[#D6EAD2] rounded-2xl p-5 text-left flex items-center justify-between shadow-sm">
          <div><span className="text-[9px] uppercase tracking-widest text-green-700 font-bold block">Categories</span><span className="text-2xl font-bold text-green-900 block mt-1">{categories.length - 1}</span></div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left flex items-center justify-between shadow-sm">
          <div><span className="text-[9px] uppercase tracking-widest text-amber-700 font-bold block">Low Stock</span><span className="text-2xl font-bold text-amber-900 block mt-1">3</span></div>
        </div>
        <div className="bg-[#FAF6F0] border border-[#BCAE9E] rounded-2xl p-5 flex items-center justify-center cursor-pointer hover:bg-[#F5F0E6] transition-colors shadow-sm" onClick={() => openEditor()}>
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D3C6A]">+ Add Product</span>
        </div>
      </div>

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg text-[#0D3C6A] font-medium uppercase tracking-wider">Product Inventory</h3>
          <span className="text-[9px] text-[#00A896] uppercase tracking-wider block mt-0.5">Manage your Guna Life catalog</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FAF6F0] rounded-full p-1 border border-[#B0B7C3]">
            <button onClick={() => setViewMode("card")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === "card" ? "bg-[#0D3C6A] text-white" : "text-[#00A896] hover:text-[#0D3C6A]"}`}>Grid</button>
            <button onClick={() => setViewMode("list")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === "list" ? "bg-[#0D3C6A] text-white" : "text-[#00A896] hover:text-[#0D3C6A]"}`}>List</button>
          </div>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c, i) => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${categoryFilter === c ? "bg-[#BCAE9E] text-[#0D3C6A] border-[#BCAE9E] shadow-sm" : "bg-white text-[#00A896] border-[#B0B7C3] hover:border-[#BCAE9E]"}`}>{c}</button>
        ))}
      </div>

      {/* Grid view */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p, idx) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.05 }} className="bg-white border border-[#B0B7C3] rounded-2xl overflow-hidden group hover:shadow-md hover:border-[#5BA6D6] transition-all relative">
              <div className="relative aspect-square bg-[#FAF6F0] p-6 overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => openEditor(p)}>
                {p.mainImage ? (
                  <Image src={p.mainImage} alt={p.name} fill sizes="240px" className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-[10px] text-[#00A896] font-bold uppercase tracking-widest">No Image</div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toggleFeatured(p); }} className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-[#B0B7C3] ${p.isFeatured ? "text-yellow-500" : "text-[#0D3C6A]"} hover:bg-[#0D3C6A] hover:text-white transition-colors text-xs`} title={p.isFeatured ? "Remove from Featured" : "Mark as Featured"}>â˜…</button>
                  <button onClick={(e) => { e.stopPropagation(); openEditor(p); }} className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-[#B0B7C3] text-[#0D3C6A] hover:bg-[#0D3C6A] hover:text-white transition-colors text-xs" title="Edit">âœŽ</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs" title="Delete">Ã—</button>
                </div>
              </div>
              <div className="p-4 space-y-2 text-left bg-white border-t border-[#B0B7C3]">
                <span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold block">{p.category}</span>
                <h4 className="text-sm font-semibold text-[#0D3C6A] leading-tight line-clamp-1">{p.name}</h4>
                <div className="flex items-end justify-between pt-2">
                  <span className="text-sm font-bold text-[#0D3C6A]">₹{p.price}</span>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[9px] font-bold text-[#00A896] uppercase tracking-wider">{p.inventory || 0} units</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-[#F0FAED] text-green-700 px-2 py-1 rounded-full border border-[#D6EAD2]">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full p-12 text-center text-sm text-[#00A896] bg-white rounded-3xl border border-[#B0B7C3]">No products found in this category.</div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white border border-[#B0B7C3] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF6F0]/50 text-[9px] text-[#00A896] uppercase tracking-widest font-bold">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Inventory</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B0B7C3]/50">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF6F0]/30 transition-colors cursor-pointer" onClick={() => openEditor(prod)}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        {prod.mainImage ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#B0B7C3] bg-white">
                            <Image src={prod.mainImage} alt={prod.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-[#B0B7C3] bg-[#FAF6F0] flex items-center justify-center text-[8px] text-[#00A896]">No Img</div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#0D3C6A]">{prod.name}</p>
                          <p className="text-[10px] text-[#00A896] tracking-wider uppercase mt-0.5">{prod.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#00A896]">{prod.category}</td>
                    <td className="p-4 text-sm font-semibold text-[#0D3C6A]">₹{prod.price}</td>
                    <td className="p-4 text-xs font-bold text-[#0D3C6A]">{prod.inventory || 0} units</td>
                    <td className="p-4 pr-6 text-right space-x-3">
                      <button onClick={(e) => { e.stopPropagation(); toggleFeatured(prod); }} className={`text-xs font-bold ${prod.isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-[#BCAE9E] hover:text-[#0D3C6A]"} transition-colors uppercase tracking-widest`} title={prod.isFeatured ? "Remove from Featured" : "Mark as Featured"}>â˜…</button>
                      <button onClick={(e) => { e.stopPropagation(); openEditor(prod); }} className="text-xs font-bold text-[#BCAE9E] hover:text-[#0D3C6A] transition-colors uppercase tracking-widest">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(prod.id); }} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-[#00A896]">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
