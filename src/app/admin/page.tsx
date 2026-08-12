"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import ProductManager from "./ProductManager";
import CategoryManager from "./CategoryManager";
import HeroManager from "./HeroManager";
import { useStoreSettings } from "@/lib/useStoreSettings";

// ============================================================
// Inline SVG Icon Components (avoiding lucide-react dependency)
// ============================================================
const IconProps = "w-4 h-4";
const SvgIcon = ({ d, className = IconProps }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

const LayoutDashboard = ({ className = IconProps }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);
const Package = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />;
const ShoppingBag = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />;
const Users = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />;
const BarChart3 = ({ className = IconProps }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
  </svg>
);
const Percent = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M19 5L5 19M6.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />;
const MessageSquare = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
const Truck = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />;
const SettingsIcon = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />;
const History = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const Plus = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 5v14M5 12h14" />;
const Search = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const TrendingUp = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M23 6l-9.5 9.5-5-5L1 18" />;
const DollarSign = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6" />;
const LogOut = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />;
const Star = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const MapPin = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a3 3 0 100-6 3 3 0 000 6z" />;
const Bell = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />;
const Mail = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6" />;
const Phone = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />;
const Box = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12" />;
const Clock = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const Heart = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />;
const Eye = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z" />;
const Globe = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />;
const Shield = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const Zap = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const Award = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12" />;
const Menu = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M4 6h16M4 12h16M4 18h16" />;
const X = ({ className = IconProps }: { className?: string }) => <SvgIcon className={className} d="M6 18L18 6M6 6l12 12" />;

// ============================================================
// Types
// ============================================================
interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  returnStatus?: "Return Requested" | "Return Approved" | "Return Rejected";
  returnReason?: string;
}

interface OrderDetails {
  orderId: string;
  date: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  status: string;
  statusTimeline?: { status: string; timestamp: string }[];
  couponCode?: string | null;
  discountAmount?: number;
  customerName?: string;
  phone?: string;
  createdAt?: any;
  readByAdmin?: boolean;
  returnReason?: string;
}

type SectionType =
  | "Dashboard"
  | "Hero"
  | "Products"
  | "Categories"
  | "Orders"
  | "Customers"
  | "Analytics"
  | "Discounts"
  | "Reviews"
  | "Shipping"
  | "Settings"
  | "Logs";

// ============================================================
// Shared image pool (uses existing public assets from the store)
// ============================================================
const IMG = {
  cream: "/cream-cleanser.png",
  toner: "/niacinamide-toner.png",
  moisturizer: "/category-moisturizers.png",
  serum: "/category-serums.png",
};

// ============================================================
// Reusable UI Primitives
// ============================================================
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-left">
    <h3 className="font-serif text-lg text-[#0D3C6A] font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-0.5">{subtitle}</p>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-[#B0B7C3] rounded-3xl shadow-sm ${className}`}>{children}</div>
);

