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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDetails[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("aura_orders");
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden pt-20">
      <Header cartItems={[]} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 select-none text-left">
        
        {/* Header Title */}
        <div className="flex justify-between items-baseline mb-10 border-b border-[#EAE3DC] pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1C1B19] uppercase tracking-wide">
            Your Orders
          </h1>
          <span className="text-[10px] tracking-widest text-[#8C8276] uppercase">
            Order History
          </span>
        </div>

        {/* Check empty orders state */}
        {orders.length === 0 ? (
          <div className="text-center py-20 border border-[#EAE3DC] rounded-3xl bg-white space-y-6 shadow-sm flex flex-col items-center">
            <div className="text-neutral-300">
              <svg className="w-12 h-12 stroke-[1.25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg text-[#1C1B19]">No orders placed yet</h3>
              <p className="text-xs text-[#8C8276] max-w-xs mx-auto">
                Ready to elevate your skincare routine? Discover clean formulas in our shop.
              </p>
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="text-xs font-bold tracking-widest text-white bg-black px-8 py-3.5 rounded-full uppercase hover:opacity-85"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* List of past orders */
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl border border-[#EAE3DC] p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EAE3DC] pb-4 text-xs">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Order ID</span>
                      <span className="font-bold text-[#1C1B19] uppercase">{order.orderId}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Date Placed</span>
                      <span className="font-medium text-[#1C1B19]">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Total paid</span>
                      <span className="font-bold text-[#1C1B19]">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block text-[8px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center text-xs text-[#1C1B19]">
                        <div className="relative w-12 h-12 bg-[#FAF6F0] rounded-xl overflow-hidden border border-[#EAE3DC] p-1 flex items-center justify-center shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-neutral-800 line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] text-[#8C8276] uppercase tracking-wider">Qty: {item.quantity} • ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address details */}
                  <div className="text-xs space-y-1.5 sm:border-l sm:border-[#EAE3DC]/60 sm:pl-6 flex flex-col justify-center">
                    <span className="text-[#8C8276] block uppercase tracking-wider text-[9px] font-semibold">Delivery Address</span>
                    <span className="font-light text-[#1C1B19] leading-relaxed block max-w-sm">{order.shippingAddress}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
