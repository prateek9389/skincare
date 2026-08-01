"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Product } from "@/data/products";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp, onSnapshot } from "firebase/firestore";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form Steps State
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

  // Form Fields
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    shippingMethod: "standard", // standard (₹0) or express (₹15)
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card"); // card or upi
  const [upiId, setUpiId] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Discount code state
  // Discount code state
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");

  // Sync cart with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gunalife_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCartItems(parsed);
        // If cart is empty, redirect back to shop
        if (parsed.length === 0) {
          router.push("/shop");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      router.push("/shop");
    }
    setTimeout(() => { cartLoadedRef.current = true; }, 100);

    // Fetch Coupons (Real-time)
    const unsubscribeCoupons = onSnapshot(collection(db, "coupons"), (couponsSnap) => {
      const couponsList = couponsSnap.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as any));
      const activeCoupons = couponsList.filter(c => c.status === "Active");
      setAvailableCoupons(activeCoupons);
    }, (error) => {
      console.error("Error listening to coupons:", error);
    });

    // Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setFormData((prev) => ({ ...prev, email: currentUser.email || "" }));
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.address && data.city && data.zipCode) {
              setHasSavedAddress(true);
              setShowAddressForm(false);
            }
            setFormData((prev) => ({
              ...prev,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              address: data.address || prev.address,
              city: data.city || prev.city,
              state: data.state || prev.state,
              zipCode: data.zipCode || prev.zipCode,
              phone: data.phone || prev.phone,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch address", err);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeCoupons();
    };
  }, [router]);

  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("gunalife_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const applicableCouponsForCart = React.useMemo(() => {
    return availableCoupons.filter(coupon => {
      if (coupon.productId === "all") return true;
      return cartItems.some(item => item.product.id === coupon.productId);
    });
  }, [availableCoupons, cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      const isStillActive = applicableCouponsForCart.some(c => c.id === appliedCoupon.id);
      if (!isStillActive) {
        setAppliedCoupon(null);
        setDiscountCode("");
        setDiscountError("The applied coupon is no longer valid or active.");
      }
    }
  }, [applicableCouponsForCart, appliedCoupon]);

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

  // Order cost calculations
  // Order cost calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    const rateString = appliedCoupon.discount || "0";
    const rateMatch = rateString.match(/(\d+)/);
    const rate = rateMatch ? parseInt(rateMatch[0], 10) / 100 : 0;
    
    if (appliedCoupon.productId === "all") {
      discountAmount = subtotal * rate;
    } else {
      // Calculate discount only on the specific product
      const applicableItems = cartItems.filter(item => item.product.id === appliedCoupon.productId);
      const applicableSubtotal = applicableItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      discountAmount = applicableSubtotal * rate;
    }
  }

  const standardShippingCost: number = subtotal > 499 ? 0.0 : 50.0;
  const shippingCost: number = standardShippingCost;
  const taxRate = 0.08; // 8% sales tax
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + shippingCost + taxAmount;


  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const applyDiscount = (code: string) => {
    const codeUpper = code.trim().toUpperCase();
    if (!codeUpper) {
      setAppliedCoupon(null);
      setDiscountError("");
      return;
    }
    
    const coupon = applicableCouponsForCart.find(c => (c.code || c.id) === codeUpper);
    if (coupon) {
      setAppliedCoupon(coupon);
      setDiscountError("");
      setDiscountCode(codeUpper);
    } else {
      setDiscountError("Invalid or not applicable discount code for your cart items.");
      setAppliedCoupon(null);
    }
  };

  const validateShippingForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Please enter a valid email address";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = () => {
    const newErrors: Record<string, string> = {};
    if (paymentMethod === "card") {
      if (!formData.cardNumber.match(/^\d{16}$/)) newErrors.cardNumber = "Please enter a valid 16-digit card number";
      if (!formData.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) newErrors.expiry = "Use MM/YY format";
      if (!formData.cvv.match(/^\d{3}$/)) newErrors.cvv = "Enter 3-digit CVV";
    } else if (["upi", "phonepe", "gpay"].includes(paymentMethod)) {
      if (!upiId.match(/^[\w.-]+@[\w.-]+$/)) newErrors.upiId = "Please enter a valid UPI ID (e.g. name@upi)";
    }
    // COD requires no additional validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateShippingForm()) {
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          setStep(2);
        }
      }
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setStep(2);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;
    if (!user) return; // ensure user is logged in

    try {
      // 1. Save address if requested
      if (saveAddress) {
        await setDoc(doc(db, "users", user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        }, { merge: true });
      }

      // 2. Generate Order details
      const orderId = `GUNALIFE-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const newOrder = {
        orderId,
        userId: user.uid,
        customerName: `${formData.firstName} ${formData.lastName}`,
        date: orderDate,
        createdAt: serverTimestamp(),
        total: grandTotal,
        paymentMethod: paymentMethod === "card" ? "Credit Card" : (paymentMethod === "cod" ? "Cash on Delivery" : "UPI"),
        items: cartItems.map((item) => ({
          id: item.product.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        status: "Processing",
        couponCode: appliedCoupon ? appliedCoupon.code || appliedCoupon.id : null,
        discountAmount: discountAmount,
      };

      // 3. Save new order to Firestore
      await setDoc(doc(db, "orders", orderId), newOrder);

      // 4. Save order confirmation to temp session storage so thank-you page can load it
      localStorage.setItem("gunalife_last_order", JSON.stringify(newOrder));

      // 5. Clear checkout bag from localStorage
      localStorage.removeItem("gunalife_cart");

      // 6. Redirect to thank-you route
      router.push("/thank-you");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] selection:bg-[#5BA6D6] selection:text-[#0D3C6A] relative overflow-x-hidden pt-20">
      <Header cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
        initialEmail={formData.email}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 select-none text-left">
        
        {/* Step indicators */}
        <div className="flex items-center justify-center space-x-4 mb-12 text-xs tracking-widest uppercase font-semibold text-[#00A896]">
          <span className={`${step === 1 ? "text-[#0D3C6A]" : ""}`}>01. Shipping Info</span>
          <span>&rarr;</span>
          <span className={`${step === 2 ? "text-[#0D3C6A]" : ""}`}>02. Payment Details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* A. LEFT SIDEBAR: STEP FORMS */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#B0B7C3] shadow-sm space-y-8">
            {step === 1 ? (
              
              /* STEP 1: SHIPPING & CONTACT DETAILS */
              <form onSubmit={handleNextStep} className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-4 border-b border-[#B0B7C3] pb-2">
                    <h2 className="font-serif text-xl text-[#0D3C6A] font-light uppercase tracking-wider">
                      Shipping Address
                    </h2>
                    {hasSavedAddress && (
                      <button type="button" onClick={() => setShowAddressForm(!showAddressForm)} className="text-[10px] uppercase font-bold text-[#0D3C6A] hover:text-[#00A896] transition-colors bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#B0B7C3]">
                        {showAddressForm ? "Use Saved Address" : "+ Add New Address"}
                      </button>
                    )}
                  </div>

                  {!showAddressForm && hasSavedAddress ? (
                    <div className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl p-6 text-left shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-full bg-[#0D3C6A] text-white flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#0D3C6A]">{formData.firstName} {formData.lastName}</p>
                          <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-semibold">Default Address</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#0D3C6A] mt-2 ml-11 leading-relaxed">
                        {formData.address}<br />
                        {formData.city}, {formData.state} {formData.zipCode}<br />
                        {formData.phone}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFieldChange}
                          placeholder="e.g. skin@gunalife.com"
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                        {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleFieldChange}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.firstName && <span className="text-[10px] text-red-500">{errors.firstName}</span>}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleFieldChange}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.lastName && <span className="text-[10px] text-red-500">{errors.lastName}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 mt-4">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleFieldChange}
                          placeholder="Street name & apt number"
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                        {errors.address && <span className="text-[10px] text-red-500">{errors.address}</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleFieldChange}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.city && <span className="text-[10px] text-red-500">{errors.city}</span>}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleFieldChange}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.state && <span className="text-[10px] text-red-500">{errors.state}</span>}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">ZIP Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleFieldChange}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.zipCode && <span className="text-[10px] text-red-500">{errors.zipCode}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 mt-4">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFieldChange}
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                        {errors.phone && <span className="text-[10px] text-red-500">{errors.phone}</span>}
                      </div>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-[#0D3C6A]" />
                        <span className="text-xs text-[#0D3C6A]">Save this address for future orders</span>
                      </label>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0D3C6A] hover:bg-[#383838] text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg mt-6"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              
              /* STEP 2: PAYMENT METHOD INFO */
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#0D3C6A] font-light uppercase tracking-wider mb-4 border-b border-[#B0B7C3] pb-2">
                    Payment Details
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { id: 'card', label: 'Cards' },
                      { id: 'upi', label: 'UPI' },
                      { id: 'phonepe', label: 'PhonePe' },
                      { id: 'gpay', label: 'Google Pay' },
                      { id: 'cod', label: 'Cash on Delivery' },
                    ].map((method) => (
                      <label key={method.id} className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all text-center ${paymentMethod === method.id ? 'border-[#0D3C6A] bg-[#0D3C6A] text-white shadow-md' : 'border-[#B0B7C3] text-[#0D3C6A] hover:bg-neutral-50 hover:border-[#5BA6D6]'}`}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Skin Enthusiast"
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleFieldChange}
                          placeholder="16-digit card number"
                          maxLength={16}
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                        {errors.cardNumber && <span className="text-[10px] text-red-500">{errors.cardNumber}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleFieldChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.expiry && <span className="text-[10px] text-red-500">{errors.expiry}</span>}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#00A896]">Security Code (CVV)</label>
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleFieldChange}
                            placeholder="3 digits"
                            maxLength={3}
                            className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                          />
                          {errors.cvv && <span className="text-[10px] text-red-500">{errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === 'upi' || paymentMethod === 'phonepe' || paymentMethod === 'gpay') && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#00A896]">UPI ID / VPA</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setErrors((prev) => ({ ...prev, upiId: "" }));
                          }}
                          placeholder="e.g. username@upi"
                          className="border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#0D3C6A] focus:outline-none"
                        />
                        {errors.upiId && <span className="text-[10px] text-red-500">{errors.upiId}</span>}
                        <p className="text-[10px] text-[#00A896] mt-2">
                          {paymentMethod === 'phonepe' ? "A payment request will be sent to your PhonePe app." : paymentMethod === 'gpay' ? "A payment request will be sent to your Google Pay app." : "A payment request will be sent to your UPI app."} Complete the payment there to finalize your order.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="p-4 bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl text-xs text-[#0D3C6A] leading-relaxed">
                        <strong>Cash on Delivery selected.</strong> <br/>
                        You will pay the delivery agent in cash when your order arrives. Please ensure you have the exact amount available.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-[#0D3C6A] text-[#0D3C6A] py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0D3C6A] hover:bg-[#383838] text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                  >
                    Place Order (₹{grandTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* B. RIGHT SIDEBAR: ORDER SUMMARY PANEL */}
          <div className="lg:col-span-5 bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#B0B7C3] space-y-6">
            <h3 className="font-serif text-lg text-[#0D3C6A] font-light uppercase tracking-wider border-b border-[#B0B7C3] pb-3">
              Order Summary
            </h3>

            {/* Cart products listing */}
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-none pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-center group">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-[#B0B7C3] p-1 flex items-center justify-center shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between h-16 text-left">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-xs font-semibold text-[#0D3C6A] line-clamp-2 leading-tight pr-2">{item.product.name}</h4>
                      <span className="text-xs font-semibold text-[#0D3C6A] whitespace-nowrap">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex items-center border border-[#B0B7C3] rounded-full overflow-hidden bg-white">
                        <button type="button" onClick={() => handleUpdateQuantity(item.product.id, -1)} className="px-2.5 py-0.5 text-[#0D3C6A] hover:bg-neutral-100 transition-colors text-xs">-</button>
                        <span className="text-[10px] font-bold text-[#0D3C6A] w-4 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => handleUpdateQuantity(item.product.id, 1)} className="px-2.5 py-0.5 text-[#0D3C6A] hover:bg-neutral-100 transition-colors text-xs">+</button>
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(item.product.id)} className="text-[10px] font-semibold text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors uppercase tracking-wider">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Promo Box */}
            <div className="border-t border-[#B0B7C3] pt-4 space-y-2">
              <label className="text-[9px] uppercase tracking-wider text-[#00A896] block">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow border border-[#5BA6D6] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none uppercase"
                />
                <button
                  onClick={() => applyDiscount(discountCode)}
                  className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:opacity-85"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && <span className="text-[10px] text-green-600 block">✨ {appliedCoupon.discount} code applied!</span>}
              {discountError && <span className="text-[10px] text-red-500 block">{discountError}</span>}
              
              {applicableCouponsForCart.length > 0 && !appliedCoupon && (
                <div className="mt-3 pt-3 border-t border-[#B0B7C3]/50">
                  <span className="text-[9px] uppercase tracking-wider text-[#00A896] block mb-2">Available Coupons</span>
                  <div className="flex flex-wrap gap-2">
                    {applicableCouponsForCart.map(c => (
                      <button 
                        key={c.code || c.id} 
                        onClick={() => applyDiscount(c.code || c.id)}
                        className="text-[9px] font-bold uppercase tracking-wider bg-[#FAF6F0] border border-[#5BA6D6] text-[#0D3C6A] px-3 py-1.5 rounded-lg hover:bg-[#0D3C6A] hover:text-white transition-colors"
                      >
                        {c.code || c.id} ({c.discount})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bills Breakdown */}
            <div className="border-t border-[#B0B7C3] pt-4 space-y-3.5 text-xs text-[#00A896] tracking-wide">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#0D3C6A] font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.discount})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#0D3C6A] font-medium">
                  {shippingCost === 0 ? "Free Delivery" : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="text-[#0D3C6A] font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#0D3C6A] font-bold uppercase tracking-wider border-t border-[#B0B7C3] pt-3">
                <span>Total Amount</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
