"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, collection, arrayUnion, addDoc, serverTimestamp } from "firebase/firestore";
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
  const [returnItemIdx, setReturnItemIdx] = useState<number | null>(null);
  const [returnReasonText, setReturnReasonText] = useState("");
  const [returnReasonText, setReturnReasonText] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  // Review state
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const submitReturnItem = async (itemIdx: number) => {
    if (!returnReasonText || returnReasonText.trim() === "") {
      alert("A reason for the return is mandatory.");
      return;
    }
    
    try {
      const orderRef = doc(db, "orders", order.orderId);
      const newItems = [...order.items];
      newItems[itemIdx] = { ...newItems[itemIdx], returnStatus: "Return Requested", returnReason: returnReasonText.trim() };
      await setDoc(orderRef, { 
        items: newItems,
        statusTimeline: arrayUnion({ status: `Return Requested (${newItems[itemIdx].name})`, timestamp: new Date().toISOString() })
      }, { merge: true });
      setReturnItemIdx(null);
      setReturnReasonText("");
    } catch (err) {
      console.error("Error returning item:", err);
      alert("There was an error processing your return. Please try again.");
    }
  };

  const submitReview = async () => {
    if (!reviewItem) return;
    if (!reviewComment.trim()) {
      alert("Please enter a review comment.");
      return;
    }
    
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: reviewItem.productId || reviewItem.id,
        orderId: order.orderId,
        userId: user?.uid,
        clientName: user?.displayName || user?.email?.split('@')[0] || "Customer",
        rating: reviewRating,
        comment: reviewComment.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("Your review has been submitted and is pending approval!");
      setReviewItem(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
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
            <div className="bg-white border border-[#B0B7C3] rounded-3xl overflow-hidden shadow-sm">
              {order.items?.map((item: any, idx: number) => {
                const liveProduct = products.find(p => (item.productId && item.productId.startsWith(p.id)) || (item.id && item.id.startsWith(p.id)));
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
                  <div key={idx} className="flex flex-col border-b border-[#B0B7C3]/50 last:border-b-0">
                    <div onClick={() => router.push(`/product/${liveProduct?.id || item.productId || item.id}`)} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6 cursor-pointer hover:bg-[#FAF6F0]/50 transition-colors">
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
                          ₹{(item.price * item.quantity).toFixed(2).replace(/\.00$/, "")}
                        </div>
                        {isWithinReturnWindow && !item.returnStatus && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReturnItemIdx(idx); setReturnReasonText(""); }}
                            className="no-print bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                          >
                            Request Return
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewItem(item); setReviewRating(5); setReviewComment(""); }}
                            className="no-print bg-white hover:bg-[#FAF6F0] border border-[#0D3C6A] text-[#0D3C6A] px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all mt-2"
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                    {returnItemIdx === idx && (
                      <div className="px-4 sm:px-6 pb-6" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#B0B7C3] flex flex-col gap-3">
                          <label className="text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest">Reason for Return (Mandatory)</label>
                          <input 
                            type="text" 
                            value={returnReasonText}
                            onChange={(e) => setReturnReasonText(e.target.value)}
                            placeholder="Please explain why you are returning this item..."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-[#B0B7C3] focus:outline-none focus:border-[#0D3C6A]"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end mt-2">
                            <button 
                              onClick={() => { setReturnItemIdx(null); setReturnReasonText(""); }}
                              className="px-4 py-1.5 text-[9px] font-bold text-[#0D3C6A] uppercase tracking-widest border border-[#B0B7C3] rounded-full hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => submitReturnItem(idx)}
                              className="px-4 py-1.5 text-[9px] font-bold text-white bg-[#0D3C6A] uppercase tracking-widest rounded-full hover:bg-[#383838] transition-colors"
                            >
                              Submit Return
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-3xl p-6 shadow-sm space-y-6">

              <div>
                <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-2 mb-3">
                  Summary
                </h3>
                
                {(() => {
                  const subtotal = order.subtotal ?? order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) ?? 0;
                  const discount = order.discountAmount || 0;
                  const hasDetailedCharges = order.shippingCost !== undefined || order.taxAmount !== undefined;
                  const shipping = order.shippingCost || 0;
                  const tax = order.taxAmount || 0;
                  const taxesAndShippingLegacy = (order.total || 0) - subtotal + discount;

                  return (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-xs text-[#0D3C6A] font-medium">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2).replace(/\.00$/, "")}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between items-center text-xs text-green-600 font-medium">
                          <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                          <span>-₹{discount.toFixed(2).replace(/\.00$/, "")}</span>
                        </div>
                      )}

                      {hasDetailedCharges ? (
                        <>
                          <div className="flex justify-between items-center text-xs text-[#0D3C6A] font-medium">
                            <span>Shipping</span>
                            <span>{shipping > 0 ? `₹${shipping.toFixed(2).replace(/\.00$/, "")}` : "Free"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-[#0D3C6A] font-medium">
                            <span>Taxes</span>
                            <span>₹{tax.toFixed(2).replace(/\.00$/, "")}</span>
                          </div>
                        </>
                      ) : (
                        taxesAndShippingLegacy > 0.01 && (
                          <div className="flex justify-between items-center text-xs text-[#0D3C6A] font-medium">
                            <span>Taxes & Shipping</span>
                            <span>₹{taxesAndShippingLegacy.toFixed(2).replace(/\.00$/, "")}</span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-between items-center text-sm font-bold text-[#0D3C6A] pt-3 border-t border-[#B0B7C3]/50">
                  <span>Total</span>
                  <span>₹{(order.total || 0).toFixed(2).replace(/\.00$/, "")}</span>
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

              {/* Order Status Timeline */}
              {order.statusTimeline && order.statusTimeline.length > 0 && (
                <div>
                  <div className="flex justify-between items-center border-b border-[#B0B7C3] pb-2 mb-4 cursor-pointer" onClick={() => setShowTracking(!showTracking)}>
                    <h3 className="font-serif text-base text-[#0D3C6A] uppercase tracking-wider">
                      Tracking History
                    </h3>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#00A896] hover:text-[#0D3C6A] transition-colors bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#B0B7C3]">
                      {showTracking ? "Hide Track" : "Track"}
                    </button>
                  </div>
                  
                  {showTracking && (
                    <div className="relative pl-4 space-y-4">
                      <div className="absolute top-2 bottom-2 left-[5px] w-0.5 bg-[#B0B7C3]/50"></div>
                      {(() => {
                        let displayTimeline = [...(order.statusTimeline || [])];
                        
                        // Fallback: Check if order level return exists but missing in timeline
                        if (order.status === "Return Requested" && !displayTimeline.some(e => e.status === "Return Requested")) {
                          displayTimeline.push({ status: "Return Requested", timestamp: new Date().toISOString() });
                        }
                        if (order.status === "Return Approved" && !displayTimeline.some(e => e.status === "Return Approved")) {
                          displayTimeline.push({ status: "Return Approved", timestamp: new Date().toISOString() });
                        }
                        if (order.status === "Returned" && !displayTimeline.some(e => e.status === "Returned")) {
                          displayTimeline.push({ status: "Returned", timestamp: new Date().toISOString() });
                        }

                        // Fallback: Check if item level returns exist but missing in timeline
                        if (order.items) {
                          order.items.forEach((item: any) => {
                            if (item.returnStatus) {
                              const expectedStatus = `${item.returnStatus} (${item.name})`;
                              if (!displayTimeline.some(e => e.status === expectedStatus || e.status === item.returnStatus)) {
                                displayTimeline.push({ status: expectedStatus, timestamp: new Date().toISOString() });
                              }
                            }
                          });
                        }
                        
                        // Sort by timestamp
                        displayTimeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                        return displayTimeline.map((event: any, idx: number) => {
                          const isLast = idx === displayTimeline.length - 1;
                          const dateObj = new Date(event.timestamp);
                      const formattedDate = dateObj.toLocaleDateString();
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-white ${isLast ? 'bg-[#00A896]' : 'bg-[#B0B7C3]'}`}></div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-[#0D3C6A]' : 'text-[#6B7280]'}`}>{event.status}</p>
                          <p className="text-[10px] text-[#6B7280]">{formattedDate} • {formattedTime}</p>
                        </div>
                      );
                    })})()}
                  </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setReviewItem(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF6F0] text-[#00A896] hover:bg-[#0D3C6A] hover:text-white transition-colors">✕</button>
            <h3 className="font-serif text-3xl text-[#0D3C6A] font-light mb-6 uppercase tracking-wider">
              Write a Review
            </h3>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Rating</label>
                <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]">
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Review</label>
                <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]" placeholder="What did you think of this product?"></textarea>
              </div>
              <button disabled={submittingReview} onClick={submitReview} className="w-full bg-[#0D3C6A] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#383838] transition-colors disabled:opacity-50 mt-2">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
