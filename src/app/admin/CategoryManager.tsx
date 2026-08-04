"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

const ImageUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-16 h-16 rounded-xl border border-[#B0B7C3] overflow-hidden bg-white shrink-0">
            <Image data-pin-nopin="true" src={value} alt="Upload preview" fill className="object-cover" />
          </div>
        )}
        <label className="flex-grow flex items-center justify-center px-4 py-3 bg-white border border-dashed border-[#B0B7C3] rounded-xl hover:bg-[#FAF6F0] hover:border-[#0D3C6A] cursor-pointer transition-colors text-xs text-[#0D3C6A] font-bold uppercase tracking-widest">
          {uploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

export default function CategoryManager({ searchQuery = "" }: { searchQuery?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openEditor = (cat?: Category) => {
    setCurrentCategory(cat || { name: "", description: "", image: "" });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.name) return;
    setSaving(true);
    try {
      let id = currentCategory.id;
      if (!id) {
        id = currentCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      const ref = doc(db, "categories", id);
      await setDoc(ref, {
        name: currentCategory.name,
        description: currentCategory.description || "",
        image: currentCategory.image || "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs uppercase tracking-widest text-[#00A896]">Loading categories...</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-[#B0B7C3] rounded-3xl p-8 shadow-sm relative">
        <div className="flex justify-between items-center mb-8 border-b border-[#B0B7C3] pb-4">
          <h2 className="font-serif text-2xl text-[#0D3C6A]">{currentCategory.id ? "Edit Category" : "Create Category"}</h2>
          <button onClick={() => setIsEditing(false)} className="text-xs text-[#00A896] hover:text-[#0D3C6A] uppercase tracking-widest font-bold">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Name</label>
            <input required type="text" value={currentCategory.name || ""} onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E]" placeholder="e.g. Cleansers" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1.5">Description</label>
            <textarea value={currentCategory.description || ""} onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })} className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E] min-h-[100px]" placeholder="Brief description of this category..." />
          </div>
          <div>
            <ImageUpload label="Category Image" value={currentCategory.image || ""} onChange={(url) => setCurrentCategory({ ...currentCategory, image: url })} />
          </div>
          
          <div className="pt-6 border-t border-[#B0B7C3]">
            <button type="submit" disabled={saving} className="bg-[#0D3C6A] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#383838] transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-[#B0B7C3] rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl text-[#0D3C6A]">Categories</h2>
          <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-1">Manage product categories</p>
        </div>
        <button onClick={() => openEditor()} className="bg-[#0D3C6A] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#383838] transition-colors shadow-md flex items-center gap-2">
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {categories.filter((cat) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
        }).map((cat) => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-[#B0B7C3] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="relative h-48 bg-[#FAF6F0] border-b border-[#B0B7C3] flex items-center justify-center p-4">
                {cat.image ? (
                  <div className="relative w-full h-full">
                    <Image data-pin-nopin="true" src={cat.image} alt={cat.name} fill className="object-cover rounded-xl" />
                  </div>
                ) : (
                  <span className="text-[#BCAE9E] font-serif italic text-lg">No Image</span>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="font-serif text-xl text-[#0D3C6A] mb-2">{cat.name}</h3>
                <p className="text-xs text-[#00A896] line-clamp-2 flex-grow mb-6">{cat.description || "No description provided."}</p>
                <div className="flex justify-between items-center pt-4 border-t border-[#B0B7C3]/50">
                  <button onClick={() => openEditor(cat)} className="text-[10px] text-[#0D3C6A] font-bold uppercase tracking-widest hover:text-[#5BA6D6] transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {categories.filter((cat) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
        }).length === 0 && (
            <div className="col-span-full text-center py-20 bg-white border border-[#B0B7C3] rounded-3xl text-sm text-[#00A896]">
              No categories found. Click "Add Category" to create one.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
