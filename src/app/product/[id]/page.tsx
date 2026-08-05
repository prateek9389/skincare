"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Product } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { FirestoreProduct } from "@/app/admin/ProductManager";


export interface Review {
  id?: string;
  productId: string;
  clientName: string;
  rating: number;
  comment: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  createdAt?: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FirestoreProduct[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<FirestoreProduct[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<FirestoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart state sync
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<{label: string, price: number, image?: string} | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Top Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const prodDoc = await getDoc(doc(db, "products", id as string));
        if (prodDoc.exists()) {
          const prodData = prodDoc.data() as FirestoreProduct;
          
          const defaultQuantities = [
            { label: "25ml", price: 50 },
            { label: "50ml", price: 100 },
            { label: "100ml", price: 150 }
          ];
          const finalQuantities = prodData.quantities && prodData.quantities.length > 0 ? prodData.quantities : defaultQuantities;
          
          setProduct({ ...prodData, id: prodDoc.id, quantities: finalQuantities });
          setSelectedImage(prodData.mainImage);
          if (finalQuantities.length > 0) {
            setSelectedQuantity(finalQuantities[0]);
          }

          // Fetch approved reviews
          const reviewsQ = query(collection(db, "reviews"), where("productId", "==", prodDoc.id), where("status", "==", "approved"));
          const reviewsSnap = await getDocs(reviewsQ);
          const reviewsData = reviewsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Review));
          setReviews(reviewsData);


          // Fetch all products for sections
          const allProdsQ = query(collection(db, "products"));
          const allProdsSnap = await getDocs(allProdsQ);
          const allProds = allProdsSnap.docs.map(d => ({ ...d.data(), id: d.id } as FirestoreProduct));
          
          // Featured: tags include 'HIT' or randomly sort
          const featured = allProds.filter(p => p.category === "Sets & Kits").slice(0, 8);
          if (featured.length < 4) {
             featured.push(...allProds.slice(0, 4 - featured.length));
          }
          setFeaturedProducts(featured);

          // Top Selling: mock logic based on inventory or just another random slice
          const topSelling = [...allProds].sort((a,b) => (b.inventory || 0) - (a.inventory || 0)).slice(0, 8);
          setTopSellingProducts(topSelling);

          // Recently Viewed Logic
          const historyRaw = localStorage.getItem("rudra_recently_viewed");
          let historyIds: string[] = historyRaw ? JSON.parse(historyRaw) : [];
          
          // Update history with current product
          if (!historyIds.includes(prodDoc.id)) {
            historyIds = [prodDoc.id, ...historyIds].slice(0, 10);
            localStorage.setItem("rudra_recently_viewed", JSON.stringify(historyIds));
          }
          
          // Fetch recently viewed (exclude current one)
          const recentIds = historyIds.filter(hid => hid !== prodDoc.id);
          const recentProds = recentIds.map(hid => allProds.find(p => p.id === hid)).filter(Boolean) as FirestoreProduct[];
          setRecentlyViewedProducts(recentProds);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  // Sync cart with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gunalife_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => { cartLoadedRef.current = true; }, 100);
  }, []);

  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("gunalife_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Auto slide top carousel
  useEffect(() => {
    if (!product || !product.carouselSlides || product.carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % product.carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between pt-20">
        <Header cartItems={cartItems} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5BA6D6] border-t-[#0D3C6A] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between pt-20">
        <Header cartItems={cartItems} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center space-y-6">
          <h2 className="font-serif text-2xl text-[#0D3C6A]">Product Not Found</h2>
          <p className="text-sm text-[#00A896] max-w-md text-center">We couldn't find the product you're looking for. It may have been removed or the URL is incorrect.</p>
          <button
            onClick={() => router.push("/shop")}
            className="text-xs font-bold tracking-widest text-white bg-black px-8 py-3.5 rounded-full uppercase hover:opacity-85"
          >
            Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Convert to legacy Product format for the cart
  const legacyProductFormat: Product = {
    id: selectedQuantity ? `${product.id}-${selectedQuantity.label}` : product.id,
    name: selectedQuantity ? `${product.name} - ${selectedQuantity.label}` : product.name,
    price: selectedQuantity ? selectedQuantity.price : product.price,
    image: product.mainImage,
    category: product.category as any,
    description: product.description,
    ingredients: product.ingredients,
    returnPolicyAvailable: product.returnPolicyAvailable,
    returnPolicyDays: product.returnPolicyDays
  };

  const handleAddToCart = () => {
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === legacyProductFormat.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === legacyProductFormat.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: legacyProductFormat, quantity: 1 }];
    });
    setToastMessage(`✨ ${legacyProductFormat.name} added to bag.`);
  };


  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        clientName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });
      setReviewSubmitting(false);
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setShowReviewModal(false);
      alert("Your review has been submitted and is pending approval!");
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const slides = product.carouselSlides || [];
  const currentSlideData = slides[currentSlide] || null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] selection:bg-[#5BA6D6] selection:text-[#0D3C6A] relative overflow-hidden">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0D3C6A] text-white px-6 py-3.5 rounded-xl shadow-xl text-xs tracking-wider uppercase font-semibold flex items-center gap-3 border border-neutral-800"
          >
            <span>{toastMessage}</span>
            {toastMessage.includes("added to bag") && (
              <a href="/checkout" className="bg-white text-[#0D3C6A] px-3 py-1.5 rounded-md hover:bg-neutral-200 transition-colors">View Cart</a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <main className="flex-grow select-none">
        
        {/* 1. TOP CAROUSEL BANNER */}
        {currentSlideData && (
          <section className="relative w-full h-[35vh] sm:h-[45vh] md:h-[75vh] bg-[#B0B7C3]/40 border-b border-[#B0B7C3] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 items-stretch"
              >
                {/* Left Column */}
                <div className="relative h-full hidden md:block border-r border-[#B0B7C3]/80 overflow-hidden bg-[#FAF6F0]">
                  {currentSlideData.leftImage && (
                    <Image data-pin-nopin="true"
                      src={currentSlideData.leftImage}
                      alt="Left Image"
                      fill
                      priority
                      sizes="33vw"
                      className="object-cover opacity-90 scale-105"
                    />
                  )}
                </div>

                {/* Center Column */}
                <div className="flex flex-col justify-center items-center text-center p-4 sm:p-8 bg-[#FAF6F0]/30 relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.1em] text-[#0D3C6A] uppercase leading-none">
                      {currentSlideData.textLine1}
                    </h2>
                    <p className="font-serif italic text-[10px] sm:text-sm md:text-base text-[#00A896] tracking-wide block">
                      {currentSlideData.textLine2}
                    </p>
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.15em] text-[#0D3C6A] uppercase leading-none pt-1">
                      {currentSlideData.textLine3}
                    </h2>
                  </div>
                  {/* Dots indicator */}
                  <div className="absolute bottom-6 flex space-x-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          currentSlide === idx ? "bg-[#0D3C6A] w-4" : "bg-[#00A896]/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="relative h-full overflow-hidden bg-white/50">
                  {currentSlideData.rightImage && (
                    <Image data-pin-nopin="true"
                      src={currentSlideData.rightImage}
                      alt="Right Image"
                      fill
                      priority
                      sizes="(max-w-768px) 50vw, 33vw"
                      className="object-cover opacity-95"
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* Categories Tabs layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center sm:justify-start items-center space-x-8 text-xs tracking-widest text-[#00A896] font-semibold uppercase border-b border-[#B0B7C3] pb-4">
            <span className="text-[#0D3C6A] border-b border-[#0D3C6A] pb-4 -mb-4 flex items-baseline gap-1 cursor-pointer">
              Product View
            </span>
            <span onClick={() => router.push("/shop")} className="hover:text-[#0D3C6A] transition-colors flex items-baseline gap-1 cursor-pointer">
              Back to Shop
            </span>
          </div>
        </section>

        {/* 2. MID PRODUCT DISPLAY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Platform product image + Thumbnails */}
            <div className="flex flex-col-reverse md:flex-row gap-4 max-w-xl mx-auto w-full">
              {/* Thumbnails */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-w-full md:max-h-[500px] scrollbar-none pb-2 md:pb-0 md:pr-1">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 md:h-24 rounded-xl border overflow-hidden shrink-0 transition-colors ${selectedImage === img ? 'border-[#0D3C6A]' : 'border-[#B0B7C3]/60 hover:border-[#5BA6D6]'}`}
                    >
                      <Image data-pin-nopin="true" src={img} alt={`Gallery ${idx}`} fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image View */}
              <div className="bg-[#FAF6F0] rounded-3xl border border-[#B0B7C3]/60 relative aspect-square shadow-sm flex-grow group overflow-hidden">
                {(selectedImage || product.mainImage) && (
                  <Image data-pin-nopin="true"
                    src={selectedImage || product.mainImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-w-768px) 100vw, 500px"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
            </div>

            {/* Right Column: Descriptions & Cart triggers */}
            <div className="space-y-8 text-left">
              
              {/* Product header info */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#00A896] uppercase">
                  {product.category} Collection
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#0D3C6A] leading-tight tracking-wide">
                  {product.name}
                </h1>
                
                {/* Ingredients tag badges */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-[9px] tracking-wider text-[#0D3C6A] border border-[#5BA6D6] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full uppercase"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price and Cart Action row */}
              <div className="flex flex-col gap-4 py-6 border-y border-[#B0B7C3]">
                {product.quantities && product.quantities.length > 0 && (() => {
                  const sizeOptions = product.quantities.filter(q => !q.label.toLowerCase().includes("pack"));
                  const packOptions = product.quantities.filter(q => q.label.toLowerCase().includes("pack"));
                  
                  return (
                    <div className="flex flex-col gap-6 mb-2">
                      {sizeOptions.length > 0 && (
                        <div className="relative">
                          <span className="text-[9px] font-bold tracking-widest text-[#00A896] uppercase mb-2 block">Select Size</span>
                          <div className="relative" onMouseLeave={() => setOpenDropdownId(null)}>
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === 'qty' ? null : 'qty')}
                              className={`flex items-center justify-between w-full text-sm uppercase px-5 py-4 rounded-xl border ${openDropdownId === 'qty' ? 'border-[#0D3C6A] shadow-sm bg-white' : 'border-[#B0B7C3]/60 bg-[#FAF6F0]'} text-[#0D3C6A] font-bold tracking-wider transition-all duration-300`}
                            >
                              <span>
                                {sizeOptions.find(o => o.label === selectedQuantity?.label)
                                  ? selectedQuantity?.label
                                  : "Select Size"}
                              </span>
                              <svg className={`w-4 h-4 opacity-80 transition-transform duration-300 ${openDropdownId === 'qty' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            <div className={`absolute top-full left-0 w-full bg-white border border-[#B0B7C3]/30 rounded-xl shadow-xl z-50 overflow-hidden origin-top transition-all duration-200 ${openDropdownId === 'qty' ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                              {sizeOptions.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedQuantity(opt);
                                    if (opt.image) {
                                      setSelectedImage(opt.image);
                                    } else {
                                      setSelectedImage(product.mainImage);
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full text-left px-5 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                                    selectedQuantity?.label === opt.label 
                                      ? 'bg-[#FAF6F0] text-[#0D3C6A]' 
                                      : 'text-[#0D3C6A]/80 hover:bg-[#FAF6F0]/50 hover:text-[#0D3C6A]'
                                  }`}
                                >
                                  {opt.label} - ₹{opt.price.toFixed(2)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {packOptions.length > 0 && (
                        <div>
                          <span className="text-[9px] font-bold tracking-widest text-[#00A896] uppercase mb-2 block">Available Packs</span>
                          <div className="grid grid-cols-2 gap-3">
                            {packOptions.map((pack, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedQuantity(pack);
                                  if (pack.image) {
                                    setSelectedImage(pack.image);
                                  } else {
                                    setSelectedImage(product.mainImage);
                                  }
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                  selectedQuantity?.label === pack.label
                                    ? 'border-[#0D3C6A] bg-[#FAF6F0] shadow-sm'
                                    : 'border-[#B0B7C3]/50 bg-white hover:border-[#5BA6D6]'
                                }`}
                              >
                                <span className="font-serif text-sm text-[#0D3C6A] font-bold mb-1">{pack.label}</span>
                                <span className="text-[10px] text-[#00A896] font-bold tracking-widest">₹{pack.price.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] tracking-widest text-[#00A896] uppercase">Price</span>
                    <span className="font-serif text-2xl font-medium text-[#0D3C6A]">
                      ₹{(selectedQuantity ? selectedQuantity.price : product.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[9px] tracking-widest text-[#00A896] uppercase">Availability</span>
                    {product.inventory > 0 ? (
                      <span className="text-xs font-bold text-green-700 tracking-wider uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> In Stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-500 tracking-wider uppercase">Out of Stock</span>
                    )}
                  </div>
                </div>
                
                {/* Return Policy */}
                {product.returnPolicyAvailable && (
                  <div className="flex items-center gap-2 -mt-2 mb-2">
                    <svg className="w-4 h-4 text-[#00A896]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    <span className="text-[9px] font-bold tracking-widest text-[#00A896] uppercase">{product.returnPolicyDays} Day Return Policy Available</span>
                  </div>
                )}
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory <= 0}
                  className={`w-full text-xs font-bold tracking-widest text-white py-4 rounded-full uppercase transition-all shadow-lg ${product.inventory > 0 ? 'bg-black hover:opacity-85' : 'bg-[#00A896] cursor-not-allowed opacity-70'}`}
                >
                  {product.inventory > 0 ? "Add to Bag" : "Sold Out"}
                </button>
              </div>

              {/* Editorial quotes & Textures */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wide text-[#0D3C6A] uppercase">
                  Your skin is more than just a surface — it's your story, your shield, your glow.
                </h3>
                <p className="text-xs text-[#00A896] leading-relaxed font-light whitespace-pre-wrap">
                  {product.description}
                </p>
                
                {/* Smeared cream texture picture */}
                {product.textureImage && (
                  <div className="relative aspect-[3/1] w-full bg-[#FAF6F0] rounded-2xl border border-[#B0B7C3]/40 overflow-hidden mt-6 p-2 flex items-center justify-center">
                    <Image data-pin-nopin="true"
                      src={product.textureImage}
                      alt="Texture"
                      fill
                      sizes="(max-w-768px) 100vw, 500px"
                      className="object-cover opacity-80"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CAROUSELS (Featured, Top Selling, Recently Seen) */}
        
        {featuredProducts.length > 0 && (
          <section className="border-t border-[#B0B7C3] py-16 bg-white select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-serif text-lg tracking-widest text-[#0D3C6A] uppercase mb-12">
                Featured Highlights
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-none">
                {featuredProducts.map((item) => (
                  <div key={item.id} onClick={() => router.push(`/product/${item.id}`)} className="snap-start shrink-0 w-[240px] group flex flex-col space-y-4 text-left cursor-pointer">
                    <div className="relative aspect-[4/5] bg-[#FAF6F0] rounded-2xl overflow-hidden p-4 border border-[#B0B7C3]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow">
                      {item.mainImage && (
                        <Image data-pin-nopin="true" src={item.mainImage} alt={item.name} fill sizes="240px" className="object-contain p-2 opacity-95 group-hover:scale-102 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-serif text-xs font-light text-[#0D3C6A] tracking-wide line-clamp-1">{item.name}</h4>
                      <span className="font-serif text-xs text-[#0D3C6A] whitespace-nowrap">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {topSellingProducts.length > 0 && (
          <section className="border-t border-[#B0B7C3] py-16 bg-[#FAF6F0]/25 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-serif text-lg tracking-widest text-[#0D3C6A] uppercase mb-12">
                Top Selling
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-none">
                {topSellingProducts.map((item) => (
                  <div key={item.id} onClick={() => router.push(`/product/${item.id}`)} className="snap-start shrink-0 w-[240px] group flex flex-col space-y-4 text-left cursor-pointer">
                    <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden p-4 border border-[#B0B7C3]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow">
                      {item.mainImage && (
                        <Image data-pin-nopin="true" src={item.mainImage} alt={item.name} fill sizes="240px" className="object-contain p-2 opacity-95 group-hover:scale-102 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-serif text-xs font-light text-[#0D3C6A] tracking-wide line-clamp-1">{item.name}</h4>
                      <span className="font-serif text-xs text-[#0D3C6A] whitespace-nowrap">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {recentlyViewedProducts.length > 0 && (
          <section className="border-t border-[#B0B7C3] py-16 bg-white select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-serif text-lg tracking-widest text-[#0D3C6A] uppercase mb-12">
                Recently Seen
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-none">
                {recentlyViewedProducts.map((item) => (
                  <div key={item.id} onClick={() => router.push(`/product/${item.id}`)} className="snap-start shrink-0 w-[240px] group flex flex-col space-y-4 text-left cursor-pointer">
                    <div className="relative aspect-[4/5] bg-[#FAF6F0] rounded-2xl overflow-hidden p-4 border border-[#B0B7C3]/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow">
                      {item.mainImage && (
                        <Image data-pin-nopin="true" src={item.mainImage} alt={item.name} fill sizes="240px" className="object-contain p-2 opacity-95 group-hover:scale-102 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-serif text-xs font-light text-[#0D3C6A] tracking-wide line-clamp-1">{item.name}</h4>
                      <span className="font-serif text-xs text-[#0D3C6A] whitespace-nowrap">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}



        {reviews.length > 0 && (
          <section className="py-24 bg-white border-t border-[#B0B7C3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-serif text-3xl text-[#0D3C6A] font-light uppercase tracking-wider mb-12">
                Customer Reviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((r, idx) => (
                  <div key={r.id || idx} className="bg-[#FAF6F0] rounded-3xl p-6 border border-[#B0B7C3] flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}<span className="text-[#B0B7C3]">{"★".repeat(5 - r.rating)}</span></span>
                    </div>
                    <p className="font-serif italic text-sm text-[#0D3C6A] leading-relaxed flex-grow">"{r.comment}"</p>
                    <div className="flex justify-between items-end border-t border-[#B0B7C3]/60 pt-4 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#BCAE9E] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0D3C6A] uppercase">{r.clientName.charAt(0)}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D3C6A]">{r.clientName}</span>
                      </div>
                      {r.createdAt && (
                        <span className="text-[9px] text-[#00A896] uppercase tracking-wider">
                          {new Date(r.createdAt.toMillis ? r.createdAt.toMillis() : r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. BOTTOM RITUAL DETAILS FOOTER PANEL */}
        {product.bottomSection && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#B0B7C3]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              {/* Left Box: product collection details */}
              <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#B0B7C3] flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  {product.bottomSection.tags && product.bottomSection.tags.length > 0 && (
                    <div className="flex gap-2">
                      {product.bottomSection.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold tracking-wider text-[#0D3C6A] border border-[#0D3C6A] px-3 py-1 rounded-full uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#0D3C6A] font-light leading-tight">
                    {product.bottomSection.title}
                  </h3>
                  <p className="text-xs text-[#00A896] leading-relaxed whitespace-pre-wrap">
                    {product.bottomSection.description}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/shop")}
                  className="self-start text-xs font-bold tracking-widest text-[#0D3C6A] border-b border-[#0D3C6A] pb-1 uppercase hover:opacity-75"
                >
                  go to the catalog &rarr;
                </button>
              </div>

              {/* Right Box: Model Dropper Close-up */}
              <div className="relative rounded-3xl overflow-hidden min-h-[300px] border border-[#B0B7C3] bg-[#FAF6F0]">
                {product.bottomSection.image && (
                  <Image data-pin-nopin="true"
                    src={product.bottomSection.image}
                    alt={product.bottomSection.title}
                    fill
                    sizes="(max-w-768px) 100vw, 500px"
                    className="object-cover opacity-90 scale-102 hover:scale-105 transition-transform duration-700"
                  />
                )}
              </div>

            </div>
          </section>
        )}

        {/* REVIEW MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF6F0] text-[#00A896] hover:bg-[#0D3C6A] hover:text-white transition-colors">✕</button>
              
              <h3 className="font-serif text-xl text-[#0D3C6A] uppercase tracking-wider mb-6 border-b border-[#B0B7C3] pb-4">
                Write a Review
              </h3>
              <form onSubmit={submitReview} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Name</label>
                  <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Rating</label>
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]">
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Poor</option>
                    <option value="1">1 Star - Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Review</label>
                  <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]" placeholder="What did you think of this product?"></textarea>
                </div>
                <button disabled={reviewSubmitting} type="submit" className="w-full bg-[#0D3C6A] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50 mt-2">
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
