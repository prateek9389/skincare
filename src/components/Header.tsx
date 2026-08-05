"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product, PRODUCTS } from "@/data/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreSettings } from "@/lib/useStoreSettings";
import Fuse from "fuse.js";

interface CartItem {
  product: Product;
  quantity: number;
}

interface HeaderProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function Header({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: HeaderProps) {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fuzzy search setup
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const fuse = new Fuse(PRODUCTS, {
      keys: ["name", "category", "description"],
      threshold: 0.3,
      includeScore: true,
    });
    return fuse.search(searchQuery).map(res => res.item).slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    window.addEventListener('open-search-modal', handleOpenSearch);
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuth);
      window.removeEventListener('open-search-modal', handleOpenSearch);
    };
  }, []);

  const { settings } = useStoreSettings();

  const promos = settings.promoText
    ? [settings.promoText]
    : [
      `FREE SHIPPING ON ORDERS OVER ₹${settings.freeShippingThreshold || 499}`,
      "COMPLIMENTARY SAMPLES WITH EVERY ORDER",
      "USA (INR) ₹",
    ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promos.length]);

  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setProfileName(currentUser.displayName || currentUser.email || "");
        unsubscribeDoc = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.firstName || data.lastName) {
              setProfileName(`${data.firstName || ""} ${data.lastName || ""}`.trim());
            }
          }
        }, (error) => {
          console.error("Error listening to user profile:", error);
        });
      } else {
        setProfileName("");
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = settings?.freeShippingThreshold || 499;
  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#0D3C6A] text-[10px] md:text-xs font-medium tracking-widest text-white py-2.5 px-4 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="hidden md:block font-bold tracking-widest">GUNA LIFE</div>
          <div className="text-center w-full md:w-auto animate-fade-in">
            {promos[promoIndex]}
          </div>
          <div className="hidden md:block">FREE SHIPPING OVER ₹{settings.freeShippingThreshold || 499}</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#B0B7C3] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Hamburger Menu (Mobile Only) */}
          <div className="flex lg:hidden flex-1 justify-start">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-[#0D3C6A] hover:text-[#BCAE9E] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Left Menu Items (Desktop) */}
          <nav className="hidden lg:flex flex-1 items-center space-x-8 text-xs font-semibold tracking-widest text-[#0D3C6A] uppercase">
            <a href="/" className="hover:text-[#BCAE9E] transition-colors">Home</a>
            <a href="/shop" className="hover:text-[#BCAE9E] transition-colors">Shop</a>
            <a href="/collections" className="hover:text-[#BCAE9E] transition-colors">Collections</a>
          </nav>

          {/* Centered Brand Logo */}
          <div className="flex text-center justify-center">
            <a href="/" className="inline-block relative w-48 h-12 lg:w-72 lg:h-16">
              <Image data-pin-nopin="true"
                src="/logo-v2.png"
                alt={settings.brandName}
                fill
                priority
                sizes="(max-width: 768px) 192px, 288px"
                className="object-contain"
              />
            </a>
          </div>

          {/* Right Menu Items & Icons */}
          <div className="flex flex-1 justify-end items-center space-x-4 lg:space-x-6">
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-widest text-[#0D3C6A] uppercase mr-4">
              <a href="/#about" className="hover:text-[#BCAE9E] transition-colors">About</a>
              <a href="#footer" className="hover:text-[#BCAE9E] transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4 text-[#0D3C6A]">
              {/* Search */}
              <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="p-1 hover:text-[#BCAE9E] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    if (user) {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  aria-label="Account"
                  className="p-1 hover:text-[#BCAE9E] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isProfileDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#B0B7C3] rounded-xl shadow-xl overflow-hidden py-2 z-50 animate-fade-in text-left text-[#0D3C6A]">
                    <div className="px-4 py-2 border-b border-[#B0B7C3]/50">
                      <p className="text-[10px] uppercase tracking-wider text-[#00A896]">Signed in as</p>
                      <p className="text-xs font-semibold truncate mt-1">{profileName || user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors border-b border-[#B0B7C3]/50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut(auth);
                        setIsProfileDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
                className="p-1 relative hover:text-[#BCAE9E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0D3C6A] text-[#FFFFFF] text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#B0B7C3]"
            >
              <div className="p-6 flex items-center border-b border-[#B0B7C3]/50">
                <svg className="w-5 h-5 text-[#00A896] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[#0D3C6A] placeholder-[#B0B7C3] font-serif text-lg"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="ml-3 text-[#0D3C6A] hover:text-[#BCAE9E] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#FAF6F0] transition-colors border border-transparent hover:border-[#B0B7C3]/50 group"
                        >
                          <div className="relative w-16 h-16 bg-white border border-[#B0B7C3] rounded-xl overflow-hidden p-1 shrink-0">
                            {(product.mainImage || product.image) ? (
                              <Image data-pin-nopin="true" src={product.mainImage || product.image} alt={product.name} fill sizes="64px" className="object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full bg-[#FAF6F0] rounded-lg flex items-center justify-center text-[8px] text-[#B0B7C3] uppercase">No Img</div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold block">{product.category}</span>
                            <h4 className="text-sm font-semibold text-[#0D3C6A] leading-tight mt-0.5">{product.name}</h4>
                            <span className="text-xs font-bold text-[#0D3C6A] mt-1 block">₹{product.price.toFixed(2)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-[#0D3C6A] font-semibold">No results found for "{searchQuery}"</p>
                      <p className="text-xs text-[#00A896] mt-1">Try a different keyword or category.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#00A896] uppercase tracking-widest font-bold">Start typing to search...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF6F0] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-6 border-b border-[#B0B7C3] flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-widest text-[#0D3C6A] uppercase">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#0D3C6A] hover:text-[#BCAE9E] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <nav className="flex-1 px-6 py-12 flex flex-col font-serif text-3xl text-[#0D3C6A] font-extralight tracking-widest uppercase overflow-y-auto">
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col space-y-8"
                >
                  <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <a href="/" className="hover:text-[#00A896] transition-all block" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                  </motion.div>
                  <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <a href="/shop" className="hover:text-[#00A896] transition-all block" onClick={() => setIsMobileMenuOpen(false)}>Shop</a>
                  </motion.div>
                  <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <a href="/collections" className="hover:text-[#00A896] transition-all block" onClick={() => setIsMobileMenuOpen(false)}>Collections</a>
                  </motion.div>
                  <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <a href="/#about" className="hover:text-[#00A896] transition-all block" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                  </motion.div>
                  <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <a href="#footer" className="hover:text-[#00A896] transition-all block" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                  </motion.div>
                </motion.div>
              </nav>
              <div className="p-6 border-t border-[#B0B7C3] flex gap-4">
                <div className="text-[10px] text-[#00A896] uppercase tracking-widest leading-relaxed">
                  GUNALIFE<br />Advanced Longevity
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FFFFFF] shadow-2xl flex flex-col">

              {/* Header */}
              <div className="px-6 py-6 border-b border-[#B0B7C3]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold tracking-widest text-[#0D3C6A] uppercase">Your Bag ({totalItems})</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#0D3C6A] hover:text-[#BCAE9E] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="bg-[#FAF6F0] rounded-xl p-4 text-center border border-[#B0B7C3] mt-2">
                  {amountRemaining > 0 ? (
                    <p className="text-xs text-[#0D3C6A] font-medium tracking-wide">
                      You're <span className="font-bold text-[#00A896]">₹{amountRemaining.toFixed(2)}</span> away from FREE Delivery!
                    </p>
                  ) : (
                    <p className="text-xs text-[#00A896] font-bold tracking-wide">
                      ✨ You have unlocked FREE Delivery!
                    </p>
                  )}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#00A896] transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-[#B0B7C3]">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <svg className="w-12 h-12 text-[#5BA6D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-sm text-[#00A896] tracking-wide">Your skincare ritual is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold tracking-widest text-[#0D3C6A] uppercase border-b border-[#0D3C6A] pb-0.5 hover:text-[#BCAE9E] hover:border-[#BCAE9E] transition-colors"
                    >
                      Shop Best Sellers
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product.id} className="py-6 flex first:pt-0 last:pb-0">
                      <div className="flex-shrink-0 w-20 h-20 bg-white border border-[#B0B7C3] rounded-md overflow-hidden relative">
                        <Image data-pin-nopin="true"
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-[#0D3C6A] tracking-wider uppercase">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-[#00A896] line-clamp-1">{item.product.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          {/* Quantity control */}
                          <div className="flex items-center border border-[#B0B7C3] rounded-full">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="px-2.5 py-1 text-[#00A896] hover:text-[#0D3C6A] transition-colors"
                            >
                              -
                            </button>
                            <span className="px-1 text-[#0D3C6A] font-medium">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="px-2.5 py-1 text-[#00A896] hover:text-[#0D3C6A] transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            type="button"
                            className="font-medium text-[11px] text-[#00A896] hover:text-red-500 transition-colors uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-[#B0B7C3] py-6 px-6 bg-[#FFFFFF]">
                  <div className="flex justify-between text-xs font-semibold text-[#0D3C6A] uppercase tracking-wider mb-2">
                    <p>Subtotal</p>
                    <p>₹{subtotal.toFixed(2)}</p>
                  </div>
                  <p className="text-[10px] text-[#00A896] mb-6">Shipping & taxes calculated at checkout.</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="w-full text-center block bg-[#0D3C6A] hover:bg-[#383838] text-[#FFFFFF] py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
        initialIsLogin={true}
      />
    </>
  );
}
