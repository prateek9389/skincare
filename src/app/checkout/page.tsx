"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Product } from "@/data/products";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartLoadedRef = useRef(false);

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
    shippingMethod: "standard", // standard ($0) or express ($15)
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Sync cart with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aura_cart");
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
    cartLoadedRef.current = true;
  }, [router]);

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
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountRate = discountApplied ? 0.15 : 0;
  const discountAmount = subtotal * discountRate;
  const shippingCost = formData.shippingMethod === "express" ? 15.0 : 0.0;
  const taxRate = 0.08; // 8% sales tax
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + shippingCost + taxAmount;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const applyDiscount = () => {
    if (discountCode.trim().toUpperCase() === "AURA15") {
      setDiscountApplied(true);
      setDiscountError("");
    } else {
      setDiscountError("Invalid discount code. Try 'AURA15'!");
      setDiscountApplied(false);
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
    if (!formData.cardNumber.match(/^\d{16}$/)) newErrors.cardNumber = "Please enter a valid 16-digit card number";
    if (!formData.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) newErrors.expiry = "Use MM/YY format";
    if (!formData.cvv.match(/^\d{3}$/)) newErrors.cvv = "Enter 3-digit CVV";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateShippingForm()) {
        setStep(2);
      }
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    // Place Order:
    // 1. Generate Order details
    const orderId = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const newOrder = {
      orderId,
      date: orderDate,
      total: grandTotal,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      status: "Processing",
    };

    // 2. Save new order to orders history list in localStorage
    const existingOrders = localStorage.getItem("aura_orders");
    let ordersList = [];
    if (existingOrders) {
      try {
        ordersList = JSON.parse(existingOrders);
      } catch (e) {}
    }
    ordersList.unshift(newOrder); // Add to beginning of history list
    localStorage.setItem("aura_orders", JSON.stringify(ordersList));

    // 3. Save order confirmation to temp session storage so thank-you page can load it
    localStorage.setItem("aura_last_order", JSON.stringify(newOrder));

    // 4. Clear checkout bag from localStorage
    localStorage.removeItem("aura_cart");

    // 5. Redirect to thank-you route
    router.push("/thank-you");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] selection:bg-[#D4C5B9] selection:text-[#1C1B19] relative overflow-x-hidden pt-20">
      <Header cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 select-none text-left">
        
        {/* Step indicators */}
        <div className="flex items-center justify-center space-x-4 mb-12 text-xs tracking-widest uppercase font-semibold text-[#8C8276]">
          <span className={`${step === 1 ? "text-[#1C1B19]" : ""}`}>01. Shipping Info</span>
          <span>&rarr;</span>
          <span className={`${step === 2 ? "text-[#1C1B19]" : ""}`}>02. Payment Details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* A. LEFT SIDEBAR: STEP FORMS */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#EAE3DC] shadow-sm space-y-8">
            {step === 1 ? (
              
              /* STEP 1: SHIPPING & CONTACT DETAILS */
              <form onSubmit={handleNextStep} className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#1C1B19] font-light uppercase tracking-wider mb-4 border-b border-[#EAE3DC] pb-2">
                    Contact Information
                  </h2>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFieldChange}
                      placeholder="e.g. skin@aura.com"
                      className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs bg-transparent focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                    />
                    {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl text-[#1C1B19] font-light uppercase tracking-wider mb-4 border-b border-[#EAE3DC] pb-2">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleFieldChange}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.firstName && <span className="text-[10px] text-red-500">{errors.firstName}</span>}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleFieldChange}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.lastName && <span className="text-[10px] text-red-500">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 mt-4">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFieldChange}
                      placeholder="Street name & apt number"
                      className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                    />
                    {errors.address && <span className="text-[10px] text-red-500">{errors.address}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFieldChange}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.city && <span className="text-[10px] text-red-500">{errors.city}</span>}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleFieldChange}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.state && <span className="text-[10px] text-red-500">{errors.state}</span>}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleFieldChange}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.zipCode && <span className="text-[10px] text-red-500">{errors.zipCode}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 mt-4">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFieldChange}
                      className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                    />
                    {errors.phone && <span className="text-[10px] text-red-500">{errors.phone}</span>}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl text-[#1C1B19] font-light uppercase tracking-wider mb-4 border-b border-[#EAE3DC] pb-2">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between border border-[#D4C5B9] rounded-xl p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3 text-xs text-[#1C1B19]">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="standard"
                          checked={formData.shippingMethod === "standard"}
                          onChange={handleFieldChange}
                          className="accent-[#1C1B19]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">Standard Shipping</span>
                          <span className="text-[10px] text-[#8C8276]">3 - 6 Business Days</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold">Free</span>
                    </label>

                    <label className="flex items-center justify-between border border-[#D4C5B9] rounded-xl p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3 text-xs text-[#1C1B19]">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="express"
                          checked={formData.shippingMethod === "express"}
                          onChange={handleFieldChange}
                          className="accent-[#1C1B19]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">Express Shipping</span>
                          <span className="text-[10px] text-[#8C8276]">1 - 2 Business Days</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold">$15.00</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1C1B19] hover:bg-[#383838] text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg mt-6"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              
              /* STEP 2: PAYMENT METHOD INFO */
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#1C1B19] font-light uppercase tracking-wider mb-4 border-b border-[#EAE3DC] pb-2">
                    Payment Details
                  </h2>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Skin Enthusiast"
                      className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 mt-4">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleFieldChange}
                      placeholder="16-digit card number"
                      maxLength={16}
                      className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                    />
                    {errors.cardNumber && <span className="text-[10px] text-red-500">{errors.cardNumber}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleFieldChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.expiry && <span className="text-[10px] text-red-500">{errors.expiry}</span>}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[#8C8276]">Security Code (CVV)</label>
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleFieldChange}
                        placeholder="3 digits"
                        maxLength={3}
                        className="border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#1C1B19] focus:outline-none"
                      />
                      {errors.cvv && <span className="text-[10px] text-red-500">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-[#1C1B19] text-[#1C1B19] py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#1C1B19] hover:bg-[#383838] text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                  >
                    Place Order (${grandTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* B. RIGHT SIDEBAR: ORDER SUMMARY PANEL */}
          <div className="lg:col-span-5 bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#EAE3DC] space-y-6">
            <h3 className="font-serif text-lg text-[#1C1B19] font-light uppercase tracking-wider border-b border-[#EAE3DC] pb-3">
              Order Summary
            </h3>

            {/* Cart products listing */}
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-none pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-[#EAE3DC] p-1 flex items-center justify-center shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow text-left space-y-0.5">
                    <h4 className="font-serif text-xs font-semibold text-[#1C1B19] line-clamp-1">{item.product.name}</h4>
                    <p className="text-[10px] text-[#8C8276] uppercase tracking-wider">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#1C1B19] whitespace-nowrap">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Promo Box */}
            <div className="border-t border-[#EAE3DC] pt-4 space-y-2">
              <label className="text-[9px] uppercase tracking-wider text-[#8C8276] block">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AURA15"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow border border-[#D4C5B9] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
                />
                <button
                  onClick={applyDiscount}
                  className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:opacity-85"
                >
                  Apply
                </button>
              </div>
              {discountApplied && <span className="text-[10px] text-green-600 block">✨ 15% discount code applied!</span>}
              {discountError && <span className="text-[10px] text-red-500 block">{discountError}</span>}
            </div>

            {/* Bills Breakdown */}
            <div className="border-t border-[#EAE3DC] pt-4 space-y-3.5 text-xs text-[#8C8276] tracking-wide">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#1C1B19] font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount (15%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#1C1B19] font-medium">
                  {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="text-[#1C1B19] font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#1C1B19] font-bold uppercase tracking-wider border-t border-[#EAE3DC] pt-3">
                <span>Total Amount</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
