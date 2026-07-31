"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import Image from "next/image";
import { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
}

type Tab = "orders" | "settings" | "cart";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = React.useRef(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Settings State
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load Cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gunalife_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
    setTimeout(() => { cartLoadedRef.current = true; }, 100);
  }, []);

  // Sync Cart to localStorage
  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("gunalife_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await Promise.all([
          fetchOrders(currentUser.uid),
          fetchProfile(currentUser.uid)
        ]);
      } else {
        setLoadingOrders(false);
        setLoadingProfile(false);
        setIsAuthModalOpen(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      ordersList.sort((a: any, b: any) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, "users", user.uid), formData, { merge: true });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    if (status === "Delivered") return "bg-green-50 text-green-600 border-green-200";
    if (status === "Shipped") return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-amber-50 text-amber-600 border-amber-200";
  };

  const renderOrders = () => {
    if (loadingOrders) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#5BA6D6] border-t-[#0D3C6A] animate-spin" />
          <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Loading Orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-20 border border-[#B0B7C3] rounded-3xl bg-[#FAF6F0]/50">
          <h3 className="font-serif text-xl text-[#0D3C6A] mb-2">No orders found</h3>
          <p className="text-xs text-[#00A896] mb-6">Looks like you haven't placed any orders yet.</p>
          <Link href="/shop" className="bg-[#0D3C6A] hover:bg-[#383838] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
            Start Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white border border-[#B0B7C3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row">
            {/* Images side */}
            <div className="bg-[#FAF6F0] p-6 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-[#B0B7C3] flex items-center justify-center relative">
              {order.items && order.items.length > 0 && (
                <div className="relative w-32 h-32">
                  <Image 
                    src={order.items[0].image || "/placeholder.png"} 
                    alt={order.items[0].name || "Product"} 
                    fill 
                    sizes="128px"
                    className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              {order.items && order.items.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white border border-[#B0B7C3] rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-bold text-[#0D3C6A] shadow-sm">
                  +{order.items.length - 1}
                </div>
              )}
            </div>
            
            {/* Details side */}
            <div className="p-6 sm:w-2/3 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-lg text-[#0D3C6A] font-bold uppercase tracking-wider">{order.orderId}</h2>
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-1">Placed on {order.date}</p>
                </div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status || "Processing"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-[#BCAE9E] uppercase tracking-widest font-bold mb-1">Payment Method</p>
                  <p className="text-xs font-medium text-[#0D3C6A]">{order.paymentMethod || "Credit Card"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#BCAE9E] uppercase tracking-widest font-bold mb-1">Total Amount</p>
                  <p className="text-xs font-bold text-[#0D3C6A]">₹{(order.total || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#B0B7C3]/50 flex justify-end">
                <Link href={`/orders/${order.orderId}`} className="text-xs font-bold text-[#0D3C6A] uppercase tracking-widest hover:text-[#5BA6D6] transition-colors flex items-center gap-1 border border-[#0D3C6A] px-4 py-2 rounded-full hover:bg-neutral-50">
                  View Order Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => {
    if (loadingProfile) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#5BA6D6] border-t-[#0D3C6A] animate-spin" />
        </div>
      );
    }
    return (
      <form onSubmit={handleSaveProfile} className="bg-white border border-[#B0B7C3] rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="font-serif text-xl text-[#0D3C6A]">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">First Name</label>
            <input 
              required
              type="text" 
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Last Name</label>
            <input 
              required
              type="text" 
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Email Address</label>
            <input 
              type="text" 
              value={user?.email || ""}
              disabled
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#00A896] opacity-70 cursor-not-allowed" 
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
        </div>

        <h2 className="font-serif text-xl text-[#0D3C6A] pt-4 border-t border-[#B0B7C3]/50">Shipping Address</h2>
        
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Street Address</label>
          <input 
            type="text" 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">City</label>
            <input 
              type="text" 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">State/Province</label>
            <input 
              type="text" 
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Zip Code</label>
            <input 
              type="text" 
              value={formData.zipCode}
              onChange={e => setFormData({...formData, zipCode: e.target.value})}
              className="bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]" 
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={savingProfile}
            className="bg-[#0D3C6A] hover:bg-[#383838] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  const renderCart = () => {
    if (cartItems.length === 0) {
      return (
        <div className="text-center py-20 border border-[#B0B7C3] rounded-3xl bg-[#FAF6F0]/50">
          <h3 className="font-serif text-xl text-[#0D3C6A] mb-2">Your cart is empty</h3>
          <p className="text-xs text-[#00A896] mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop" className="bg-[#0D3C6A] hover:bg-[#383838] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
            Start Shopping
          </Link>
        </div>
      );
    }
    
    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    return (
      <div className="bg-white border border-[#B0B7C3] rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="font-serif text-xl text-[#0D3C6A]">Shopping Cart</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between border-b border-[#B0B7C3]/50 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FAF6F0] rounded-xl flex items-center justify-center p-2 relative">
                  <Image src={item.product.image || "/placeholder.png"} alt={item.product.name} fill sizes="64px" className="object-contain drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0D3C6A] uppercase tracking-wider">{item.product.name}</h3>
                  <p className="text-[10px] text-[#00A896]">₹{item.product.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#B0B7C3] rounded-full px-2 py-1">
                  <button onClick={() => handleUpdateQuantity(item.product.id, -1)} className="px-2 text-[#0D3C6A] hover:text-[#00A896]">-</button>
                  <span className="px-2 text-[10px] font-bold text-[#0D3C6A] w-4 text-center">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.product.id, 1)} className="px-2 text-[#0D3C6A] hover:text-[#00A896]">+</button>
                </div>
                <button onClick={() => handleRemoveItem(item.product.id)} className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 flex justify-between items-center">
          <p className="font-serif text-lg text-[#0D3C6A]">Total: <span className="font-bold">₹{total.toFixed(2)}</span></p>
          <Link href="/checkout" className="bg-[#0D3C6A] hover:bg-[#383838] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md">
            Checkout
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EB] selection:bg-[#5BA6D6] selection:text-[#0D3C6A] pt-20">
      <Header cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          router.push("/shop");
        }} 
        onSuccess={handleAuthSuccess}
      />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 select-none text-left flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-[#0D3C6A] font-light uppercase tracking-wider mb-2">
              Profile
            </h1>
            <p className="text-[10px] text-[#00A896] uppercase tracking-widest">
              {user?.email || "Manage your account"}
            </p>
          </div>
          
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest ${
              activeTab === "orders" 
                ? "bg-white text-[#0D3C6A] shadow-sm border border-[#B0B7C3]" 
                : "text-[#00A896] hover:bg-white/50 hover:text-[#0D3C6A]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Orders
          </button>
          
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest ${
              activeTab === "settings" 
                ? "bg-white text-[#0D3C6A] shadow-sm border border-[#B0B7C3]" 
                : "text-[#00A896] hover:bg-white/50 hover:text-[#0D3C6A]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
            Account Settings
          </button>
          
          <button
            onClick={() => setActiveTab("cart")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest ${
              activeTab === "cart" 
                ? "bg-white text-[#0D3C6A] shadow-sm border border-[#B0B7C3]" 
                : "text-[#00A896] hover:bg-white/50 hover:text-[#0D3C6A]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            My Cart
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {!user ? (
             <div className="text-center py-20 text-[#0D3C6A]">
               <p>Please log in to view your profile.</p>
             </div>
          ) : (
            <>
              {activeTab === "orders" && renderOrders()}
              {activeTab === "settings" && renderSettings()}
              {activeTab === "cart" && renderCart()}
            </>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
