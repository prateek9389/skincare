"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/data/products";
import Link from "next/link";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);

  const promos = [
    "FREE SHIPPING ON ORDERS OVER $75",
    "COMPLIMENTARY SAMPLES WITH EVERY ORDER",
    "USA (USD) $",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promos.length]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#EAE3DC] text-[10px] md:text-xs font-medium tracking-widest text-[#1C1B19] py-2.5 px-4 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="hidden md:block">USA (USD)</div>
          <div className="text-center w-full md:w-auto animate-fade-in">
            {promos[promoIndex]}
          </div>
          <div className="hidden md:block">FREE SHIPPING OVER $75</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FBF9F6]/95 backdrop-blur-md border-b border-[#EAE3DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Menu Items (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-widest text-[#1C1B19] uppercase">
            <a href="/shop" className="hover:text-[#BCAE9E] transition-colors">Shop</a>
            <a href="/best-sellers" className="hover:text-[#BCAE9E] transition-colors">Best Sellers</a>
            <a href="/collections" className="hover:text-[#BCAE9E] transition-colors">Collections</a>
          </nav>

          {/* Centered Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <a href="/" className="inline-block">
              <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-[#1C1B19] uppercase font-light">
                Aura
              </h1>
              <p className="text-[7px] sm:text-[8px] tracking-[0.4em] text-[#8C8276] uppercase -mt-1 block text-center">
                Skincare
              </p>
            </a>
          </div>

          {/* Right Menu Items & Icons */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-widest text-[#1C1B19] uppercase">
              <a href="#" className="hover:text-[#BCAE9E] transition-colors">About</a>
              <a href="#" className="hover:text-[#BCAE9E] transition-colors">Journal</a>
              <a href="#" className="hover:text-[#BCAE9E] transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4 text-[#1C1B19]">
              {/* Search */}
              <button aria-label="Search" className="p-1 hover:text-[#BCAE9E] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Profile */}
              <button aria-label="Account" className="p-1 hover:text-[#BCAE9E] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

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
                  <span className="absolute -top-1 -right-1 bg-[#1C1B19] text-[#FBF9F6] text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FBF9F6] shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-6 border-b border-[#EAE3DC] flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-widest text-[#1C1B19] uppercase">Your Bag ({totalItems})</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-[#1C1B19] hover:text-[#BCAE9E] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-[#EAE3DC]">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <svg className="w-12 h-12 text-[#D4C5B9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-sm text-[#8C8276] tracking-wide">Your skincare ritual is empty.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold tracking-widest text-[#1C1B19] uppercase border-b border-[#1C1B19] pb-0.5 hover:text-[#BCAE9E] hover:border-[#BCAE9E] transition-colors"
                    >
                      Shop Best Sellers
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product.id} className="py-6 flex first:pt-0 last:pb-0">
                      <div className="flex-shrink-0 w-20 h-20 bg-white border border-[#EAE3DC] rounded-md overflow-hidden relative">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-[#1C1B19] tracking-wider uppercase">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-[#8C8276] line-clamp-1">{item.product.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          {/* Quantity control */}
                          <div className="flex items-center border border-[#EAE3DC] rounded-full">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="px-2.5 py-1 text-[#8C8276] hover:text-[#1C1B19] transition-colors"
                            >
                              -
                            </button>
                            <span className="px-1 text-[#1C1B19] font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="px-2.5 py-1 text-[#8C8276] hover:text-[#1C1B19] transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove button */}
                          <button 
                            onClick={() => onRemoveItem(item.product.id)}
                            type="button" 
                            className="font-medium text-[11px] text-[#8C8276] hover:text-red-500 transition-colors uppercase tracking-wider"
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
                <div className="border-t border-[#EAE3DC] py-6 px-6 bg-[#FBF9F6]">
                  <div className="flex justify-between text-xs font-semibold text-[#1C1B19] uppercase tracking-wider mb-2">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <p className="text-[10px] text-[#8C8276] mb-6">Shipping & taxes calculated at checkout.</p>
                  <Link 
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center block bg-[#1C1B19] hover:bg-[#383838] text-[#FBF9F6] py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
