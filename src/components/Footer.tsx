"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white border-t border-neutral-900 select-none">
      
      {/* Top Trust Banner */}
      <div className="border-b border-neutral-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Free Shipping */}
            <div className="flex items-center gap-4 group">
              <div className="text-neutral-500 group-hover:text-white transition-colors shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-white">Free Shipping</h4>
                <p className="text-[11px] text-neutral-500 tracking-wide mt-0.5">On all US domestic orders over $75</p>
              </div>
            </div>

            {/* 30 Day Returns */}
            <div className="flex items-center gap-4 group">
              <div className="text-neutral-500 group-hover:text-white transition-colors shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-white">30 Day Returns</h4>
                <p className="text-[11px] text-neutral-500 tracking-wide mt-0.5">Hassle-free, easy return process</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-center gap-4 group">
              <div className="text-neutral-500 group-hover:text-white transition-colors shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-white">Secure Payment</h4>
                <p className="text-[11px] text-neutral-500 tracking-wide mt-0.5">100% encrypted, secure checkout</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl tracking-[0.25em] text-white uppercase font-light">
                Aura
              </h2>
              <p className="text-[7px] tracking-[0.4em] text-neutral-500 uppercase -mt-0.5 block">
                Skincare
              </p>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed tracking-wide font-light">
              Elevated skincare made with clean ingredients and backed by science. We build routines to empower your skin.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 text-neutral-500">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* Pinterest */}
              <a href="#" aria-label="Pinterest" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.906 2.17-2.906 1.024 0 1.517.769 1.517 1.689 0 1.029-.653 2.567-.992 3.993-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.868-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.166-1.495-.694-2.433-2.878-2.433-4.629 0-3.774 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.022 12.017.022z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" aria-label="TikTok" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31.03 2.61.18 3.86.52v3.66c-.72-.2-1.47-.3-2.22-.3h-.63v4.45c1.64-.13 3.3.43 4.3 1.7.94 1.18 1.1 2.8.44 4.13-.53 1.08-1.57 1.83-2.76 1.98-1.8.23-3.6-.96-4.08-2.7-.42-1.56.27-3.3 1.64-4.04V.02h-.55z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Shop */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Shop</h3>
            <ul className="space-y-3.5 text-xs text-neutral-500 font-light tracking-wide">
              <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bestsellers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sets & Kits</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Column 3 - Collections */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Collections</h3>
            <ul className="space-y-3.5 text-xs text-neutral-500 font-light tracking-wide">
              <li><a href="#" className="hover:text-white transition-colors">Hydration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Brightening</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Anti-Aging</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sensitive Skin</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Clear Skin</a></li>
            </ul>
          </div>

          {/* Column 4 - About */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">About</h3>
            <ul className="space-y-3.5 text-xs text-neutral-500 font-light tracking-wide">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ingredients</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Column 5 - Help */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-white uppercase">Help</h3>
            <ul className="space-y-3.5 text-xs text-neutral-500 font-light tracking-wide">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500 tracking-widest uppercase">
          <p>© 2026 AURA Skincare. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