const Pill = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "green" | "blue" | "amber" | "neutral" | "red" }) => {
  const tones: Record<string, string> = {
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-[#FAF6F0] text-[#00A896] border-[#5BA6D6]",
  };
  return (
    <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
};

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<SectionType>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ orderId: string, status: string } | null>(null);

  // Monthly Target Modal State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetInputValue, setTargetInputValue] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);

  const handleSaveMonthlyTarget = async () => {
    const val = parseInt(targetInputValue, 10);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    setSavingTarget(true);
    try {
      await setDoc(doc(db, "admin", "dashboardStats"), { monthlyTarget: val }, { merge: true });
      setAdminStats(prev => ({ ...prev, monthlyTarget: val }));
      setIsTargetModalOpen(false);
    } catch (err) {
      console.error("Failed to update monthly target:", err);
      alert("Failed to update target.");
    } finally {
      setSavingTarget(false);
    }
  };

  const handleUpdateItemReturnStatus = async (orderId: string, itemIdx: number, newStatus: string) => {
    try {
      const o = orders.find(x => x.orderId === orderId);
      if (!o) return;
      const newItems = [...o.items];
      newItems[itemIdx] = { ...newItems[itemIdx], returnStatus: newStatus as any };
      
      const timelineEventMsg = `${newStatus} (${newItems[itemIdx].name})`;
      
      await setDoc(doc(db, "orders", orderId), { 
        items: newItems,
        statusTimeline: arrayUnion({ status: timelineEventMsg, timestamp: new Date().toISOString() })
      }, { merge: true });
      
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, items: newItems });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update item return status.");
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateString = currentDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentHour = currentDate.getHours();
  let greeting = "Good evening";
  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 17) greeting = "Good afternoon";
  else if (currentHour < 21) greeting = "Good evening";
  else greeting = "Good night";
  const [adminStats, setAdminStats] = useState({ activeCustomers: 0, monthlyTarget: 0, revenueOffset: 0, ordersOffset: 0, conversionRate: 0, bounceRate: 0, returnRate: 0, delivered7dOffset: 0, avgDeliveryDays: 0, onTimeRate: 0 });
  const [totalUsersCountReal, setTotalUsersCountReal] = useState(0);
  const [shippingZones, setShippingZones] = useState<any[]>([]);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminPasswordMessage, setAdminPasswordMessage] = useState("");

  const { settings, updateSettings } = useStoreSettings();
  const [formSettings, setFormSettings] = useState(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings(formSettings);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === "auraadmin123@gmail.com") {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginEmail !== "auraadmin123@gmail.com") {
      setLoginError("Unauthorized access. Admin only.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      setLoginError(err.message || "Invalid credentials.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordMessage("");
    if (!user || !user.email) return;
    if (adminNewPassword.length < 6) {
      setAdminPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, adminCurrentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, adminNewPassword);
      setAdminPasswordMessage("Password updated successfully!");
      setAdminCurrentPassword("");
      setAdminNewPassword("");
    } catch (err: any) {
      console.error(err);
      setAdminPasswordMessage(err.message || "Failed to update password. Check your current password.");
    }
  };

  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10% Off");
  const [newCouponProduct, setNewCouponProduct] = useState("all");
  const [chartFilter, setChartFilter] = useState<"7d" | "30d" | "90d" | "12m" | "All">("12m");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered" | "Returned" | "Return Requested" | "Return Approved">("All");
  const [reviewFilter, setReviewFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
  const [productView, setProductView] = useState<"grid" | "list">("grid");
  const updatingOrdersRef = useRef<Set<string>>(new Set());
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Load data from Firestore
  useEffect(() => {
    if (!user) return; // Only fetch if logged in

    // Set up real-time listener for orders
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (querySnapshot) => {
      const ordersList = querySnapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as unknown as OrderDetails));
      ordersList.sort((a, b) => {
        const timeA = (a as any).createdAt ? (a as any).createdAt.toMillis() : 0;
        const timeB = (b as any).createdAt ? (b as any).createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setOrders(ordersList);
    }, (err) => {
      console.error("Error listening to orders:", err);
    });

    const fetchData = async () => {
      try {
        const statsDoc = await getDoc(doc(db, "admin", "dashboardStats"));
        if (statsDoc.exists()) {
          setAdminStats({
            activeCustomers: statsDoc.data().activeCustomers !== undefined ? statsDoc.data().activeCustomers : 0,
            monthlyTarget: statsDoc.data().monthlyTarget !== undefined ? statsDoc.data().monthlyTarget : 0,
            revenueOffset: statsDoc.data().revenueOffset !== undefined ? statsDoc.data().revenueOffset : 0,
            ordersOffset: statsDoc.data().ordersOffset !== undefined ? statsDoc.data().ordersOffset : 0,
            conversionRate: statsDoc.data().conversionRate !== undefined ? statsDoc.data().conversionRate : 0,
            bounceRate: statsDoc.data().bounceRate !== undefined ? statsDoc.data().bounceRate : 0,
            returnRate: statsDoc.data().returnRate !== undefined ? statsDoc.data().returnRate : 0,
            delivered7dOffset: statsDoc.data().delivered7dOffset !== undefined ? statsDoc.data().delivered7dOffset : 0,
            avgDeliveryDays: statsDoc.data().avgDeliveryDays !== undefined ? statsDoc.data().avgDeliveryDays : 0,
            onTimeRate: statsDoc.data().onTimeRate !== undefined ? statsDoc.data().onTimeRate : 0
          });
        }

        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsersCountReal(usersSnap.docs.length);


        const couponsSnap = await getDocs(collection(db, "coupons"));
        const couponsList = couponsSnap.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as any));
        if (couponsList.length > 0) {
          setCoupons(couponsList);
        }

        const reviewsSnap = await getDocs(collection(db, "reviews"));
        const reviewsList = reviewsSnap.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as any));
        reviewsList.sort((a, b) => {
          const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        const mappedReviews = reviewsList.map(r => {
          const prod = PRODUCTS.find(p => p.id === r.productId);
          return {
            ...r,
            productName: prod?.name || "Unknown Product",
            productImg: prod?.image || "",
            dateStr: r.createdAt ? new Date(r.createdAt.toMillis()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently"
          };
        });
        setReviews(mappedReviews);

        const zonesSnap = await getDocs(collection(db, "shippingZones"));
        const zonesList = zonesSnap.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as any));
        if (zonesList.length > 0) {
          setShippingZones(zonesList);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };
    fetchData();

    return () => {
      unsubscribeOrders();
    };
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (updatingOrdersRef.current.has(orderId)) return;
    updatingOrdersRef.current.add(orderId);

    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      // If the order is already in this status in the database, do not process again
      if (orderSnap.exists() && orderSnap.data().status === newStatus) {
        return;
      }

      await setDoc(orderRef, { 
        status: newStatus,
        statusTimeline: arrayUnion({ status: newStatus, timestamp: new Date().toISOString() })
      }, { merge: true });

      if (newStatus === "Delivered") {
        const order = orders.find((o) => o.orderId === orderId);
        if (order && order.items) {
          for (const item of order.items) {
            const prodId = item.productId || item.id;
            if (prodId) {
              const prodRef = doc(db, "products", prodId);
              const prodSnap = await getDoc(prodRef);
              if (prodSnap.exists()) {
                const currentInventory = prodSnap.data().inventory || 0;
                const qtyToDeduct = Number(item.quantity) || 1;
                const newInventory = Math.max(0, currentInventory - qtyToDeduct);
                await setDoc(prodRef, { inventory: newInventory }, { merge: true });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status in database.");
    } finally {
      updatingOrdersRef.current.delete(orderId);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const codeId = newCouponCode.toUpperCase();
    const newCoupon = { code: codeId, discount: newCouponDiscount, productId: newCouponProduct, status: "Active", usages: 0 };

    setCoupons((prev) => [...prev, { ...newCoupon, id: codeId }]);
    setNewCouponCode("");
    setNewCouponProduct("all");

    try {
      await setDoc(doc(db, "coupons", codeId), newCoupon);
    } catch (err) {
      console.error("Failed to add coupon:", err);
    }
  };

  const handleToggleCoupon = async (code: string) => {
    const couponToUpdate = coupons.find(c => (c.code || c.id) === code);
    if (!couponToUpdate) return;

    const newStatus = couponToUpdate.status === "Active" ? "Expired" : "Active";
    setCoupons((prev) => prev.map((c) => ((c.code || c.id) === code ? { ...c, status: newStatus } : c)));

    try {
      await setDoc(doc(db, "coupons", code), { status: newStatus }, { merge: true });
    } catch (err) {
      console.error("Failed to update coupon:", err);
    }
  };

  const handleUpdateReviewStatus = async (reviewId: string, newStatus: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
    try {
      await setDoc(doc(db, "reviews", reviewId), { status: newStatus }, { merge: true });
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  // Dashboard Stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const activeCustomersCount = adminStats.activeCustomers;

  const conversionRate = adminStats.conversionRate;
  const bounceRate = adminStats.bounceRate;
  const returnRate = adminStats.returnRate;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : "0.00";

  // Shipping Stats
  const inTransitCount = orders.filter(o => o.status === "Shipped").length;
  const deliveredTotal = orders.filter(o => o.status === "Delivered").length;
  const avgDeliveryDays = adminStats.avgDeliveryDays;
  const onTimeRate = adminStats.onTimeRate;

  // Derived Top Products Data
  const topProductsList = useMemo(() => {
    const productSales = new Map<string, number>();

    orders.forEach(order => {
      order.items?.forEach(item => {
        const pId = item.productId || item.id;
        if (pId) {
          productSales.set(pId, (productSales.get(pId) || 0) + (item.price * item.quantity));
        }
      });
    });

    const mapped = Array.from(productSales.entries()).map(([id, rev]) => {
      const prod = PRODUCTS.find(p => p.id === id);
      return {
        id,
        name: prod?.name || "Unknown Product",
        image: prod?.image || "",
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const maxRev = mapped.length > 0 ? mapped[0].revenue : 1;
    return mapped.map(p => ({ ...p, pct: Math.round((p.revenue / maxRev) * 100) }));
  }, [orders]);

  // Derived Top Regions Data
  const topRegionsList = useMemo(() => {
    const regionSales = new Map<string, number>();

    orders.forEach(order => {
      const addressStr = order.shippingAddress;
      if (addressStr) {
        const parts = addressStr.split(',');
        let region = "Unknown";
        if (parts.length >= 2) {
          const stateZip = parts[parts.length - 1].trim();
          region = stateZip.split(' ')[0] || stateZip;
        } else {
          region = addressStr;
        }

        regionSales.set(region, (regionSales.get(region) || 0) + order.total);
      }
    });

    const totalRev = Array.from(regionSales.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(regionSales.entries()).map(([region, rev]) => ({
      region,
      revenue: rev,
      pct: totalRev > 0 ? Math.round((rev / totalRev) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  // Derived Customers Data
  const customersList = useMemo(() => {
    const customerMap = new Map<string, any>();

    orders.forEach((order) => {
      const key = (order as any).userId || (order as any).customerName || "unknown";

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: (order as any).customerName || "Unknown",
          email: "Not provided",
          ordersCount: 0,
          ltv: 0,
          firstOrderDate: (order as any).createdAt ? new Date((order as any).createdAt.toMillis()) : new Date(),
          loc: (order as any).shippingAddress ? (order as any).shippingAddress.split(',').slice(1).join(',').trim() || (order as any).shippingAddress : "Unknown Location",
          fav: (order as any).items?.[0]?.image || "",
        });
      }

      const cust = customerMap.get(key);
      cust.ordersCount += 1;
      cust.ltv += (order as any).total;
      const orderDate = (order as any).createdAt ? new Date((order as any).createdAt.toMillis()) : new Date();
      if (orderDate < cust.firstOrderDate) {
        cust.firstOrderDate = orderDate;
      }
    });

    return Array.from(customerMap.values()).map(c => {
      let tier = "Active Client";
      let tone = "blue";
      if (c.ltv > 500) { tier = "Gold Member"; tone = "amber"; }
      else if (c.ltv > 200) { tier = "Silver Member"; tone = "neutral"; }

      const now = new Date();
      const isNew = c.firstOrderDate.getMonth() === now.getMonth() && c.firstOrderDate.getFullYear() === now.getFullYear();
      if (isNew && c.ltv <= 200) {
        tier = "New Client";
        tone = "green";
      }

      return { ...c, tier, tone, isNew };
    }).sort((a, b) => b.ltv - a.ltv);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (orderFilter !== "All") {
      filtered = filtered.filter(o => o.status === orderFilter);
    }
    if (globalSearchQuery) {
      const fuse = new Fuse(filtered, { keys: ["orderId", "customerName", "email"], threshold: 0.3 });
      filtered = fuse.search(globalSearchQuery).map(res => res.item);
    }
    return filtered;
  }, [orders, orderFilter, globalSearchQuery]);

  const filteredCustomers = useMemo(() => {
    if (!globalSearchQuery) return customersList;
    const fuse = new Fuse(customersList, { keys: ["email", "name"], threshold: 0.3 });
    return fuse.search(globalSearchQuery).map(res => res.item);
  }, [customersList, globalSearchQuery]);

  // Generate Notifications
  const notifications = useMemo(() => {
    const notifs: any[] = [];
    
    // New Orders
    orders.filter(o => o.status === "Processing").forEach(o => {
      notifs.push({ 
        id: `order_${o.orderId}`, 
        title: "New Order", 
        message: `Order ${o.orderId} is waiting to be shipped.`, 
        type: "order",
        data: o
      });
    });
    
    // Return Requests
    orders.filter(o => o.status === "Return Requested" || (o.items && o.items.some(i => i.returnStatus === "Return Requested"))).forEach(o => {
      notifs.push({ 
        id: `return_${o.orderId}`, 
        title: "Return Request", 
        message: `Return requested for order ${o.orderId}.`, 
        type: "return",
        data: o
      });
    });
    
    // Pending Reviews
    reviews.filter(r => r.status === "Pending").forEach(r => {
      notifs.push({ 
        id: `review_${r.id}`, 
        title: "Pending Review", 
        message: `New review by ${r.userName || 'a customer'} needs approval.`, 
        type: "review" 
      });
    });
    
    return notifs;
  }, [orders, reviews]);

  const handleNotificationClick = (notif: any) => {
    setShowNotifications(false);
    
    if (notif.type === "order" || notif.type === "return") {
      setActiveSection("Orders");
      setSelectedOrder(notif.data);
      if (notif.type === "return") {
        setOrderFilter("Return Requested");
      }
    } else if (notif.type === "review") {
      setActiveSection("Reviews");
      setReviewFilter("Pending");
    }
  };

  const totalCustomersCalculated = customersList.length;
  const newThisMonthCalculated = customersList.filter(c => c.isNew).length;
  const goldMembersCalculated = customersList.filter(c => c.tier === "Gold Member").length;
  const avgLtvCalculated = customersList.length > 0 ? (customersList.reduce((acc, c) => acc + c.ltv, 0) / customersList.length).toFixed(2).replace(/\.00$/, "") : "0.00";

  const monthlyTargetAmount = adminStats.monthlyTarget || 100000;
  const calculatedMonthlyTargetPct = useMemo(() => {
    const now = new Date();
    const currentMonthRevenue = orders
      .filter(o => {
        const orderDate = o.createdAt ? new Date(o.createdAt.toMillis()) : new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + o.total, 0);
    return Math.min(100, Math.round((currentMonthRevenue / monthlyTargetAmount) * 100));
  }, [orders, monthlyTargetAmount]);

  const chartDataSets = useMemo(() => {
    const now = new Date();
    const getMap = (labels: string[]) => {
      const map = new Map<string, number>();
      labels.forEach(l => map.set(l, 0));
      return map;
    };

    const d7 = getMap(Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("en-US", { weekday: 'short' });
    }));

    const d30 = getMap(["W1", "W2", "W3", "W4"]);

    const d90 = getMap(Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (2 - i));
      return d.toLocaleDateString("en-US", { month: 'short' });
    }));

    const m12 = getMap(Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleDateString("en-US", { month: 'short' });
    }));

    const allMap = new Map<string, number>();

    orders.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt.toMillis()) : new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        const key = date.toLocaleDateString("en-US", { weekday: 'short' });
        if (d7.has(key)) d7.set(key, d7.get(key)! + o.total);
      }

      if (diffDays <= 30) {
        const wKey = `W${Math.min(4, Math.max(1, Math.ceil((31 - diffDays) / 7.5)))}`;
        if (d30.has(wKey)) d30.set(wKey, d30.get(wKey)! + o.total);
      }

      if (diffDays <= 90) {
        const key = date.toLocaleDateString("en-US", { month: 'short' });
        if (d90.has(key)) d90.set(key, d90.get(key)! + o.total);
      }

      if (diffDays <= 365) {
        const key = date.toLocaleDateString("en-US", { month: 'short' });
        if (m12.has(key)) m12.set(key, m12.get(key)! + o.total);
      }

      const q = Math.floor(date.getMonth() / 3) + 1;
      const yr = date.getFullYear().toString().slice(-2);
      const qKey = `Q${q}'${yr}`;
      allMap.set(qKey, (allMap.get(qKey) || 0) + o.total);
    });

    const formatMap = (map: Map<string, number>) => Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    const formatAllMap = Array.from(allMap.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));

    return {
      "7d": formatMap(d7),
      "30d": formatMap(d30),
      "90d": formatMap(d90),
      "12m": formatMap(m12),
      "All": formatAllMap.length > 0 ? formatAllMap : [{ label: "No Data", value: 0 }]
    };
  }, [orders]);

  const activeChartData = chartDataSets[chartFilter];
  const maxSales = Math.max(...activeChartData.map((d) => d.value));

  const { categoryShareData, lowStockProducts, recentOrders } = useMemo(() => {
    const catMap = new Map<string, number>();
    let totalCatRev = 0;
    const soldQtyMap = new Map<string, number>();

    orders.forEach(o => {
      o.items?.forEach(item => {
        const pid = item.productId || item.id;
        const prod = PRODUCTS.find(p => p.id === pid);
        if (prod?.category) {
          const rev = item.price * item.quantity;
          catMap.set(prod.category, (catMap.get(prod.category) || 0) + rev);
          totalCatRev += rev;
        }
        if (pid) {
          soldQtyMap.set(pid, (soldQtyMap.get(pid) || 0) + item.quantity);
        }
      });
    });

    const colors = ["bg-[#BCAE9E]", "bg-neutral-600", "bg-neutral-700", "bg-neutral-800"];
    const categoryShareData = Array.from(catMap.entries())
      .map(([category, rev]) => ({ category, rev, share: totalCatRev > 0 ? Math.round((rev / totalCatRev) * 100) : 0 }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 4)
      .map((item, idx) => ({ ...item, color: colors[idx % colors.length] }));

    const lowStockProducts = PRODUCTS.map(p => {
      const sold = soldQtyMap.get(p.id) || 0;
      const stock = Math.max(0, 100 - sold);
      return { ...p, stock, pct: Math.round((stock / 100) * 100) };
    }).sort((a, b) => a.stock - b.stock).slice(0, 3);

    const sortedOrders = [...orders].sort((a, b) => {
      const dA = a.createdAt ? a.createdAt.toMillis() : 0;
      const dB = b.createdAt ? b.createdAt.toMillis() : 0;
      return dB - dA;
    });
    const recentOrders = sortedOrders.slice(0, 5);

    return { categoryShareData, lowStockProducts, recentOrders };
  }, [orders]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#5BA6D6] border-t-[#0D3C6A] animate-spin" />
        <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Verifying Access...</p>
      </div>
    );
  }

  if (!user || user.email !== "auraadmin123@gmail.com") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 selection:bg-[#5BA6D6] selection:text-[#0D3C6A]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#B0B7C3] text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#BCAE9E] to-[#5BA6D6] flex items-center justify-center font-serif text-[#0D3C6A] font-bold text-xl shadow-inner">
              G
            </div>
          </div>
          <h1 className="font-serif text-2xl text-[#0D3C6A] font-medium uppercase tracking-wider mb-2">GUNA LIFE Control</h1>
          <p className="text-[10px] text-[#00A896] uppercase tracking-widest mb-8">Admin Access Only</p>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border border-red-200">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E] transition-colors"
                placeholder="Admin Email"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl text-sm focus:outline-none focus:border-[#BCAE9E] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0D3C6A] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md hover:bg-black mt-2"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const hasNewOrders = orders.some(o => {
    const orderTime = o.createdAt?.toMillis ? o.createdAt.toMillis() : new Date(o.date).getTime();
    return o.status === "Processing" && !o.readByAdmin && (Date.now() - orderTime) < 24 * 60 * 60 * 1000;
  });

  const handleOrderClick = async (o: any) => {
    setSelectedOrder(o);
    if (o.status === "Processing" && !o.readByAdmin) {
      try {
        await updateDoc(doc(db, "orders", o.id || o.orderId), { readByAdmin: true });
      } catch (err) {
        console.error("Failed to mark order as read", err);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#0D3C6A] overflow-hidden font-sans selection:bg-[#5BA6D6] selection:text-[#0D3C6A]">

      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR PANEL */}
      {/* ============================================================ */}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-64 shrink-0 bg-white border-r border-[#B0B7C3] flex flex-col justify-between p-6 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#BCAE9E] to-[#5BA6D6] flex items-center justify-center font-serif text-[#0D3C6A] font-bold text-sm">G</div>
              <div className="text-left flex-1">
                <h2 className="font-serif text-sm font-bold tracking-widest uppercase text-[#0D3C6A] leading-none">GUNA LIFE</h2>
                <span className="text-[9px] text-[#00A896] uppercase tracking-widest font-semibold block mt-0.5">Control Center</span>
              </div>
            </div>
            <button className="md:hidden text-[#00A896] p-1" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "Hero", label: "Hero Video", icon: Star },
              { id: "Products", label: "Products", icon: Package },
              { id: "Categories", label: "Categories", icon: Box },
              { id: "Orders", label: "Orders", icon: ShoppingBag },
              { id: "Customers", label: "Customers", icon: Users },
              { id: "Analytics", label: "Analytics", icon: BarChart3 },
              { id: "Discounts", label: "Discounts", icon: Percent },
              { id: "Reviews", label: "Reviews", icon: MessageSquare },
              { id: "Shipping", label: "Shipping", icon: Truck },
              { id: "Settings", label: "Settings", icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as SectionType);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${isSelected
                    ? "bg-[#FAF6F0] text-[#0D3C6A] border-l-2 border-[#BCAE9E] shadow-sm"
                    : "text-[#00A896] hover:text-[#0D3C6A] hover:bg-[#FAF6F0]/50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#BCAE9E]" : "text-[#00A896]"}`} />
                    {item.label}
                  </div>
                  {item.id === "Orders" && hasNewOrders && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom actions */}
        <div className="space-y-4">
          <div className="border-t border-[#B0B7C3] pt-4">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all bg-[#0D3C6A] text-white hover:bg-[#383838] shadow-sm">
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest pt-0.5">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN SCROLLABLE CONTENT */}
      {/* ============================================================ */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#F5F2EB] relative overflow-hidden">
        <header className="h-20 border-b border-[#B0B7C3] flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 text-left">
            <button className="md:hidden p-2 -ml-2 text-[#00A896] hover:bg-[#FAF6F0] rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-serif text-[#0D3C6A] font-medium uppercase tracking-wider">{activeSection}</h1>
              <span className="text-[9px] text-[#00A896] uppercase tracking-wider block mt-0.5">Admin Management System</span>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00A896] pointer-events-none" />
              <input
                type="text"
                placeholder="Search resources..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-64 bg-[#FAF6F0] border border-[#B0B7C3] rounded-full pl-9 pr-4 py-2 text-xs text-[#0D3C6A] placeholder-[#00A896] focus:outline-none focus:border-[#BCAE9E]"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#B0B7C3] flex items-center justify-center text-[#00A896] hover:text-[#0D3C6A] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white animate-pulse" />
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 top-12 w-72 bg-white border border-[#B0B7C3] rounded-2xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#B0B7C3] bg-[#FAF6F0]">
                      <h3 className="font-serif text-sm font-bold text-[#0D3C6A] uppercase tracking-wider">Notifications</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className="p-4 border-b border-[#B0B7C3]/50 hover:bg-[#FAF6F0] cursor-pointer transition-colors last:border-0"
                          >
                            <h4 className="text-xs font-bold text-[#0D3C6A] uppercase tracking-wider mb-1">{notif.title}</h4>
                            <p className="text-[10px] text-[#6B7280] leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-[#6B7280]">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 border-l border-[#B0B7C3] pl-4">
              <div className="w-9 h-9 rounded-full bg-[#BCAE9E] flex items-center justify-center font-bold text-[#0D3C6A] text-xs">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-[#0D3C6A] block">Admin</span>
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider block">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow p-8 overflow-y-auto scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-8">

              {/* ============================ DASHBOARD ============================ */}
              {activeSection === "Dashboard" && (
                <>
                  {/* Welcome banner with image */}
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                      <div className="lg:col-span-2 p-8 text-left flex flex-col justify-center">
                        <span className="text-[10px] uppercase tracking-widest text-[#BCAE9E] font-bold">{dateString}</span>
                        <h2 className="font-serif text-2xl text-[#0D3C6A] font-medium mt-2 leading-tight">{greeting}, Admin.</h2>
                        <p className="text-xs text-[#00A896] mt-2 max-w-md leading-relaxed">Revenue is up 14.2% this cycle. You have {orders.filter(o => o.status === "Processing").length} orders awaiting fulfillment and 3 low-stock items flagged for restock.</p>
                        <div className="flex gap-3 mt-5">
                          <button onClick={() => setActiveSection("Orders")} className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#0D3C6A] px-5 py-2.5 rounded-xl hover:bg-[#2C2B29] transition-colors">Review Orders</button>
                          <button onClick={() => setActiveSection("Analytics")} className="text-[10px] font-bold uppercase tracking-widest text-[#0D3C6A] bg-[#FAF6F0] border border-[#B0B7C3] px-5 py-2.5 rounded-xl hover:border-[#BCAE9E] transition-colors">View Analytics</button>
                        </div>
                      </div>
                      <div className="relative min-h-[180px] bg-gradient-to-br from-[#FAF6F0] to-[#E9E1D6] flex items-center justify-center p-6">
                        <div className="relative w-40 h-40">
                          <Image data-pin-nopin="true" src={IMG.serum} alt="Featured serum" fill sizes="160px" className="object-contain drop-shadow-xl" />
                        </div>
                        <span className="absolute top-4 right-4"><Pill tone="amber">Best Seller</Pill></span>
                      </div>
                    </div>
                  </Card>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2).replace(/\.00$/, "")}`, icon: DollarSign, change: "All time total" },
                      { label: "Sales Orders", value: `${totalOrdersCount}`, icon: ShoppingBag, change: "All time total", onClick: () => setActiveSection("Orders") },
                      { label: "Active Customers", value: `${totalCustomersCalculated}`, icon: Users, change: `${newThisMonthCalculated} new this month`, onClick: () => setActiveSection("Customers") },
                      { label: "Monthly Target", value: `${calculatedMonthlyTargetPct}%`, icon: TrendingUp, change: `Goal: ₹${(monthlyTargetAmount / 1000).toFixed(0)}k`, onClick: () => { setTargetInputValue(monthlyTargetAmount.toString()); setIsTargetModalOpen(true); } },
                    ].map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div
                          key={idx}
                          onClick={stat.onClick}
                          className={`bg-white border border-[#B0B7C3] rounded-2xl p-6 text-left relative overflow-hidden group hover:border-[#5BA6D6] transition-colors shadow-sm ${stat.onClick ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-semibold">{stat.label}</span>
                            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><StatIcon className="w-4 h-4" /></div>
                          </div>
                          <h3 className="text-2xl font-semibold text-[#0D3C6A] tracking-tight">{stat.value}</h3>
                          <span className="text-[10px] text-green-500 block mt-2 font-medium tracking-wide">{stat.change}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8 bg-white border border-[#B0B7C3] rounded-3xl p-6 flex flex-col text-left shadow-sm">
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider">Revenue Stream</h3>
                          <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-0.5">Performance analytics</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#FAF6F0] rounded-full p-1 border border-[#B0B7C3]">
                          {(["7d", "30d", "90d", "12m", "All"] as const).map((f) => (
                            <button key={f} onClick={() => setChartFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${chartFilter === f ? "bg-[#0D3C6A] text-white shadow-sm" : "text-[#00A896] hover:text-[#0D3C6A]"}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <div className="relative flex-1 min-h-[250px]">
                        {(() => {
                          const chartW = 700, chartH = 250, padL = 55, padR = 20, padT = 25, padB = 35;
                          const drawW = chartW - padL - padR, drawH = chartH - padT - padB;
                          const data = activeChartData, maxV = Math.max(maxSales * 1.15, 10);
                          const points = data.map((d, i) => ({ x: padL + (i / (data.length - 1 || 1)) * drawW, y: padT + drawH - (d.value / maxV) * drawH, label: d.label, value: d.value }));
                          const curvePath = points.reduce((acc, p, i, arr) => { if (i === 0) return `M${p.x},${p.y}`; const prev = arr[i - 1]; const cpx = (prev.x + p.x) / 2; return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`; }, "");
                          const areaPath = `${curvePath} L${points[points.length - 1].x},${padT + drawH} L${points[0].x},${padT + drawH} Z`;
                          const gridLines = Array.from({ length: 5 }, (_, i) => { const val = (maxV / 4) * i; const y = padT + drawH - (val / maxV) * drawH; return { y, label: `₹${(val / 1000).toFixed(1)}k` }; });
                          const pathLength = points.reduce((acc, p, i) => { if (i === 0) return 0; const prev = points[i - 1]; return acc + Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2)); }, 0) * 1.5;
                          return (
                            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#BCAE9E" stopOpacity="0.35" /><stop offset="100%" stopColor="#BCAE9E" stopOpacity="0" /></linearGradient>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#5BA6D6" /><stop offset="50%" stopColor="#BCAE9E" /><stop offset="100%" stopColor="#A09080" /></linearGradient>
                              </defs>
                              {gridLines.map((gl, i) => (
                                <g key={`grid-${i}`}>
                                  <line x1={padL} y1={gl.y} x2={chartW - padR} y2={gl.y} stroke="#B0B7C3" strokeWidth="1" strokeDasharray={i > 0 ? "4 4" : "0"} />
                                  <text x={padL - 8} y={gl.y + 4} textAnchor="end" fill="#00A896" fontSize="9" fontWeight="600">{gl.label}</text>
                                </g>
                              ))}
                              <motion.path key={`area-${chartFilter}`} d={areaPath} fill="url(#chartGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />
                              <motion.path key={`line-${chartFilter}`} d={curvePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
                              {points.map((p, i) => (
                                <g key={`point-${chartFilter}-${i}`}>
                                  {i === points.length - 1 && (<motion.circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#BCAE9E" strokeWidth="1.5" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.6, 0], scale: [0.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />)}
                                  <motion.circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#BCAE9E" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }} style={{ cursor: "pointer" }} />
                                  <motion.text x={p.x} y={p.y - 14} textAnchor="middle" fill="#0D3C6A" fontSize="9" fontWeight="700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}>₹{p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}</motion.text>
                                  <text x={p.x} y={chartH - 8} textAnchor="middle" fill="#00A896" fontSize="9" fontWeight="600">{p.label}</text>
                                </g>
                              ))}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-white border border-[#B0B7C3] rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm">
                      <div>
                        <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider">Category Share</h3>
                        <p className="text-[10px] text-[#00A896] uppercase tracking-widest mt-0.5">Direct retail splits</p>
                      </div>
                      <div className="space-y-5 my-6">
                        {categoryShareData.length > 0 ? categoryShareData.map((share, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold tracking-wider uppercase text-[#0D3C6A]/80"><span>{share.category}</span><span>{share.share}%</span></div>
                            <div className="w-full h-1.5 bg-[#FAF6F0] rounded-full overflow-hidden"><div className={`h-full ${share.color}`} style={{ width: `${share.share}%` }} /></div>
                          </div>
                        )) : <div className="text-xs text-[#00A896] text-center">No category data yet</div>}
                      </div>
                      <span className="text-[9px] text-[#00A896] uppercase tracking-wider font-medium text-center block border-t border-[#B0B7C3] pt-4">Updated in real-time</span>
                    </div>
                  </div>

                  {/* NEW: Low Stock Alerts with images */}
                  <Card className="p-6 text-left">
                    <div className="flex justify-between items-center mb-6 border-b border-[#B0B7C3] pb-3">
                      <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider">Restock Alerts</h3>
                      <Pill tone="amber">3 items low</Pill>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {lowStockProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-4 bg-[#FAF6F0]/60 border border-[#B0B7C3] rounded-2xl p-4">
                          <div className="relative w-14 h-14 rounded-xl bg-white border border-[#B0B7C3] p-1 shrink-0 overflow-hidden">
                            <Image data-pin-nopin="true" src={p.image} alt={p.name} fill sizes="56px" className="object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-[#0D3C6A] truncate">{p.name}</h4>
                            <p className="text-[10px] text-[#00A896] mt-0.5">{p.stock} units left</p>
                            <div className="w-full h-1 bg-[#B0B7C3] rounded-full overflow-hidden mt-2"><div className={`h-full ${p.stock < 20 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${p.pct}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Products + Recent Orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white border border-[#B0B7C3] rounded-3xl p-6 text-left shadow-sm">
                      <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider mb-6 border-b border-[#B0B7C3] pb-3">Top Selling Products</h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-[#B0B7C3] text-[10px] uppercase tracking-wider text-[#00A896] font-semibold"><th className="pb-3">Product</th><th className="pb-3">Category</th><th className="pb-3">Stock</th><th className="pb-3">Price</th></tr></thead>
                          <tbody className="text-xs font-light text-[#0D3C6A]/80 divide-y divide-[#B0B7C3]/60">
                            {topProductsList.slice(0, 4).map((tp, idx) => {
                              const p = productList.find(px => px.id === tp.id) || productList[0];
                              return (
                                <tr key={tp.id || idx} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                  <td className="py-3 flex items-center gap-3"><div className="relative w-8 h-8 rounded-lg bg-[#FAF6F0] overflow-hidden shrink-0 border border-[#5BA6D6] p-0.5"><Image data-pin-nopin="true" src={p.image} alt={p.name} fill sizes="32px" className="object-contain" /></div><span className="font-medium text-[#0D3C6A] line-clamp-1">{p.name}</span></td>
                                  <td className="py-3 uppercase text-[10px] tracking-wider text-[#00A896] font-medium">{p.category}</td>
                                  <td className="py-3"><Pill tone="green">In Stock</Pill></td>
                                  <td className="py-3 font-semibold text-[#0D3C6A]">₹{p.price.toFixed(2).replace(/\.00$/, "")}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="lg:col-span-5 bg-white border border-[#B0B7C3] rounded-3xl p-6 text-left shadow-sm">
                      <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider mb-6 border-b border-[#B0B7C3] pb-3">Recent Live Orders</h3>
                      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-none pr-1">
                        {recentOrders.length > 0 ? recentOrders.map((o) => (
                          <div key={o.orderId} onClick={() => handleOrderClick(o)} className="flex justify-between items-center text-xs border-b border-[#B0B7C3]/50 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-[#FAF6F0] p-2 -mx-2 rounded-xl transition-colors">
                            <div className="space-y-0.5"><span className="font-bold text-[#0D3C6A] uppercase">{o.orderId}</span><span className="text-[10px] text-[#00A896] block uppercase tracking-wider">{o.date}</span></div>
                            <div className="text-right space-y-1"><span className="font-semibold text-[#0D3C6A] block">₹{o.total.toFixed(2).replace(/\.00$/, "")}</span><span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${o.status === "Delivered" ? "bg-green-50 text-green-600 border-green-200" : o.status === "Shipped" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>{o.status}</span></div>
                          </div>
                        )) : <div className="text-xs text-[#00A896] text-center mt-4">No recent orders found</div>}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Target Config Modal */}
                  {isTargetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
                        <button onClick={() => setIsTargetModalOpen(false)} className="absolute top-4 right-4 text-[#00A896] hover:text-[#0D3C6A] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="font-serif text-xl text-[#0D3C6A] uppercase tracking-wider mb-2">Set Monthly Target</h2>
                        <p className="text-[10px] text-[#00A896] uppercase tracking-widest mb-6 block">Set a revenue goal for the current month in INR.</p>

                        <div className="flex flex-col space-y-2 mb-8">
                          <label className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">Target Amount (₹)</label>
                          <input
                            type="number"
                            min="1"
                            value={targetInputValue}
                            onChange={(e) => setTargetInputValue(e.target.value)}
                            className="w-full bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none focus:border-[#BCAE9E]"
                            placeholder="e.g. 150000"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setIsTargetModalOpen(false)}
                            className="flex-1 border border-[#0D3C6A] text-[#0D3C6A] py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveMonthlyTarget}
                            disabled={savingTarget}
                            className="flex-1 bg-[#0D3C6A] hover:bg-[#383838] text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            {savingTarget ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ============================ HERO ============================ */}
              {activeSection === "Hero" && (
                <HeroManager searchQuery={globalSearchQuery} />
              )}

              {/* ============================ PRODUCTS ============================ */}
              {activeSection === "Products" && (
                <ProductManager searchQuery={globalSearchQuery} />
              )}

              {/* ============================ CATEGORIES ============================ */}
              {activeSection === "Categories" && (
                <CategoryManager searchQuery={globalSearchQuery} />
              )}

              {/* ============================ ORDERS ============================ */}
              {activeSection === "Orders" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader title="Order Management" subtitle="Track, manage and fulfill customer orders" />
                    <div className="flex items-center gap-2 bg-[#FAF6F0] rounded-full p-1 border border-[#B0B7C3] flex-wrap">
                      {(["All", "Processing", "Shipped", "Delivered", "Return Requested", "Return Approved", "Returned"] as const).map((f) => {
                        const count = f === "All" ? orders.length : orders.filter((o) => o.status === f).length;
                        return (<button key={f} onClick={() => setOrderFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${orderFilter === f ? "bg-[#0D3C6A] text-white shadow-sm" : "text-[#00A896] hover:text-[#0D3C6A]"}`}>{f}<span className={`text-[8px] px-1.5 py-0.5 rounded-full ${orderFilter === f ? "bg-white/20" : "bg-[#B0B7C3]"}`}>{count}</span></button>);
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { label: "Total Orders", value: orders.length.toString(), color: "text-[#0D3C6A]", bg: "bg-white" },
                      { label: "Processing", value: orders.filter((o) => o.status === "Processing").length.toString(), color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Shipped", value: orders.filter((o) => o.status === "Shipped").length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length.toString(), color: "text-green-600", bg: "bg-green-50" },
                      { label: "Return Req", value: orders.filter((o) => o.status === "Return Requested").length.toString(), color: "text-orange-600", bg: "bg-orange-50" },
                      { label: "Return Appr", value: orders.filter((o) => o.status === "Return Approved").length.toString(), color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Returned", value: orders.filter((o) => o.status === "Returned").length.toString(), color: "text-red-600", bg: "bg-red-50" },
                    ].map((stat) => (<div key={stat.label} className={`${stat.bg} border border-[#B0B7C3] rounded-2xl p-4 text-left`}><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold block">{stat.label}</span><span className={`text-2xl font-bold ${stat.color} block mt-1`}>{stat.value}</span></div>))}
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const ordersToShow = showAllOrders ? filteredOrders : filteredOrders.slice(0, 5);
                      const hiddenOrdersCount = filteredOrders.length - 5;
                      return (
                        <>
                          {ordersToShow.map((o, idx) => {
                      const orderTime = o.createdAt?.toMillis ? o.createdAt.toMillis() : new Date(o.date).getTime();
                      const isNew = !o.readByAdmin && (Date.now() - orderTime) < 24 * 60 * 60 * 1000;
                      return (
                        <motion.div key={o.orderId} onClick={() => handleOrderClick(o)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className={`bg-white border ${isNew && o.status === "Processing" ? 'border-[#5BA6D6] shadow-sm' : 'border-[#B0B7C3]'} rounded-2xl overflow-hidden hover:shadow-sm transition-shadow cursor-pointer`}>
                          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 border-b ${isNew && o.status === "Processing" ? 'border-[#5BA6D6]/30 bg-[#5BA6D6]/5' : 'border-[#B0B7C3]/60'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.status === "Delivered" ? "bg-green-50 text-green-600" : o.status === "Return Requested" ? "bg-orange-50 text-orange-600" : o.status === "Return Approved" ? "bg-purple-50 text-purple-600" : o.status === "Shipped" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{o.status === "Delivered" ? <Package className="w-5 h-5" /> : o.status === "Shipped" ? <Truck className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}</div>
                              <div className="text-left">
                                <h4 className="text-sm font-bold text-[#0D3C6A] uppercase tracking-wider flex items-center gap-2">
                                  {o.orderId}
                                </h4>
                                <span className="text-[10px] text-[#00A896] uppercase tracking-wider block">{o.customerName ? `${o.customerName} • ` : ""}{o.phone ? `${o.phone} • ` : ""}{o.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-block text-[9px] font-bold uppercase px-3 py-1.5 rounded-full border ${o.status === "Delivered" ? "bg-green-50 text-green-600 border-green-200" : o.status === "Return Requested" ? "bg-orange-50 text-orange-600 border-orange-200" : o.status === "Return Approved" ? "bg-purple-50 text-purple-600 border-purple-200" : o.status === "Shipped" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>{o.status}</span>
                              <span className="text-lg font-bold text-[#0D3C6A]">₹{o.total.toFixed(2).replace(/\.00$/, "")}</span>
                            </div>
                          </div>
                          
                          {o.returnReason && (
                            <div className="mx-5 mt-5 p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">Return Reason Provided</span>
                              <p className="text-sm text-orange-900 italic">"{o.returnReason}"</p>
                            </div>
                          )}
                          
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                              <h5 className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold mb-3">Order Items</h5>
                              <div className="flex flex-wrap gap-3">
                                {o.items.map((item: any, iIdx: number) => {
                                  const matchedProduct = PRODUCTS.find((pp) => pp.id === (item.productId || item.id));
                                  const imgSrc = matchedProduct ? matchedProduct.image : item.image;
                                  return (
                                    <div key={iIdx} className="flex flex-col gap-2 bg-[#FAF6F0] border border-[#B0B7C3] rounded-xl p-3 w-full sm:w-auto">
                                      <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-[#B0B7C3] p-0.5">{imgSrc && <Image data-pin-nopin="true" src={imgSrc} alt={item.name} fill sizes="48px" className="object-contain" />}</div>
                                        <div className="text-left flex-grow">
                                          <span className="text-xs font-semibold text-[#0D3C6A] block leading-tight">{item.name}</span>
                                          <span className="text-[10px] text-[#00A896]">Qty: {item.quantity} • ₹{item.price.toFixed(2).replace(/\.00$/, "")}</span>
                                          {item.returnStatus && (
                                            <div className="mt-1">
                                              <span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${item.returnStatus === 'Return Requested' ? 'bg-amber-50 text-amber-600 border-amber-200' : item.returnStatus === 'Return Approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{item.returnStatus}</span>
                                              {item.returnReason && (
                                                <p className="text-[9px] mt-1.5 text-[#0D3C6A]/80 italic leading-tight border-l-2 border-amber-200 pl-2 bg-amber-50/50 p-1 rounded-r">
                                                  "{item.returnReason}"
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {item.returnStatus === "Return Requested" && (
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-[#B0B7C3]/50">
                                          <button onClick={(e) => { e.stopPropagation(); handleUpdateItemReturnStatus(o.orderId, iIdx, "Return Approved"); }} className="flex-1 py-1.5 rounded-lg bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-wider border border-green-200 hover:bg-green-100 transition-colors">Approve</button>
                                          <button onClick={(e) => { e.stopPropagation(); handleUpdateItemReturnStatus(o.orderId, iIdx, "Return Rejected"); }} className="flex-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider border border-red-200 hover:bg-red-100 transition-colors">Reject</button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div><h5 className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold mb-2">Shipping Address</h5><p className="text-xs text-[#0D3C6A]/80 leading-relaxed">{o.shippingAddress}</p></div>
                              <div className="flex gap-2">
                                {o.status !== "Shipped" && o.status !== "Delivered" && o.status !== "Return Requested" && o.status !== "Return Approved" && o.status !== "Returned" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Shipped")} className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-200 hover:bg-blue-100 transition-colors">Mark Shipped</button>)}
                                {o.status !== "Delivered" && o.status !== "Return Requested" && o.status !== "Return Approved" && o.status !== "Returned" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Delivered")} className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-200 hover:bg-green-100 transition-colors">Mark Delivered</button>)}
                                {o.status === "Return Requested" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Return Approved")} className="flex-1 py-2.5 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider border border-purple-200 hover:bg-purple-100 transition-colors">Approve Return</button>)}
                                {o.status === "Return Approved" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Returned")} className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider border border-red-200 hover:bg-red-100 transition-colors">Mark Returned</button>)}
                                {o.status === "Delivered" && (<span className="flex-1 py-2.5 rounded-xl bg-[#FAF6F0] text-[#00A896] text-[10px] font-bold uppercase tracking-wider text-center border border-[#B0B7C3]">{"\u2713"} FULFILLED</span>)}
                                {o.status === "Returned" && (<span className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider text-center border border-red-200">{"\u2717"} RETURNED</span>)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {!showAllOrders && hiddenOrdersCount > 0 && (
                      <div className="flex justify-center mt-6">
                        <button onClick={() => setShowAllOrders(true)} className="px-6 py-3 bg-[#FAF6F0] border border-[#B0B7C3] text-[#0D3C6A] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#EBE3D5] transition-colors">
                          View All ({hiddenOrdersCount} more orders)
                        </button>
                      </div>
                    )}
                    {showAllOrders && hiddenOrdersCount > 0 && (
                      <div className="flex justify-center mt-6">
                        <button onClick={() => setShowAllOrders(false)} className="px-6 py-3 bg-[#FAF6F0] border border-[#B0B7C3] text-[#0D3C6A] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#EBE3D5] transition-colors">
                          Show Less
                        </button>
                      </div>
                    )}
                    
                    </>
                  );
                })()}
                {filteredOrders.length === 0 && (<div className="bg-white border border-[#B0B7C3] rounded-2xl p-12 text-center"><ShoppingBag className="w-12 h-12 text-[#B0B7C3] mx-auto mb-4" /><h4 className="text-sm font-semibold text-[#0D3C6A] mb-1">No orders found</h4><p className="text-[11px] text-[#00A896]">{orderFilter === "All" ? "Orders placed on the storefront will appear here" : `No ${orderFilter.toLowerCase()} orders at this time`}</p></div>)}
                  </div>
                </div>
              )}

              {/* ============================ CUSTOMERS ============================ */}
              {activeSection === "Customers" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Customers", value: totalCustomersCalculated.toString(), icon: Users },
                      { label: "New This Month", value: newThisMonthCalculated.toString(), icon: Heart },
                      { label: "Gold Members", value: goldMembersCalculated.toString(), icon: Award },
                      { label: "Avg. LTV", value: `₹${avgLtvCalculated}`, icon: DollarSign },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#0D3C6A] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>

                  <SectionHeader title="Top Customers" subtitle="Highest lifetime value clients this quarter" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCustomers.slice(0, 6).map((c, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.05 }} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left hover:shadow-md hover:border-[#5BA6D6] transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#BCAE9E] to-[#5BA6D6] flex items-center justify-center font-bold text-[#0D3C6A] text-sm">{c.name.split(" ").map((n: string) => n[0]).join("")}</div>
                            <div><h4 className="text-sm font-semibold text-[#0D3C6A] leading-tight">{c.name}</h4><span className="text-[10px] text-[#00A896] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{c.loc}</span></div>
                          </div>
                          <Pill tone={c.tone as any}>{c.tier.split(" ")[0]}</Pill>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] text-[#00A896]"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{c.email}</span></div>
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#B0B7C3]/60">
                          <div><span className="text-[8px] uppercase tracking-widest text-[#00A896] font-bold block">Orders</span><span className="text-base font-bold text-[#0D3C6A]">{c.ordersCount}</span></div>
                          <div><span className="text-[8px] uppercase tracking-widest text-[#00A896] font-bold block">Lifetime Value</span><span className="text-base font-bold text-[#0D3C6A]">₹{c.ltv.toFixed(2).replace(/\.00$/, "")}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#B0B7C3]/60">
                          <div className="relative w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#B0B7C3] p-0.5 overflow-hidden shrink-0">{c.fav && <Image data-pin-nopin="true" src={c.fav} alt="favourite" fill sizes="32px" className="object-contain" />}</div>
                          <span className="text-[10px] text-[#00A896]">Frequently buys this item</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Full registry table */}
                  <Card className="p-8 text-left space-y-6">
                    <SectionHeader title="Customer Registry" subtitle="Registered client logs and lifetime spending" />
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-[#B0B7C3] text-[10px] uppercase tracking-wider text-[#00A896] font-semibold"><th className="pb-3">Customer</th><th className="pb-3">Email Address</th><th className="pb-3">Orders</th><th className="pb-3">Lifetime Value</th><th className="pb-3">Tier</th></tr></thead>
                        <tbody className="text-xs text-[#0D3C6A]/80 divide-y divide-[#B0B7C3]/60 font-light">
                          {filteredCustomers.map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF6F0]/40 transition-colors">
                              <td className="py-4 font-semibold text-[#0D3C6A] flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#BCAE9E] flex items-center justify-center text-[10px] font-bold text-[#0D3C6A]">{c.name.split(" ").map((n: string) => n[0]).join("")}</div>{c.name}</td>
                              <td className="py-4 text-[#00A896] font-medium">{c.email}</td>
                              <td className="py-4">{c.ordersCount} Orders</td>
                              <td className="py-4 font-bold text-[#0D3C6A]">₹{c.ltv.toFixed(2).replace(/\.00$/, "")}</td>
                              <td className="py-4"><Pill tone={c.tone as any}>{c.tier}</Pill></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* ============================ ANALYTICS ============================ */}
              {activeSection === "Analytics" && (() => {
                const calculatedConversionRate = totalUsersCountReal > 0 ? ((customersList.length / totalUsersCountReal) * 100).toFixed(1) : "0.0";
                const calculatedBounceRate = totalUsersCountReal > 0 ? (((totalUsersCountReal - customersList.length) / totalUsersCountReal) * 100).toFixed(1) : "0.0";
                const returnedOrdersCount = orders.filter(o => o.status === "Returned").length;
                const calculatedReturnRate = totalOrdersCount > 0 ? ((returnedOrdersCount / totalOrdersCount) * 100).toFixed(1) : "0.0";

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Conversion Rate", value: `${calculatedConversionRate}%`, icon: TrendingUp, sub: "" },
                        { label: "Avg. Order Value", value: `₹${typeof avgOrderValue === 'number' ? avgOrderValue.toFixed(2).replace(/\.00$/, "") : avgOrderValue}`, icon: DollarSign, sub: "" },
                        { label: "Bounce Rate", value: `${calculatedBounceRate}%`, icon: Zap, sub: "" },
                        { label: "Return Rate", value: `${calculatedReturnRate}%`, icon: Package, sub: "" },
                      ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left"><div className="flex justify-between items-center mb-3"><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold">{s.label}</span><div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div><span className="text-2xl font-bold text-[#0D3C6A]">{s.value}</span>{s.sub && <span className="text-[10px] text-green-500 block mt-1 font-medium">{s.sub}</span>}</div>); })}
                    </div>



                    {/* NEW: Top products by revenue with images */}
                    <Card className="p-6 text-left">
                      <SectionHeader title="Top Products by Revenue" subtitle="Highest grossing SKUs this cycle" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        {topProductsList.slice(0, 4).map((p, i) => (
                          <div key={p.id} className="bg-[#FAF6F0]/50 border border-[#B0B7C3] rounded-2xl p-4 flex flex-col items-center text-center">
                            <div className="relative w-20 h-20 mb-3">{p.image && <Image data-pin-nopin="true" src={p.image} alt={p.name} fill sizes="80px" className="object-contain" />}</div>
                            <span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold">#{i + 1}</span>
                            <h4 className="text-xs font-semibold text-[#0D3C6A] mt-1 leading-tight">{p.name}</h4>
                            <span className="text-sm font-bold text-[#0D3C6A] mt-2">₹{p.revenue.toFixed(2).replace(/\.00$/, "")}</span>
                            <div className="w-full h-1 bg-[#B0B7C3] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#BCAE9E]" style={{ width: `${p.pct}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* NEW: Geographic distribution */}
                    <Card className="p-6 text-left">
                      <div className="flex items-center justify-between mb-6 border-b border-[#B0B7C3] pb-3">
                        <SectionHeader title="Top Regions" subtitle="Revenue by shipping geography" />
                        <Globe className="w-5 h-5 text-[#BCAE9E]" />
                      </div>
                      <div className="space-y-4">
                        {topRegionsList.length > 0 ? topRegionsList.map((r) => (
                          <div key={r.region} className="space-y-1.5"><div className="flex justify-between text-xs font-semibold text-[#0D3C6A]/80 uppercase"><span>{r.region}</span><span className="text-[#00A896]">₹{r.revenue.toFixed(2).replace(/\.00$/, "")} • {r.pct}%</span></div><div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5BA6D6] to-[#BCAE9E]" style={{ width: `${r.pct}%` }} /></div></div>
                        )) : (
                          <div className="text-xs text-[#0D3C6A]">No regional data available yet.</div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })()}

              {/* ============================ DISCOUNTS ============================ */}
              {activeSection === "Discounts" && (
                <div className="space-y-6">
                  {/* Coupon showcase cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coupons.map((c, idx) => (
                      <motion.div key={c.code} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }} className={`relative overflow-hidden rounded-2xl border p-6 text-left ${c.status === "Active" ? "bg-gradient-to-br from-[#0D3C6A] to-[#3A362F] border-[#3A362F]" : "bg-[#FAF6F0] border-[#B0B7C3]"}`}>
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#BCAE9E]/10" />
                        <div className="flex justify-between items-start relative">
                          <Percent className={`w-5 h-5 ${c.status === "Active" ? "text-[#5BA6D6]" : "text-[#00A896]"}`} />
                          <Pill tone={c.status === "Active" ? "green" : "neutral"}>{c.status}</Pill>
                        </div>
                        <h3 className={`font-mono text-xl font-bold tracking-widest mt-4 ${c.status === "Active" ? "text-white" : "text-[#00A896]"}`}>{c.code}</h3>
                        <p className={`text-sm font-semibold mt-1 ${c.status === "Active" ? "text-[#BCAE9E]" : "text-[#00A896]"}`}>{c.discount}</p>
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                          <span className={`text-[10px] uppercase tracking-wider ${c.status === "Active" ? "text-[#00A896]" : "text-[#00A896]"}`}>{c.usages} redemptions</span>
                          <button onClick={() => handleToggleCoupon(c.code)} className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition-colors ${c.status === "Active" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#0D3C6A] text-white hover:bg-[#2C2B29]"}`}>{c.status === "Active" ? "Deactivate" : "Activate"}</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                    <Card className="lg:col-span-8 p-6 space-y-6">
                      <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider border-b border-[#B0B7C3] pb-3">All Coupons</h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-[#B0B7C3] text-[10px] uppercase tracking-wider text-[#00A896] font-semibold"><th className="pb-3">Code</th><th className="pb-3">Discount</th><th className="pb-3">Applies To</th><th className="pb-3">Usages</th><th className="pb-3">Actions</th></tr></thead>
                          <tbody className="text-xs text-[#0D3C6A]/80 divide-y divide-[#B0B7C3]/60 font-light">
                            {coupons.map((c) => {
                              const prod = c.productId === "all" ? "All Products" : PRODUCTS.find(p => p.id === c.productId)?.name || "Unknown Product";
                              return (
                                <tr key={c.code} className="hover:bg-[#FAF6F0]/40 transition-colors"><td className="py-4 font-bold text-[#0D3C6A] uppercase">{c.code}</td><td className="py-4 text-[#BCAE9E] font-medium">{c.discount}</td><td className="py-4 font-semibold">{prod}</td><td className="py-4">{c.usages} checkouts</td><td className="py-4"><button onClick={() => handleToggleCoupon(c.code)} className="text-[9px] font-bold text-[#00A896] hover:text-[#0D3C6A] uppercase tracking-wider border border-[#5BA6D6] hover:border-neutral-700 px-3 py-1 rounded-xl transition-colors">{c.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    <form onSubmit={handleAddCoupon} className="lg:col-span-4 bg-white border border-[#B0B7C3] rounded-3xl p-6 shadow-sm space-y-6">
                      <h3 className="font-serif text-base text-[#0D3C6A] font-medium uppercase tracking-wider border-b border-[#B0B7C3] pb-3">Add Coupon</h3>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Code</label><input type="text" placeholder="e.g. EXTRA20" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Discount rate</label><select value={newCouponDiscount} onChange={(e) => setNewCouponDiscount(e.target.value)} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none"><option>10% Off</option><option>15% Off</option><option>20% Off</option><option>25% Off</option></select></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Applicable Product</label><select value={newCouponProduct} onChange={(e) => setNewCouponProduct(e.target.value)} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none"><option value="all">All Products (Entire Cart)</option>{PRODUCTS.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
                      <button type="submit" className="w-full bg-[#BCAE9E] hover:opacity-85 text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md">Create coupon</button>
                    </form>
                  </div>
                </div>
              )}

              {/* ============================ REVIEWS ============================ */}
              {activeSection === "Reviews" && (
                <div className="space-y-6">
                  {/* Rating summary */}
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="text-center md:border-r md:border-[#B0B7C3]">
                        <span className="text-5xl font-serif font-bold text-[#0D3C6A]">4.8</span>
                        <div className="flex justify-center gap-0.5 mt-2 text-amber-500">{[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-4 h-4 fill-amber-500" />))}</div>
                        <span className="text-[10px] text-[#00A896] uppercase tracking-wider block mt-2">Based on 1,284 reviews</span>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[{ s: 5, pct: 82 }, { s: 4, pct: 12 }, { s: 3, pct: 4 }, { s: 2, pct: 1 }, { s: 1, pct: 1 }].map((r) => (<div key={r.s} className="flex items-center gap-3"><span className="text-[10px] font-bold text-[#00A896] w-6">{r.s}★</span><div className="flex-1 h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: `${r.pct}%` }} /></div><span className="text-[10px] text-[#00A896] w-8 text-right">{r.pct}%</span></div>))}
                      </div>
                    </div>
                  </Card>

                  {/* Filter tabs */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader title="Customer Reviews" subtitle="Rating logs and content moderation tools" />
                    <div className="flex items-center gap-1 bg-[#FAF6F0] rounded-full p-1 border border-[#B0B7C3]">
                      {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (<button key={f} onClick={() => setReviewFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${reviewFilter === f ? "bg-[#0D3C6A] text-white shadow-sm" : "text-[#00A896] hover:text-[#0D3C6A]"}`}>{f}</button>))}
                    </div>
                  </div>

                  {/* Review cards with product images */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {reviews.filter(r => reviewFilter === "All" ? true : r.status.toLowerCase() === reviewFilter.toLowerCase()).map((r, idx) => (
                      <motion.div key={r.id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left space-y-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="relative w-14 h-14 rounded-xl bg-[#FAF6F0] border border-[#B0B7C3] p-1 shrink-0 overflow-hidden">{r.productImg && <Image data-pin-nopin="true" src={r.productImg} alt={r.productName} fill sizes="56px" className="object-contain" />}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div><span className="font-bold text-[#0D3C6A] text-sm block">{r.clientName}</span><span className="text-[9px] text-[#00A896] uppercase tracking-wider">{r.productName}</span></div>
                              <Pill tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "amber"}>{r.status}</Pill>
                            </div>
                            <div className="flex items-center gap-2 mt-1"><span className="text-amber-500 text-xs">{"★".repeat(r.rating)}<span className="text-[#B0B7C3]">{"★".repeat(5 - r.rating)}</span></span><span className="text-[9px] text-[#00A896]">{r.dateStr}</span></div>
                          </div>
                        </div>
                        <p className="text-xs text-[#0D3C6A]/80 leading-relaxed font-light">{r.comment}</p>
                        <div className="flex gap-2 pt-3 border-t border-[#B0B7C3]/60">
                          {r.status !== "approved" && <button onClick={() => handleUpdateReviewStatus(r.id, "approved")} className="flex-1 py-2 rounded-xl bg-[#FAF6F0] text-[#0D3C6A] text-[9px] font-bold uppercase tracking-wider border border-[#B0B7C3] hover:border-[#BCAE9E] transition-colors">Approve</button>}
                          {r.status !== "rejected" && <button onClick={() => handleUpdateReviewStatus(r.id, "rejected")} className="flex-1 py-2 rounded-xl bg-white text-[#00A896] text-[9px] font-bold uppercase tracking-wider border border-[#B0B7C3] hover:text-red-600 hover:border-red-200 transition-colors">Reject</button>}
                        </div>
                      </motion.div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="col-span-1 lg:col-span-2 text-center py-10 text-xs text-[#00A896]">No reviews found.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================ SHIPPING ============================ */}
              {activeSection === "Shipping" && (
                <div className="space-y-6">
                  {/* Shipping stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "In Transit", value: inTransitCount.toString(), icon: Truck },
                      { label: "Delivered (7d)", value: deliveredTotal.toString(), icon: Package },
                      { label: "Avg. Delivery", value: `${avgDeliveryDays}d`, icon: Clock },
                      { label: "On-Time Rate", value: `${onTimeRate}%`, icon: Shield },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#0D3C6A] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>



                  {/* NEW: Active shipments with product images */}
                  <Card className="p-6 text-left">
                    <SectionHeader title="Active Shipments" subtitle="Live parcels currently in transit" />
                    <div className="space-y-3 mt-6">
                      {orders.filter(o => o.status === "Shipped").length > 0 ? (
                        orders.filter(o => o.status === "Shipped").map((order) => {
                          const firstItem = order.items?.[0];
                          const city = order.shippingAddress ? order.shippingAddress.split(',').slice(-2)[0]?.trim() || "Local" : "Local";
                          return (
                            <div key={order.orderId} className="flex items-center gap-4 bg-[#FAF6F0]/50 border border-[#B0B7C3] rounded-2xl p-4">
                              <div className="relative w-12 h-12 rounded-xl bg-white border border-[#B0B7C3] p-1 shrink-0 overflow-hidden">
                                <Image data-pin-nopin="true" src={firstItem?.image || "/placeholder.png"} alt="parcel" fill sizes="48px" className="object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-[#0D3C6A] uppercase">{order.orderId}</span>
                                  <span className="text-[10px] text-[#00A896]">In Transit</span>
                                </div>
                                <span className="text-[10px] text-[#00A896] flex items-center gap-1 mt-0.5">
                                  <Truck className="w-3 h-3" /> Standard Shipping → {city}
                                </span>
                                <div className="w-full h-1.5 bg-[#B0B7C3] rounded-full overflow-hidden mt-2">
                                  <div className="h-full bg-gradient-to-r from-[#5BA6D6] to-[#BCAE9E]" style={{ width: `50%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[#00A896]">No active shipments at the moment.</p>
                      )}
                    </div>
                  </Card>

                  {/* Shipping Configuration */}
                  <Card className="p-6 text-left mt-6">
                    <div className="flex justify-between items-center border-b border-[#B0B7C3] pb-4 mb-4">
                      <SectionHeader title="Shipping Rules" subtitle="Configure delivery fees and free shipping thresholds" />
                      <button onClick={handleSaveSettings} className="bg-[#BCAE9E] text-black font-bold text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-sm hover:opacity-90">Save Settings</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Free Shipping Threshold</label>
                        <p className="text-[10px] text-[#0D3C6A]/70 mb-2">Orders above this amount will get free shipping automatically.</p>
                        <input type="number" value={formSettings.freeShippingThreshold} onChange={e => setFormSettings({ ...formSettings, freeShippingThreshold: e.target.value === '' ? '' as any : Number(e.target.value) })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Standard Shipping Rate</label>
                        <p className="text-[10px] text-[#0D3C6A]/70 mb-2">Default delivery charge for orders below the threshold.</p>
                        <input type="number" value={formSettings.standardShippingRate} onChange={e => setFormSettings({ ...formSettings, standardShippingRate: e.target.value === '' ? '' as any : Number(e.target.value) })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* ============================ SETTINGS ============================ */}
              {activeSection === "Settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                  <Card className="p-8 space-y-6">
                    <SectionHeader title="Store Details" subtitle="Configure store configuration values" />
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Store Brand Name</label><input type="text" value={formSettings.brandName} onChange={e => setFormSettings({ ...formSettings, brandName: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Store Currency</label><input type="text" value={formSettings.currency} onChange={e => setFormSettings({ ...formSettings, currency: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Support Contact Email</label><input type="email" value={formSettings.supportEmail} onChange={e => setFormSettings({ ...formSettings, supportEmail: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Announcement Promo Text</label><input type="text" value={formSettings.promoText} onChange={e => setFormSettings({ ...formSettings, promoText: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" /></div>
                      <button onClick={handleSaveSettings} className="w-full bg-[#BCAE9E] text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md hover:opacity-90">Save configurations</button>
                    </div>
                  </Card>



                  {/* Footer Configuration */}
                  <Card className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-[#B0B7C3] pb-4">
                      <SectionHeader title="Footer Configuration" subtitle="Manage storefront footer content and links" />
                      <button onClick={handleSaveSettings} className="bg-[#BCAE9E] text-black font-bold text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-sm hover:opacity-90">Save Settings</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1 col-span-1 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Brand Description</label>
                        <textarea rows={2} value={formSettings.footerBrandDescription} onChange={e => setFormSettings({ ...formSettings, footerBrandDescription: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none resize-none" placeholder="Elevated skincare made with clean ingredients..." />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Shop Links (Format: Label|URL)</label>
                        <textarea rows={5} value={formSettings.footerShopLinks} onChange={e => setFormSettings({ ...formSettings, footerShopLinks: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none resize-none font-mono" placeholder="All Products|/shop" />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Collections Links (Format: Label|URL)</label>
                        <textarea rows={5} value={formSettings.footerCollectionsLinks} onChange={e => setFormSettings({ ...formSettings, footerCollectionsLinks: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none resize-none font-mono" placeholder="Hydration|/shop?category=Moisturizers" />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">About Links (Format: Label|URL)</label>
                        <textarea rows={5} value={formSettings.footerAboutLinks} onChange={e => setFormSettings({ ...formSettings, footerAboutLinks: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none resize-none font-mono" placeholder="Our Story|/about" />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Help Links (Format: Label|URL)</label>
                        <textarea rows={5} value={formSettings.footerHelpLinks} onChange={e => setFormSettings({ ...formSettings, footerHelpLinks: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none resize-none font-mono" placeholder="FAQ|/faq" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#B0B7C3]/50">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Instagram URL</label>
                        <input type="text" value={formSettings.footerSocialInstagram} onChange={e => setFormSettings({ ...formSettings, footerSocialInstagram: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-2 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Pinterest URL</label>
                        <input type="text" value={formSettings.footerSocialPinterest} onChange={e => setFormSettings({ ...formSettings, footerSocialPinterest: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-2 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">TikTok URL</label>
                        <input type="text" value={formSettings.footerSocialTiktok} onChange={e => setFormSettings({ ...formSettings, footerSocialTiktok: e.target.value })} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-2 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                    </div>
                  </Card>

                  {/* Security Configuration */}
                  <Card className="p-8 space-y-6 lg:col-span-2 mt-6">
                    <div className="flex justify-between items-center border-b border-[#B0B7C3] pb-4">
                      <SectionHeader title="Security" subtitle="Manage admin authentication" />
                    </div>
                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">Current Password</label>
                        <input required type="password" value={adminCurrentPassword} onChange={e => setAdminCurrentPassword(e.target.value)} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-[#00A896] font-semibold">New Password</label>
                        <input required minLength={6} type="password" value={adminNewPassword} onChange={e => setAdminNewPassword(e.target.value)} className="bg-[#FAF6F0] border border-[#5BA6D6] rounded-xl px-4 py-3 text-xs text-[#0D3C6A] focus:outline-none" />
                      </div>
                      <div>
                        <button type="submit" className="w-full bg-[#0D3C6A] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md hover:bg-black">Update Password</button>
                      </div>
                    </form>
                    {adminPasswordMessage && (
                      <p className={`text-xs font-bold ${adminPasswordMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>{adminPasswordMessage}</p>
                    )}
                  </Card>
                </div>
              )}

              {/* ============================ LOGS ============================ */}
              {activeSection === "Logs" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Events Today", value: "48", icon: History },
                      { label: "Admin Actions", value: "12", icon: Shield },
                      { label: "System Jobs", value: "31", icon: Zap },
                      { label: "Failed Logins", value: "2", icon: Eye },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#B0B7C3] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#00A896] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#0D3C6A] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>

                  <Card className="p-8 text-left space-y-6">
                    <SectionHeader title="System Logs" subtitle="Security trails and transaction audit histories" />
                    <div className="relative pl-6 max-h-[500px] overflow-y-auto scrollbar-none">
                      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#B0B7C3]" />
                      {[
                        { user: "Jane Doe (Super Admin)", action: "Marked order GL-632190 as Shipped", time: "10 mins ago", tone: "bg-blue-400" },
                        { user: "System Scheduler", action: "Cleared daily expired caches", time: "1 hour ago", tone: "bg-[#BCAE9E]" },
                        { user: "Ravi Menon (Fulfillment)", action: "Printed 12 shipping labels", time: "2 hours ago", tone: "bg-[#BCAE9E]" },
                        { user: "Jane Doe (Super Admin)", action: "Deactivated discount code SUMMER25", time: "4 hours ago", tone: "bg-amber-400" },
                        { user: "Security Monitor", action: "Blocked 2 failed login attempts", time: "6 hours ago", tone: "bg-red-400" },
                        { user: "Fulfillment Agent", action: "Dispatched batch standard orders", time: "12 hours ago", tone: "bg-[#BCAE9E]" },
                      ].map((log, idx) => (
                        <div key={idx} className="relative pb-6 last:pb-0">
                          <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${log.tone} ring-4 ring-white`} />
                          <div className="flex justify-between items-start gap-3">
                            <div className="text-left"><span className="font-semibold text-[#0D3C6A] text-xs block">{log.action}</span><span className="text-[9px] text-[#00A896] uppercase tracking-wider block mt-0.5">{log.user}</span></div>
                            <span className="text-[10px] text-[#00A896] uppercase tracking-wider shrink-0">{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ============================ MODAL FOR ORDER DETAILS ============================ */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF6F0] text-[#00A896] hover:bg-[#0D3C6A] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <h2 className="font-serif text-2xl text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-4 mb-6">Order {selectedOrder.orderId}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 bg-[#FAF6F0]/50 p-6 rounded-2xl border border-[#B0B7C3]/50 text-left">
                <div>
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-1">Customer</p>
                  <p className="text-sm font-semibold text-[#0D3C6A]">{selectedOrder.customerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[#0D3C6A]">{selectedOrder.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-1">Date</p>
                  <p className="text-sm font-semibold text-[#0D3C6A]">{selectedOrder.date}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-1">Shipping Address</p>
                  <p className="text-sm text-[#0D3C6A] leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <h3 className="font-serif text-sm text-[#0D3C6A] uppercase tracking-wider mb-4 border-b border-[#B0B7C3] pb-2 text-left">Items</h3>
              <div className="space-y-3 mb-8 max-h-48 overflow-y-auto scrollbar-none pr-2">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 border border-[#B0B7C3]/50 p-3 rounded-2xl bg-white shadow-sm">
                    <div className="relative w-12 h-12 bg-[#FAF6F0] rounded-xl overflow-hidden shrink-0 border border-[#B0B7C3] p-1">
                      <Image data-pin-nopin="true" src={item.image || "/placeholder.png"} alt={item.name} fill sizes="48px" className="object-contain" />
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                      <p className="text-xs font-bold text-[#0D3C6A] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#00A896] uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-[#0D3C6A] shrink-0">₹{(item.price * item.quantity).toFixed(2).replace(/\.00$/, "")}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-[#B0B7C3] pt-6 gap-4">
                <div className="w-full sm:w-auto">
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-2 text-left">Update Status</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {(["Processing", "Shipped", "Delivered", "Return Requested", "Return Approved", "Returned"] as const).map(s => {
                        if ((s === "Return Requested" || s === "Return Approved" || s === "Returned") && selectedOrder.status !== s) return null;
                        return (
                          <button
                            key={s}
                            onClick={() => setPendingStatusUpdate({ orderId: selectedOrder.orderId, status: s })}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedOrder.status === s ? "bg-[#0D3C6A] text-white border-[#0D3C6A]" : "bg-white text-[#00A896] border-[#B0B7C3] hover:border-[#0D3C6A] hover:text-[#0D3C6A]"}`}
                          >
                            {s === "Return Requested" ? "Return Request" : s}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOrder.status === "Return Requested" && (
                      <div className="flex gap-2">
                        <button onClick={() => setPendingStatusUpdate({ orderId: selectedOrder.orderId, status: "Return Approved" })} className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                          Approve
                        </button>
                        <button onClick={() => setPendingStatusUpdate({ orderId: selectedOrder.orderId, status: "Delivered" })} className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                          Reject
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "Return Approved" && (
                      <div className="flex gap-2">
                        <button onClick={() => setPendingStatusUpdate({ orderId: selectedOrder.orderId, status: "Returned" })} className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border bg-[#0D3C6A] text-white border-[#0D3C6A] hover:opacity-90">
                          Mark Returned
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto bg-[#FAF6F0] p-4 rounded-xl border border-[#B0B7C3]">
                  <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold mb-1">Grand Total</p>
                  <p className="text-xl font-bold text-[#0D3C6A]">₹{selectedOrder.total.toFixed(2).replace(/\.00$/, "")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================ MINI PAGE / MODAL FOR CONFIRMING STATUS UPDATE ============================ */}
        {pendingStatusUpdate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-[#FAF6F0] rounded-full mx-auto flex items-center justify-center border border-[#B0B7C3] mb-4">
                <Truck className="w-6 h-6 text-[#0D3C6A]" />
              </div>
              <h2 className="font-serif text-xl text-[#0D3C6A] uppercase tracking-wider mb-2">Confirm Update</h2>
              <p className="text-sm text-[#00A896] mb-8">
                Are you sure you want to mark order <strong>{pendingStatusUpdate.orderId}</strong> as <strong className="text-[#0D3C6A]">{pendingStatusUpdate.status}</strong>?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setPendingStatusUpdate(null)}
                  className="flex-1 border border-[#0D3C6A] text-[#0D3C6A] py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateOrderStatus(pendingStatusUpdate.orderId, pendingStatusUpdate.status);
                    if (selectedOrder) {
                      setSelectedOrder({ ...selectedOrder, status: pendingStatusUpdate.status });
                    }
                    setPendingStatusUpdate(null);
                  }}
                  className="flex-1 bg-[#0D3C6A] hover:bg-[#383838] text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
