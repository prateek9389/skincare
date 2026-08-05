"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, collection } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const prods = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });
    return () => unsubProducts();
  }, []);

  useEffect(() => {
    let unsubscribeOrder: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const resolvedParams = await Promise.resolve(params);
        const orderId = resolvedParams.id;

        unsubscribeOrder = onSnapshot(doc(db, "orders", orderId), (orderDoc) => {
          if (orderDoc.exists()) {
            const data = orderDoc.data();
            if (data.userId === currentUser.uid || currentUser.email === "auraadmin123@gmail.com") {
              setOrder(data);
            } else {
              setError("You do not have permission to view this order.");
            }
          } else {
            setError("Order not found.");
          }
          setLoading(false);
        }, (err) => {
          console.error(err);
          setError("Failed to load order details.");
          setLoading(false);
        });
      } else {
        router.push("/shop");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrder) {
        unsubscribeOrder();
      }
    };
  }, [params, router]);

  const currentUserIsAdmin = (uid: string) => {
    // Basic check - true auth should be handled in firestore rules
    return user?.email === "auraadmin123@gmail.com";
  };

  const getStatusColor = (status: string) => {
    if (status === "Delivered") return "bg-green-50 text-green-600 border-green-200";
    if (status === "Shipped") return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-amber-50 text-amber-600 border-amber-200";
  };

  const handleReturnItem = async (itemIdx: number) => {
    if (confirm("Are you sure you want to return this product?")) {
      try {
        const orderRef = doc(db, "orders", order.orderId);
        const newItems = [...order.items];
        newItems[itemIdx] = { ...newItems[itemIdx], returnStatus: "Return Requested" };
        await setDoc(orderRef, { items: newItems }, { merge: true });
      } catch (err) {
        console.error("Error returning item:", err);
        alert("There was an error processing your return. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFFFFF] pt-20 items-center justify-center space-y-4">
        <Header cartItems={[]} onUpdateQuantity={() => { }} onRemoveItem={() => { }} />
        <div className="w-8 h-8 rounded-full border-2 border-[#5BA6D6] border-t-[#0D3C6A] animate-spin" />
        <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Loading Order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFFFFF] pt-20">
        <Header cartItems={[]} onUpdateQuantity={() => { }} onRemoveItem={() => { }} />
        <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-20 text-center">
          <h1 className="font-serif text-2xl text-[#0D3C6A] mb-4">Oops!</h1>
          <p className="text-sm text-red-500 mb-8">{error || "Order not found."}</p>
          <Link href="/profile" className="bg-[#0D3C6A] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#383838] transition-colors">
            Back to Orders
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] selection:bg-[#5BA6D6] selection:text-[#0D3C6A] pt-20">
      <Header cartItems={[]} onUpdateQuantity={() => { }} onRemoveItem={() => { }} />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 text-left">
        <div className="flex items-center gap-2 mb-8 no-print">
          <Link href="/profile" className="text-xs text-[#00A896] hover:text-[#0D3C6A] uppercase tracking-widest font-bold transition-colors">
            &larr; Back to Orders
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#B0B7C3] pb-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#0D3C6A] font-light uppercase tracking-wider">
              Order {order.orderId}
            </h1>
            <p className="text-xs text-[#00A896] uppercase tracking-widest mt-2">
              Placed on {order.date}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
              {order.status || "Processing"}
            </span>
            <button onClick={() => window.print()} className="no-print bg-[#0D3C6A] hover:bg-[#383838] text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Main Items List */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-serif text-lg text-[#0D3C6A] uppercase tracking-wider">Items</h3>
            <div className="bg-white border border-[#B0B7C3] rounded-3xl overflow-hidden shadow-sm divide-y divide-[#B0B7C3]/50">
              {order.items?.map((item: any, idx: number) => {
                const liveProduct = products.find(p => p.id === item.productId || p.id === item.id);
                const returnAvailable = item.returnPolicyAvailable || liveProduct?.returnPolicyAvailable;
                const returnDays = item.returnPolicyDays || liveProduct?.returnPolicyDays || 30;
                
                let isWithinReturnWindow = false;
                if (order.status === "Delivered" && returnAvailable) {
                  // Assume order.date is something parsable, or use a fallback
                  const orderDate = new Date(order.createdAt ? order.createdAt.toDate?.() || order.createdAt : order.date);
                  const daysSinceOrder = (new Date().getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
                  isWithinReturnWindow = daysSinceOrder <= returnDays;
                }

                return (
                  <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-6 flex-grow">
                      <div className="relative w-20 h-20 bg-[#FAF6F0] rounded-2xl border border-[#B0B7C3] p-2 shrink-0">
                        <Image data-pin-nopin="true" src={item.image || "/placeholder.png"} alt={item.name || "Product"} fill sizes="80px" className="object-contain" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <h4 className="font-serif text-sm font-bold text-[#0D3C6A]">{item.name}</h4>
                        <p className="text-[10px] text-[#00A896] uppercase tracking-widest">Qty: {item.quantity}</p>
                        
                        {item.returnStatus && (
                           <div className="mt-2">
                             <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${item.returnStatus === 'Return Requested' ? 'bg-amber-50 text-amber-600 border-amber-200' : item.returnStatus === 'Return Approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                               {item.returnStatus}
                             </span>
                           </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                      <div className="text-sm font-bold text-[#0D3C6A]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      {isWithinReturnWindow && !item.returnStatus && (
                        <button 
                          onClick={() => handleReturnItem(idx)}
                          className="no-print bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-3xl p-6 shadow-sm space-y-6">

              <div>
                <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-2 mb-3">
                  Summary
                </h3>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600 font-medium mb-2">
                    <span>Discount ({order.couponCode})</span>
                    <span>-₹{(order.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#0D3C6A]">
                  <span>Total</span>
                  <span>₹{(order.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-2 mb-3">
                  Customer Name
                </h3>
                <p className="text-xs text-[#0D3C6A] font-medium">
                  {order.customerName || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-2 mb-3">
                  Shipping Address
                </h3>
                <p className="text-xs text-[#0D3C6A] leading-relaxed">
                  {order.shippingAddress}
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-2 mb-3">
                  Payment Method
                </h3>
                <p className="text-xs text-[#0D3C6A] font-medium">
                  {order.paymentMethod || "Credit Card"}
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
