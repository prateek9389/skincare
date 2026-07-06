"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetails {
  orderId: string;
  date: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  status: string;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aura_last_order");
    if (saved) {
      try {
        setOrder(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // If no last order is recorded, redirect to orders
      router.push("/orders");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden pt-20">
      <Header cartItems={[]} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 select-none text-center flex flex-col items-center justify-center space-y-8">
        
        {/* Success Icon */}
        <div className="text-green-600">
          <svg className="w-16 h-16 stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Hero message */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8276] uppercase">
            Order Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1C1B19] uppercase tracking-wide">
            Thank you for your order
          </h1>
          <p className="text-xs text-[#8C8276] leading-relaxed max-w-md mx-auto">
            Your transaction has been processed successfully. A confirmation email carrying invoice details will be dispatched to you shortly.
          </p>
        </div>

        {order && (
          /* Order detail breakdown card */
          <div className="w-full bg-white rounded-3xl border border-[#EAE3DC] p-6 sm:p-8 text-left space-y-6 shadow-sm">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#EAE3DC] pb-4 text-xs">
              <div>
                <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Order ID</span>
                <span className="font-bold text-[#1C1B19] text-sm uppercase">{order.orderId}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Date Placed</span>
                <span className="font-medium text-[#1C1B19]">{order.date}</span>
              </div>
            </div>

            {/* List items */}
            <div className="space-y-4 max-h-48 overflow-y-auto scrollbar-none pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center justify-between text-xs text-[#1C1B19]">
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 bg-[#FAF6F0] rounded-xl overflow-hidden border border-[#EAE3DC] p-1 flex items-center justify-center shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-[#8C8276] uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Shipping breakdown */}
            <div className="border-t border-[#EAE3DC] pt-4 text-xs text-left space-y-1">
              <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Shipping Address</span>
              <span className="font-light text-[#1C1B19] leading-relaxed block">{order.shippingAddress}</span>
            </div>

            {/* Total line */}
            <div className="flex justify-between items-baseline border-t border-[#EAE3DC] pt-4 text-xs text-[#1C1B19]">
              <span className="uppercase font-bold tracking-wider text-[#8C8276]">Total Amount Paid</span>
              <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
            </div>

          </div>
        )}

        {/* Buttons flow triggers */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-4">
          <button
            onClick={() => router.push("/orders")}
            className="flex-1 border border-black text-[#1C1B19] py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
          >
            View Order History
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="flex-1 bg-black text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-85 transition-opacity"
          >
            Continue Shopping
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
