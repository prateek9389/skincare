"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface OrderDetails {
  orderId: string;
  date: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  status: string;
  customerName?: string;
}

type SectionType =
  | "Dashboard"
  | "Products"
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
    <h3 className="font-serif text-lg text-[#1C1B19] font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-[10px] text-[#8C8276] uppercase tracking-widest mt-0.5">{subtitle}</p>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-[#EAE3DC] rounded-3xl shadow-sm ${className}`}>{children}</div>
);

const Pill = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "green" | "blue" | "amber" | "neutral" | "red" }) => {
  const tones: Record<string, string> = {
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-[#FAF6F0] text-[#8C8276] border-[#D4C5B9]",
  };
  return (
    <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
};

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<SectionType>("Dashboard");
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [coupons, setCoupons] = useState([
    { code: "AURA15", discount: "15% Off", status: "Active", usages: 42 },
    { code: "WELCOME10", discount: "10% Off", status: "Active", usages: 128 },
    { code: "SUMMER25", discount: "25% Off", status: "Expired", usages: 94 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10% Off");
  const [chartFilter, setChartFilter] = useState<"7d" | "30d" | "90d" | "12m" | "All">("12m");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered">("All");
  const [reviewFilter, setReviewFilter] = useState<"All" | "5" | "4" | "Flagged">("All");
  const [productView, setProductView] = useState<"grid" | "list">("grid");

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("aura_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialMockOrders: OrderDetails[] = [
        {
          orderId: "AURA-982741",
          date: "July 5, 2026",
          total: 104.0,
          customerName: "Emily Carter",
          items: [
            { productId: "cream-cleanser", name: "Hydra Cream Cleanser", price: 45.0, quantity: 1, image: IMG.cream },
            { productId: "niacinamide-toner", name: "Niacinamide Toner", price: 40.0, quantity: 1, image: IMG.toner },
          ],
          shippingAddress: "742 Evergreen Terrace, Springfield, IL 62704",
          status: "Processing",
        },
        {
          orderId: "AURA-632190",
          date: "July 4, 2026",
          total: 34.0,
          customerName: "James Whitfield",
          items: [{ productId: "jaluellicin-cream", name: "Daily Moisturizer", price: 34.0, quantity: 1, image: IMG.moisturizer }],
          shippingAddress: "221B Baker Street, London, NW1 6XE",
          status: "Shipped",
        },
        {
          orderId: "AURA-410982",
          date: "July 2, 2026",
          total: 76.0,
          customerName: "Sofia Nguyen",
          items: [{ productId: "jaluellicin-serum", name: "Radiance Serum", price: 38.0, quantity: 2, image: IMG.serum }],
          shippingAddress: "1600 Pennsylvania Ave NW, Washington, DC 20500",
          status: "Delivered",
        },
      ];
      localStorage.setItem("aura_orders", JSON.stringify(initialMockOrders));
      setOrders(initialMockOrders);
    }
  }, []);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem("aura_orders", JSON.stringify(updated));
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setCoupons((prev) => [...prev, { code: newCouponCode.toUpperCase(), discount: newCouponDiscount, status: "Active", usages: 0 }]);
    setNewCouponCode("");
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, status: c.status === "Active" ? "Expired" : "Active" } : c)));
  };

  // Dashboard Stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0) + 12450.0;
  const totalOrdersCount = orders.length + 312;
  const activeCustomersCount = 184;

  const chartDataSets: Record<string, { label: string; value: number }[]> = {
    "7d": [
      { label: "Mon", value: 820 }, { label: "Tue", value: 1100 }, { label: "Wed", value: 950 },
      { label: "Thu", value: 1400 }, { label: "Fri", value: 1250 }, { label: "Sat", value: 1800 }, { label: "Sun", value: 1600 },
    ],
    "30d": [{ label: "W1", value: 3200 }, { label: "W2", value: 4100 }, { label: "W3", value: 3800 }, { label: "W4", value: 5200 }],
    "90d": [{ label: "May", value: 5200 }, { label: "Jun", value: 6800 }, { label: "Jul", value: totalRevenue }],
    "12m": [
      { label: "Jan", value: 2400 }, { label: "Feb", value: 3100 }, { label: "Mar", value: 4500 }, { label: "Apr", value: 3800 },
      { label: "May", value: 5200 }, { label: "Jun", value: 6800 }, { label: "Jul", value: totalRevenue },
    ],
    "All": [
      { label: "Q1'25", value: 1800 }, { label: "Q2'25", value: 3400 }, { label: "Q3'25", value: 4900 }, { label: "Q4'25", value: 6200 },
      { label: "Q1'26", value: 8100 }, { label: "Q2'26", value: 11200 }, { label: "Q3'26", value: totalRevenue },
    ],
  };

  const activeChartData = chartDataSets[chartFilter];
  const maxSales = Math.max(...activeChartData.map((d) => d.value));

  return (
    <div className="flex h-screen bg-[#FBF9F6] text-[#1C1B19] overflow-hidden font-sans selection:bg-[#D4C5B9] selection:text-[#1C1B19]">

      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR PANEL */}
      {/* ============================================================ */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#EAE3DC] flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#BCAE9E] to-[#D4C5B9] flex items-center justify-center font-serif text-[#1C1B19] font-bold text-sm">A</div>
            <div className="text-left">
              <h2 className="font-serif text-sm font-bold tracking-widest uppercase text-[#1C1B19] leading-none">AURA</h2>
              <span className="text-[9px] text-[#8C8276] uppercase tracking-widest font-semibold block mt-0.5">Control Center</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "Products", label: "Products", icon: Package },
              { id: "Orders", label: "Orders", icon: ShoppingBag },
              { id: "Customers", label: "Customers", icon: Users },
              { id: "Analytics", label: "Analytics", icon: BarChart3 },
              { id: "Discounts", label: "Discounts", icon: Percent },
              { id: "Reviews", label: "Reviews", icon: MessageSquare },
              { id: "Shipping", label: "Shipping", icon: Truck },
              { id: "Settings", label: "Settings", icon: SettingsIcon },
              { id: "Logs", label: "Admin Logs", icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SectionType)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                    isSelected
                      ? "bg-[#FAF6F0] text-[#1C1B19] border-l-2 border-[#BCAE9E] shadow-sm"
                      : "text-[#8C8276] hover:text-[#1C1B19] hover:bg-[#FAF6F0]/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-[#BCAE9E]" : "text-[#8C8276]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar promo card + logout */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#1C1B19] to-[#3A362F] p-4 text-left overflow-hidden relative">
            <Award className="w-5 h-5 text-[#D4C5B9] mb-2" />
            <h4 className="text-[11px] font-serif font-semibold text-white uppercase tracking-wide leading-tight">Aura Pro</h4>
            <p className="text-[9px] text-[#BCAE9E] mt-1 leading-relaxed">Unlock forecasting & AI restock alerts.</p>
            <button className="mt-3 w-full text-[9px] font-bold uppercase tracking-widest bg-[#BCAE9E] text-[#1C1B19] py-2 rounded-lg hover:opacity-90 transition-opacity">Upgrade</button>
          </div>
          <div className="border-t border-[#EAE3DC] pt-4">
            <Link href="/" className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#8C8276] hover:text-[#1C1B19] hover:bg-[#FAF6F0]/50 transition-colors">
              <LogOut className="w-4 h-4 text-[#8C8276]" />
              <span>Store Front</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN SCROLLABLE CONTENT */}
      {/* ============================================================ */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#F5F2EB] relative overflow-hidden">
        <header className="h-20 border-b border-[#EAE3DC] flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
          <div className="text-left">
            <h1 className="text-lg font-serif text-[#1C1B19] font-medium uppercase tracking-wider">{activeSection}</h1>
            <span className="text-[9px] text-[#8C8276] uppercase tracking-wider block mt-0.5">Admin Management System</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C8276]" />
              <input type="text" placeholder="Search resources..." className="w-64 bg-[#FAF6F0] border border-[#EAE3DC] rounded-full pl-9 pr-4 py-2 text-xs text-[#1C1B19] placeholder-[#8C8276] focus:outline-none focus:border-[#BCAE9E]" />
            </div>
            <button className="relative w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#EAE3DC] flex items-center justify-center text-[#8C8276] hover:text-[#1C1B19] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BCAE9E] border border-white" />
            </button>
            <div className="flex items-center gap-3 border-l border-[#EAE3DC] pl-4">
              <div className="w-9 h-9 rounded-full bg-[#BCAE9E] flex items-center justify-center font-bold text-[#1C1B19] text-xs">JD</div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-[#1C1B19] block">Jane Doe</span>
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
                        <span className="text-[10px] uppercase tracking-widest text-[#BCAE9E] font-bold">Monday, July 6 2026</span>
                        <h2 className="font-serif text-2xl text-[#1C1B19] font-medium mt-2 leading-tight">Good morning, Jane.</h2>
                        <p className="text-xs text-[#8C8276] mt-2 max-w-md leading-relaxed">Revenue is up 14.2% this cycle. You have {orders.filter(o => o.status === "Processing").length} orders awaiting fulfillment and 3 low-stock items flagged for restock.</p>
                        <div className="flex gap-3 mt-5">
                          <button onClick={() => setActiveSection("Orders")} className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#1C1B19] px-5 py-2.5 rounded-xl hover:bg-[#2C2B29] transition-colors">Review Orders</button>
                          <button onClick={() => setActiveSection("Analytics")} className="text-[10px] font-bold uppercase tracking-widest text-[#1C1B19] bg-[#FAF6F0] border border-[#EAE3DC] px-5 py-2.5 rounded-xl hover:border-[#BCAE9E] transition-colors">View Analytics</button>
                        </div>
                      </div>
                      <div className="relative min-h-[180px] bg-gradient-to-br from-[#FAF6F0] to-[#E9E1D6] flex items-center justify-center p-6">
                        <div className="relative w-40 h-40">
                          <Image src={IMG.serum} alt="Featured serum" fill sizes="160px" className="object-contain drop-shadow-xl" />
                        </div>
                        <span className="absolute top-4 right-4"><Pill tone="amber">Best Seller</Pill></span>
                      </div>
                    </div>
                  </Card>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, change: "+14.2% from last month" },
                      { label: "Sales Orders", value: `${totalOrdersCount}`, icon: ShoppingBag, change: "+8.4% since launch" },
                      { label: "Active Customers", value: `${activeCustomersCount}`, icon: Users, change: "+12.1% active cycles" },
                      { label: "Monthly Target", value: "84.2%", icon: TrendingUp, change: "On track for July goals" },
                    ].map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="bg-white border border-[#EAE3DC] rounded-2xl p-6 text-left relative overflow-hidden group hover:border-[#D4C5B9] transition-colors shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#8C8276] font-semibold">{stat.label}</span>
                            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><StatIcon className="w-4 h-4" /></div>
                          </div>
                          <h3 className="text-2xl font-semibold text-[#1C1B19] tracking-tight">{stat.value}</h3>
                          <span className="text-[10px] text-green-500 block mt-2 font-medium tracking-wide">{stat.change}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8 bg-white border border-[#EAE3DC] rounded-3xl p-6 flex flex-col text-left shadow-sm">
                      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider">Revenue Stream</h3>
                          <p className="text-[10px] text-[#8C8276] uppercase tracking-widest mt-0.5">Performance analytics</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#FAF6F0] rounded-full p-1 border border-[#EAE3DC]">
                          {(["7d", "30d", "90d", "12m", "All"] as const).map((f) => (
                            <button key={f} onClick={() => setChartFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${chartFilter === f ? "bg-[#1C1B19] text-white shadow-sm" : "text-[#8C8276] hover:text-[#1C1B19]"}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <div className="relative flex-1 min-h-[250px]">
                        {(() => {
                          const chartW = 700, chartH = 250, padL = 55, padR = 20, padT = 25, padB = 35;
                          const drawW = chartW - padL - padR, drawH = chartH - padT - padB;
                          const data = activeChartData, maxV = maxSales * 1.15;
                          const points = data.map((d, i) => ({ x: padL + (i / (data.length - 1 || 1)) * drawW, y: padT + drawH - (d.value / maxV) * drawH, label: d.label, value: d.value }));
                          const curvePath = points.reduce((acc, p, i, arr) => { if (i === 0) return `M${p.x},${p.y}`; const prev = arr[i - 1]; const cpx = (prev.x + p.x) / 2; return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`; }, "");
                          const areaPath = `${curvePath} L${points[points.length - 1].x},${padT + drawH} L${points[0].x},${padT + drawH} Z`;
                          const gridLines = Array.from({ length: 5 }, (_, i) => { const val = (maxV / 4) * i; const y = padT + drawH - (val / maxV) * drawH; return { y, label: `$${(val / 1000).toFixed(1)}k` }; });
                          const pathLength = points.reduce((acc, p, i) => { if (i === 0) return 0; const prev = points[i - 1]; return acc + Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2)); }, 0) * 1.5;
                          return (
                            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#BCAE9E" stopOpacity="0.35" /><stop offset="100%" stopColor="#BCAE9E" stopOpacity="0" /></linearGradient>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D4C5B9" /><stop offset="50%" stopColor="#BCAE9E" /><stop offset="100%" stopColor="#A09080" /></linearGradient>
                              </defs>
                              {gridLines.map((gl, i) => (
                                <g key={`grid-${i}`}>
                                  <line x1={padL} y1={gl.y} x2={chartW - padR} y2={gl.y} stroke="#EAE3DC" strokeWidth="1" strokeDasharray={i > 0 ? "4 4" : "0"} />
                                  <text x={padL - 8} y={gl.y + 4} textAnchor="end" fill="#8C8276" fontSize="9" fontWeight="600">{gl.label}</text>
                                </g>
                              ))}
                              <motion.path key={`area-${chartFilter}`} d={areaPath} fill="url(#chartGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />
                              <motion.path key={`line-${chartFilter}`} d={curvePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
                              {points.map((p, i) => (
                                <g key={`point-${chartFilter}-${i}`}>
                                  {i === points.length - 1 && (<motion.circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#BCAE9E" strokeWidth="1.5" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.6, 0], scale: [0.5, 1.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />)}
                                  <motion.circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#BCAE9E" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }} style={{ cursor: "pointer" }} />
                                  <motion.text x={p.x} y={p.y - 14} textAnchor="middle" fill="#1C1B19" fontSize="9" fontWeight="700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}>${p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}</motion.text>
                                  <text x={p.x} y={chartH - 8} textAnchor="middle" fill="#8C8276" fontSize="9" fontWeight="600">{p.label}</text>
                                </g>
                              ))}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-white border border-[#EAE3DC] rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm">
                      <div>
                        <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider">Category Share</h3>
                        <p className="text-[10px] text-[#8C8276] uppercase tracking-widest mt-0.5">Direct retail splits</p>
                      </div>
                      <div className="space-y-5 my-6">
                        {[
                          { category: "Moisturizers", share: 42, color: "bg-[#BCAE9E]" },
                          { category: "Serums", share: 28, color: "bg-neutral-600" },
                          { category: "Cleansers", share: 18, color: "bg-neutral-700" },
                          { category: "Toners", share: 12, color: "bg-neutral-800" },
                        ].map((share, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold tracking-wider uppercase text-[#1C1B19]/80"><span>{share.category}</span><span>{share.share}%</span></div>
                            <div className="w-full h-1.5 bg-[#FAF6F0] rounded-full overflow-hidden"><div className={`h-full ${share.color}`} style={{ width: `${share.share}%` }} /></div>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] text-[#8C8276] uppercase tracking-wider font-medium text-center block border-t border-[#EAE3DC] pt-4">Updated in real-time</span>
                    </div>
                  </div>

                  {/* NEW: Low Stock Alerts with images */}
                  <Card className="p-6 text-left">
                    <div className="flex justify-between items-center mb-6 border-b border-[#EAE3DC] pb-3">
                      <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider">Restock Alerts</h3>
                      <Pill tone="amber">3 items low</Pill>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {productList.slice(0, 3).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-4 bg-[#FAF6F0]/60 border border-[#EAE3DC] rounded-2xl p-4">
                          <div className="relative w-14 h-14 rounded-xl bg-white border border-[#EAE3DC] p-1 shrink-0 overflow-hidden">
                            <Image src={p.image} alt={p.name} fill sizes="56px" className="object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-[#1C1B19] truncate">{p.name}</h4>
                            <p className="text-[10px] text-[#8C8276] mt-0.5">{[7, 4, 11][i]} units left</p>
                            <div className="w-full h-1 bg-[#EAE3DC] rounded-full overflow-hidden mt-2"><div className="h-full bg-amber-400" style={{ width: `${[18, 12, 26][i]}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Products + Recent Orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white border border-[#EAE3DC] rounded-3xl p-6 text-left shadow-sm">
                      <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider mb-6 border-b border-[#EAE3DC] pb-3">Top Selling Products</h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-[#EAE3DC] text-[10px] uppercase tracking-wider text-[#8C8276] font-semibold"><th className="pb-3">Product</th><th className="pb-3">Category</th><th className="pb-3">Stock</th><th className="pb-3">Price</th></tr></thead>
                          <tbody className="text-xs font-light text-[#1C1B19]/80 divide-y divide-[#EAE3DC]/60">
                            {productList.slice(0, 4).map((p) => (
                              <tr key={p.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                <td className="py-3 flex items-center gap-3"><div className="relative w-8 h-8 rounded-lg bg-[#FAF6F0] overflow-hidden shrink-0 border border-[#D4C5B9] p-0.5"><Image src={p.image} alt={p.name} fill sizes="32px" className="object-contain" /></div><span className="font-medium text-[#1C1B19] line-clamp-1">{p.name}</span></td>
                                <td className="py-3 uppercase text-[10px] tracking-wider text-[#8C8276] font-medium">{p.category}</td>
                                <td className="py-3"><Pill tone="green">In Stock</Pill></td>
                                <td className="py-3 font-semibold text-[#1C1B19]">${p.price.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="lg:col-span-5 bg-white border border-[#EAE3DC] rounded-3xl p-6 text-left shadow-sm">
                      <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider mb-6 border-b border-[#EAE3DC] pb-3">Recent Live Orders</h3>
                      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-none pr-1">
                        {orders.map((o) => (
                          <div key={o.orderId} className="flex justify-between items-center text-xs border-b border-[#EAE3DC]/50 pb-3 last:border-0 last:pb-0">
                            <div className="space-y-0.5"><span className="font-bold text-[#1C1B19] uppercase">{o.orderId}</span><span className="text-[10px] text-[#8C8276] block uppercase tracking-wider">{o.date}</span></div>
                            <div className="text-right space-y-1"><span className="font-semibold text-[#1C1B19] block">${o.total.toFixed(2)}</span><span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${o.status === "Delivered" ? "bg-green-50 text-green-600 border-green-200" : o.status === "Shipped" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>{o.status}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ============================ PRODUCTS ============================ */}
              {activeSection === "Products" && (
                <div className="space-y-6">
                  {/* Product Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Products", value: `${productList.length}`, icon: Package, tone: "bg-white" },
                      { label: "In Stock", value: `${productList.length}`, icon: Box, tone: "bg-green-50" },
                      { label: "Low Stock", value: "3", icon: Bell, tone: "bg-amber-50" },
                      { label: "Categories", value: "4", icon: LayoutDashboard, tone: "bg-white" },
                    ].map((s) => {
                      const SI = s.icon;
                      return (
                        <div key={s.label} className={`${s.tone} border border-[#EAE3DC] rounded-2xl p-5 text-left flex items-center justify-between`}>
                          <div><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#1C1B19] block mt-1">{s.value}</span></div>
                          <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Header + controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader title="Product Inventory" subtitle={`Manage your Aura catalog (${productList.length} items)`} />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#FAF6F0] rounded-full p-1 border border-[#EAE3DC]">
                        <button onClick={() => setProductView("grid")} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${productView === "grid" ? "bg-[#1C1B19] text-white" : "text-[#8C8276]"}`}>Grid</button>
                        <button onClick={() => setProductView("list")} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${productView === "list" ? "bg-[#1C1B19] text-white" : "text-[#8C8276]"}`}>List</button>
                      </div>
                      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C8276]" /><input type="text" placeholder="Search products..." className="bg-[#FAF6F0] border border-[#EAE3DC] rounded-full pl-9 pr-4 py-2 text-xs text-[#1C1B19] placeholder-[#8C8276] focus:outline-none focus:border-[#BCAE9E] w-44" /></div>
                      <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white bg-[#1C1B19] px-4 py-2.5 rounded-xl uppercase hover:bg-[#2C2B29] transition-colors shadow-sm"><Plus className="w-3.5 h-3.5" />Add Product</button>
                    </div>
                  </div>

                  {/* Category filter chips */}
                  <div className="flex flex-wrap gap-2">
                    {["All Categories", "Moisturizers", "Serums", "Cleansers", "Toners"].map((c, i) => (
                      <button key={c} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${i === 0 ? "bg-[#BCAE9E] text-[#1C1B19] border-[#BCAE9E]" : "bg-white text-[#8C8276] border-[#EAE3DC] hover:border-[#BCAE9E]"}`}>{c}</button>
                    ))}
                  </div>

                  {/* Grid view */}
                  {productView === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {productList.map((p, idx) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.06 }} onClick={() => setSelectedProduct(p)} className="bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md hover:border-[#D4C5B9] transition-all">
                          <div className="relative aspect-square bg-gradient-to-br from-[#FAF6F0] to-[#F0EBE3] p-6 overflow-hidden">
                            <Image src={p.image} alt={p.name} fill sizes="240px" className="object-contain group-hover:scale-110 transition-transform duration-500" />
                            {p.tag && (<span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest bg-[#1C1B19] text-white">{p.tag}</span>)}
                            <span className="absolute top-3 right-3"><Pill tone="green">In Stock</Pill></span>
                            <div className="absolute inset-0 bg-[#1C1B19]/0 group-hover:bg-[#1C1B19]/5 transition-colors flex items-center justify-center"><span className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-[10px] font-bold uppercase tracking-widest text-[#1C1B19] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-[#EAE3DC]">View Details →</span></div>
                          </div>
                          <div className="p-4 space-y-2">
                            <span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold block">{p.category}</span>
                            <h4 className="text-sm font-semibold text-[#1C1B19] leading-tight">{p.name}</h4>
                            <p className="text-[11px] text-[#8C8276] line-clamp-2">{p.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-[#EAE3DC]/60">
                              <span className="text-base font-bold text-[#1C1B19]">${p.price.toFixed(2)}</span>
                              <div className="flex gap-1">{p.ingredients?.slice(0, 2).map((ing) => (<span key={ing} className="px-2 py-0.5 rounded-full text-[7px] bg-[#FAF6F0] text-[#8C8276] border border-[#EAE3DC] uppercase font-semibold">{ing}</span>))}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* List view */}
                  {productView === "list" && (
                    <Card className="p-2 overflow-hidden">
                      <div className="divide-y divide-[#EAE3DC]/60">
                        {productList.map((p) => (
                          <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center gap-4 p-4 hover:bg-[#FAF6F0]/50 transition-colors cursor-pointer">
                            <div className="relative w-14 h-14 rounded-xl bg-[#FAF6F0] border border-[#EAE3DC] p-1 shrink-0 overflow-hidden"><Image src={p.image} alt={p.name} fill sizes="56px" className="object-contain" /></div>
                            <div className="flex-1 min-w-0"><span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold">{p.category}</span><h4 className="text-sm font-semibold text-[#1C1B19] truncate">{p.name}</h4></div>
                            <div className="hidden sm:block"><Pill tone="green">In Stock</Pill></div>
                            <span className="text-base font-bold text-[#1C1B19] w-20 text-right">${p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Product Detail Modal */}
                  <AnimatePresence>
                    {selectedProduct && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE3DC]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            <div className="bg-gradient-to-br from-[#FAF6F0] to-[#F0EBE3] p-8 md:p-12 flex flex-col items-center justify-center relative min-h-[400px]">
                              <div className="relative w-full aspect-square max-w-[300px]"><Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="300px" className="object-contain" /></div>
                              <div className="flex gap-2 mt-6">{[0, 1, 2, 3].map((i) => (<div key={i} className={`w-14 h-14 rounded-xl border-2 overflow-hidden relative ${i === 0 ? "border-[#BCAE9E]" : "border-[#EAE3DC]"} bg-white p-1`}><Image src={selectedProduct.image} alt="" fill sizes="56px" className="object-contain" /></div>))}</div>
                            </div>
                            <div className="p-8 space-y-5 text-left">
                              <div className="flex justify-between items-start">
                                <div><span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold block mb-1">{selectedProduct.category}</span><h2 className="text-2xl font-serif font-bold text-[#1C1B19] tracking-tight">{selectedProduct.name}</h2></div>
                                <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#EAE3DC] transition-colors flex items-center justify-center text-[#8C8276] text-lg">×</button>
                              </div>
                              <div className="flex items-center gap-4"><span className="text-3xl font-bold text-[#1C1B19]">${selectedProduct.price.toFixed(2)}</span><Pill tone="green">In Stock</Pill></div>
                              <div className="border-t border-b border-[#EAE3DC] py-4"><h4 className="text-[10px] uppercase tracking-widest text-[#8C8276] font-bold mb-2">Description</h4><p className="text-sm text-[#1C1B19]/80 leading-relaxed">{selectedProduct.description}</p></div>
                              <div><h4 className="text-[10px] uppercase tracking-widest text-[#8C8276] font-bold mb-3">Available Variants</h4><div className="flex flex-wrap gap-2">{["30ml", "50ml", "100ml"].map((size, i) => (<button key={size} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${i === 1 ? "bg-[#1C1B19] text-white border-[#1C1B19]" : "bg-white text-[#1C1B19] border-[#EAE3DC] hover:border-[#BCAE9E]"}`}>{size}</button>))}</div></div>
                              <div><h4 className="text-[10px] uppercase tracking-widest text-[#8C8276] font-bold mb-3">Key Ingredients</h4><div className="flex flex-wrap gap-2">{selectedProduct.ingredients?.map((ing) => (<span key={ing} className="px-3 py-1.5 rounded-full text-[10px] bg-[#FAF6F0] text-[#BCAE9E] border border-[#D4C5B9] uppercase font-bold tracking-wider">{ing}</span>))}</div></div>
                              <div className="grid grid-cols-2 gap-3 pt-2">{[{ label: "SKU", value: selectedProduct.id.toUpperCase() }, { label: "Weight", value: "120g" }, { label: "Shelf Life", value: "24 months" }, { label: "Origin", value: "South Korea" }].map((detail) => (<div key={detail.label} className="bg-[#FAF6F0] rounded-xl p-3"><span className="text-[8px] uppercase tracking-widest text-[#8C8276] font-bold block">{detail.label}</span><span className="text-xs font-semibold text-[#1C1B19] mt-1 block">{detail.value}</span></div>))}</div>
                              <div className="flex gap-3 pt-2"><button className="flex-1 py-3 rounded-xl bg-[#1C1B19] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2C2B29] transition-colors">Edit Product</button><button className="py-3 px-5 rounded-xl bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-200 hover:bg-red-100 transition-colors">Delete</button></div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ============================ ORDERS ============================ */}
              {activeSection === "Orders" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader title="Order Management" subtitle="Track, manage and fulfill customer orders" />
                    <div className="flex items-center gap-2 bg-[#FAF6F0] rounded-full p-1 border border-[#EAE3DC]">
                      {(["All", "Processing", "Shipped", "Delivered"] as const).map((f) => {
                        const count = f === "All" ? orders.length : orders.filter((o) => o.status === f).length;
                        return (<button key={f} onClick={() => setOrderFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${orderFilter === f ? "bg-[#1C1B19] text-white shadow-sm" : "text-[#8C8276] hover:text-[#1C1B19]"}`}>{f}<span className={`text-[8px] px-1.5 py-0.5 rounded-full ${orderFilter === f ? "bg-white/20" : "bg-[#EAE3DC]"}`}>{count}</span></button>);
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Orders", value: orders.length.toString(), color: "text-[#1C1B19]", bg: "bg-white" },
                      { label: "Processing", value: orders.filter((o) => o.status === "Processing").length.toString(), color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Shipped", value: orders.filter((o) => o.status === "Shipped").length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length.toString(), color: "text-green-600", bg: "bg-green-50" },
                    ].map((stat) => (<div key={stat.label} className={`${stat.bg} border border-[#EAE3DC] rounded-2xl p-4 text-left`}><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold block">{stat.label}</span><span className={`text-2xl font-bold ${stat.color} block mt-1`}>{stat.value}</span></div>))}
                  </div>

                  <div className="space-y-4">
                    {orders.filter((o) => orderFilter === "All" || o.status === orderFilter).map((o, idx) => (
                      <motion.div key={o.orderId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 border-b border-[#EAE3DC]/60">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.status === "Delivered" ? "bg-green-50 text-green-600" : o.status === "Shipped" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{o.status === "Delivered" ? <Package className="w-5 h-5" /> : o.status === "Shipped" ? <Truck className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}</div>
                            <div className="text-left"><h4 className="text-sm font-bold text-[#1C1B19] uppercase tracking-wider">{o.orderId}</h4><span className="text-[10px] text-[#8C8276] uppercase tracking-wider block">{o.customerName ? `${o.customerName} • ` : ""}{o.date}</span></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-block text-[9px] font-bold uppercase px-3 py-1.5 rounded-full border ${o.status === "Delivered" ? "bg-green-50 text-green-600 border-green-200" : o.status === "Shipped" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>{o.status}</span>
                            <span className="text-lg font-bold text-[#1C1B19]">${o.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="md:col-span-2">
                            <h5 className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold mb-3">Order Items</h5>
                            <div className="flex flex-wrap gap-3">
                              {o.items.map((item, iIdx) => {
                                const matchedProduct = PRODUCTS.find((pp) => pp.id === (item.productId || item.id));
                                const imgSrc = matchedProduct ? matchedProduct.image : item.image;
                                return (<div key={iIdx} className="flex items-center gap-2 bg-[#FAF6F0] border border-[#EAE3DC] rounded-xl p-2 pr-4"><div className="relative w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-[#EAE3DC] p-0.5">{imgSrc && <Image src={imgSrc} alt={item.name} fill sizes="40px" className="object-contain" />}</div><div className="text-left"><span className="text-xs font-semibold text-[#1C1B19] block leading-tight">{item.name}</span><span className="text-[9px] text-[#8C8276]">Qty: {item.quantity} • ${item.price.toFixed(2)}</span></div></div>);
                              })}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div><h5 className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold mb-2">Shipping Address</h5><p className="text-xs text-[#1C1B19]/80 leading-relaxed">{o.shippingAddress}</p></div>
                            <div className="flex gap-2">
                              {o.status !== "Shipped" && o.status !== "Delivered" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Shipped")} className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-200 hover:bg-blue-100 transition-colors">Mark Shipped</button>)}
                              {o.status !== "Delivered" && (<button onClick={() => handleUpdateOrderStatus(o.orderId, "Delivered")} className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-200 hover:bg-green-100 transition-colors">Mark Delivered</button>)}
                              {o.status === "Delivered" && (<span className="flex-1 py-2.5 rounded-xl bg-[#FAF6F0] text-[#8C8276] text-[10px] font-bold uppercase tracking-wider text-center border border-[#EAE3DC]">✓ Fulfilled</span>)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {orders.filter((o) => orderFilter === "All" || o.status === orderFilter).length === 0 && (<div className="bg-white border border-[#EAE3DC] rounded-2xl p-12 text-center"><ShoppingBag className="w-12 h-12 text-[#EAE3DC] mx-auto mb-4" /><h4 className="text-sm font-semibold text-[#1C1B19] mb-1">No orders found</h4><p className="text-[11px] text-[#8C8276]">{orderFilter === "All" ? "Orders placed on the storefront will appear here" : `No ${orderFilter.toLowerCase()} orders at this time`}</p></div>)}
                  </div>
                </div>
              )}

              {/* ============================ CUSTOMERS ============================ */}
              {activeSection === "Customers" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Customers", value: "184", icon: Users },
                      { label: "New This Month", value: "27", icon: Heart },
                      { label: "Gold Members", value: "12", icon: Award },
                      { label: "Avg. LTV", value: "$254", icon: DollarSign },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#1C1B19] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>

                  <SectionHeader title="Top Customers" subtitle="Highest lifetime value clients this quarter" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                      { name: "Emily Carter", email: "emily.carter@gmail.com", orders: 12, ltv: 480.0, tier: "Gold Member", tone: "amber", loc: "Springfield, IL", fav: IMG.serum },
                      { name: "James Whitfield", email: "j.whitfield@outlook.com", orders: 8, ltv: 310.0, tier: "Silver Member", tone: "neutral", loc: "London, UK", fav: IMG.moisturizer },
                      { name: "Sofia Nguyen", email: "sofia.n@proton.me", orders: 4, ltv: 180.0, tier: "Active Client", tone: "blue", loc: "Austin, TX", fav: IMG.cream },
                      { name: "Marcus Reid", email: "marcus.reid@icloud.com", orders: 6, ltv: 265.0, tier: "Silver Member", tone: "neutral", loc: "Toronto, CA", fav: IMG.toner },
                      { name: "Priya Sharma", email: "priya.sharma@gmail.com", orders: 15, ltv: 620.0, tier: "Gold Member", tone: "amber", loc: "Mumbai, IN", fav: IMG.serum },
                      { name: "Sarah Connor", email: "sarah.connor@cyber.com", orders: 1, ltv: 45.0, tier: "New Client", tone: "green", loc: "Los Angeles, CA", fav: IMG.moisturizer },
                    ].map((c, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.05 }} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left hover:shadow-md hover:border-[#D4C5B9] transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#BCAE9E] to-[#D4C5B9] flex items-center justify-center font-bold text-[#1C1B19] text-sm">{c.name.split(" ").map((n) => n[0]).join("")}</div>
                            <div><h4 className="text-sm font-semibold text-[#1C1B19] leading-tight">{c.name}</h4><span className="text-[10px] text-[#8C8276] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{c.loc}</span></div>
                          </div>
                          <Pill tone={c.tone as any}>{c.tier.split(" ")[0]}</Pill>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] text-[#8C8276]"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{c.email}</span></div>
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#EAE3DC]/60">
                          <div><span className="text-[8px] uppercase tracking-widest text-[#8C8276] font-bold block">Orders</span><span className="text-base font-bold text-[#1C1B19]">{c.orders}</span></div>
                          <div><span className="text-[8px] uppercase tracking-widest text-[#8C8276] font-bold block">Lifetime Value</span><span className="text-base font-bold text-[#1C1B19]">${c.ltv.toFixed(0)}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#EAE3DC]/60">
                          <div className="relative w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#EAE3DC] p-0.5 overflow-hidden shrink-0"><Image src={c.fav} alt="favourite" fill sizes="32px" className="object-contain" /></div>
                          <span className="text-[10px] text-[#8C8276]">Frequently buys this item</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Full registry table */}
                  <Card className="p-8 text-left space-y-6">
                    <SectionHeader title="Customer Registry" subtitle="Registered client logs and lifetime spending" />
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-[#EAE3DC] text-[10px] uppercase tracking-wider text-[#8C8276] font-semibold"><th className="pb-3">Customer</th><th className="pb-3">Email Address</th><th className="pb-3">Orders</th><th className="pb-3">Lifetime Value</th><th className="pb-3">Tier</th></tr></thead>
                        <tbody className="text-xs text-[#1C1B19]/80 divide-y divide-[#EAE3DC]/60 font-light">
                          {[
                            { name: "Emily Carter", email: "emily.carter@gmail.com", orders: 12, ltv: 480.0, tier: "Gold Member" },
                            { name: "James Whitfield", email: "j.whitfield@outlook.com", orders: 8, ltv: 310.0, tier: "Silver Member" },
                            { name: "Sofia Nguyen", email: "sofia.n@proton.me", orders: 4, ltv: 180.0, tier: "Active Client" },
                            { name: "Priya Sharma", email: "priya.sharma@gmail.com", orders: 15, ltv: 620.0, tier: "Gold Member" },
                            { name: "Sarah Connor", email: "sarah.connor@cyber.com", orders: 1, ltv: 45.0, tier: "New Client" },
                          ].map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF6F0]/40 transition-colors">
                              <td className="py-4 font-semibold text-[#1C1B19] flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#BCAE9E] flex items-center justify-center text-[10px] font-bold text-[#1C1B19]">{c.name.split(" ").map((n) => n[0]).join("")}</div>{c.name}</td>
                              <td className="py-4 text-[#8C8276] font-medium">{c.email}</td>
                              <td className="py-4">{c.orders} Orders</td>
                              <td className="py-4 font-bold text-[#1C1B19]">${c.ltv.toFixed(2)}</td>
                              <td className="py-4"><Pill tone="neutral">{c.tier}</Pill></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* ============================ ANALYTICS ============================ */}
              {activeSection === "Analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Conversion Rate", value: "2.8%", icon: TrendingUp, sub: "+0.3% vs last month" },
                      { label: "Avg. Order Value", value: "$71.40", icon: DollarSign, sub: "+$4.20 uplift" },
                      { label: "Bounce Rate", value: "38.2%", icon: Zap, sub: "-2.1% improvement" },
                      { label: "Return Rate", value: "3.1%", icon: Package, sub: "Within target" },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left"><div className="flex justify-between items-center mb-3"><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold">{s.label}</span><div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div><span className="text-2xl font-bold text-[#1C1B19]">{s.value}</span><span className="text-[10px] text-green-500 block mt-1 font-medium">{s.sub}</span></div>); })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <Card className="p-6 space-y-4">
                      <SectionHeader title="Conversion Funnel" subtitle="Client routing analysis" />
                      <div className="space-y-4 pt-2">
                        {[
                          { step: "Sessions", count: "12,450", pct: 100 },
                          { step: "Added to Bag", count: "3,120", pct: 25 },
                          { step: "Reached Checkout", count: "1,250", pct: 10 },
                          { step: "Purchased", count: `${totalOrdersCount}`, pct: 2.8 },
                        ].map((f, idx) => (<div key={idx} className="space-y-1"><div className="flex justify-between text-xs font-semibold text-[#1C1B19]/80 uppercase"><span>{f.step} ({f.count})</span><span>{f.pct}%</span></div><div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#D4C5B9] to-[#BCAE9E]" style={{ width: `${f.pct}%` }} /></div></div>))}
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <SectionHeader title="Device & Traffic Sources" subtitle="Platform session segments" />
                      <div className="space-y-5 pt-2">
                        {[
                          { channel: "Mobile Devices (iOS/Android)", pct: 68 },
                          { channel: "Desktop Web Browsers", pct: 24 },
                          { channel: "Instagram Social referrals", pct: 8 },
                        ].map((t, idx) => (<div key={idx} className="space-y-1.5"><div className="flex justify-between text-xs font-semibold text-[#1C1B19]/80 uppercase"><span>{t.channel}</span><span>{t.pct}%</span></div><div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-neutral-700" style={{ width: `${t.pct}%` }} /></div></div>))}
                      </div>
                    </Card>
                  </div>

                  {/* NEW: Top products by revenue with images */}
                  <Card className="p-6 text-left">
                    <SectionHeader title="Top Products by Revenue" subtitle="Highest grossing SKUs this cycle" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {productList.slice(0, 4).map((p, i) => (
                        <div key={p.id} className="bg-[#FAF6F0]/50 border border-[#EAE3DC] rounded-2xl p-4 flex flex-col items-center text-center">
                          <div className="relative w-20 h-20 mb-3"><Image src={p.image} alt={p.name} fill sizes="80px" className="object-contain" /></div>
                          <span className="text-[9px] uppercase tracking-widest text-[#BCAE9E] font-bold">#{i + 1}</span>
                          <h4 className="text-xs font-semibold text-[#1C1B19] mt-1 leading-tight">{p.name}</h4>
                          <span className="text-sm font-bold text-[#1C1B19] mt-2">${[4820, 3640, 2910, 2150][i].toLocaleString()}</span>
                          <div className="w-full h-1 bg-[#EAE3DC] rounded-full overflow-hidden mt-2"><div className="h-full bg-[#BCAE9E]" style={{ width: `${[100, 76, 60, 45][i]}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* NEW: Geographic distribution */}
                  <Card className="p-6 text-left">
                    <div className="flex items-center justify-between mb-6 border-b border-[#EAE3DC] pb-3">
                      <SectionHeader title="Top Regions" subtitle="Revenue by shipping geography" />
                      <Globe className="w-5 h-5 text-[#BCAE9E]" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { region: "United States", pct: 46, rev: "$8,420" },
                        { region: "United Kingdom", pct: 22, rev: "$4,010" },
                        { region: "Canada", pct: 14, rev: "$2,560" },
                        { region: "India", pct: 11, rev: "$2,010" },
                        { region: "Australia", pct: 7, rev: "$1,280" },
                      ].map((r) => (<div key={r.region} className="space-y-1.5"><div className="flex justify-between text-xs font-semibold text-[#1C1B19]/80 uppercase"><span>{r.region}</span><span className="text-[#8C8276]">{r.rev} • {r.pct}%</span></div><div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#D4C5B9] to-[#BCAE9E]" style={{ width: `${r.pct}%` }} /></div></div>))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ============================ DISCOUNTS ============================ */}
              {activeSection === "Discounts" && (
                <div className="space-y-6">
                  {/* Coupon showcase cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coupons.map((c, idx) => (
                      <motion.div key={c.code} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }} className={`relative overflow-hidden rounded-2xl border p-6 text-left ${c.status === "Active" ? "bg-gradient-to-br from-[#1C1B19] to-[#3A362F] border-[#3A362F]" : "bg-[#FAF6F0] border-[#EAE3DC]"}`}>
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#BCAE9E]/10" />
                        <div className="flex justify-between items-start relative">
                          <Percent className={`w-5 h-5 ${c.status === "Active" ? "text-[#D4C5B9]" : "text-[#8C8276]"}`} />
                          <Pill tone={c.status === "Active" ? "green" : "neutral"}>{c.status}</Pill>
                        </div>
                        <h3 className={`font-mono text-xl font-bold tracking-widest mt-4 ${c.status === "Active" ? "text-white" : "text-[#8C8276]"}`}>{c.code}</h3>
                        <p className={`text-sm font-semibold mt-1 ${c.status === "Active" ? "text-[#BCAE9E]" : "text-[#8C8276]"}`}>{c.discount}</p>
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                          <span className={`text-[10px] uppercase tracking-wider ${c.status === "Active" ? "text-[#8C8276]" : "text-[#8C8276]"}`}>{c.usages} redemptions</span>
                          <button onClick={() => handleToggleCoupon(c.code)} className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition-colors ${c.status === "Active" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#1C1B19] text-white hover:bg-[#2C2B29]"}`}>{c.status === "Active" ? "Deactivate" : "Activate"}</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                    <Card className="lg:col-span-8 p-6 space-y-6">
                      <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider border-b border-[#EAE3DC] pb-3">All Coupons</h3>
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-[#EAE3DC] text-[10px] uppercase tracking-wider text-[#8C8276] font-semibold"><th className="pb-3">Code</th><th className="pb-3">Discount</th><th className="pb-3">Usages</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
                          <tbody className="text-xs text-[#1C1B19]/80 divide-y divide-[#EAE3DC]/60 font-light">
                            {coupons.map((c) => (<tr key={c.code} className="hover:bg-[#FAF6F0]/40 transition-colors"><td className="py-4 font-bold text-[#1C1B19] uppercase">{c.code}</td><td className="py-4 text-[#BCAE9E] font-medium">{c.discount}</td><td className="py-4">{c.usages} checkouts</td><td className="py-4"><Pill tone={c.status === "Active" ? "green" : "neutral"}>{c.status}</Pill></td><td className="py-4"><button onClick={() => handleToggleCoupon(c.code)} className="text-[9px] font-bold text-[#8C8276] hover:text-[#1C1B19] uppercase tracking-wider border border-[#D4C5B9] hover:border-neutral-700 px-3 py-1 rounded-xl transition-colors">{c.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>))}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    <form onSubmit={handleAddCoupon} className="lg:col-span-4 bg-white border border-[#EAE3DC] rounded-3xl p-6 shadow-sm space-y-6">
                      <h3 className="font-serif text-base text-[#1C1B19] font-medium uppercase tracking-wider border-b border-[#EAE3DC] pb-3">Add Coupon</h3>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#8C8276] font-semibold">Code</label><input type="text" placeholder="e.g. EXTRA20" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} className="bg-[#FAF6F0] border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs text-[#1C1B19] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#8C8276] font-semibold">Discount rate</label><select value={newCouponDiscount} onChange={(e) => setNewCouponDiscount(e.target.value)} className="bg-[#FAF6F0] border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs text-[#1C1B19] focus:outline-none"><option>10% Off</option><option>15% Off</option><option>20% Off</option><option>25% Off</option></select></div>
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
                      <div className="text-center md:border-r md:border-[#EAE3DC]">
                        <span className="text-5xl font-serif font-bold text-[#1C1B19]">4.8</span>
                        <div className="flex justify-center gap-0.5 mt-2 text-amber-500">{[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-4 h-4 fill-amber-500" />))}</div>
                        <span className="text-[10px] text-[#8C8276] uppercase tracking-wider block mt-2">Based on 1,284 reviews</span>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[{ s: 5, pct: 82 }, { s: 4, pct: 12 }, { s: 3, pct: 4 }, { s: 2, pct: 1 }, { s: 1, pct: 1 }].map((r) => (<div key={r.s} className="flex items-center gap-3"><span className="text-[10px] font-bold text-[#8C8276] w-6">{r.s}★</span><div className="flex-1 h-2 bg-[#FAF6F0] rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: `${r.pct}%` }} /></div><span className="text-[10px] text-[#8C8276] w-8 text-right">{r.pct}%</span></div>))}
                      </div>
                    </div>
                  </Card>

                  {/* Filter tabs */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SectionHeader title="Customer Reviews" subtitle="Rating logs and content moderation tools" />
                    <div className="flex items-center gap-1 bg-[#FAF6F0] rounded-full p-1 border border-[#EAE3DC]">
                      {(["All", "5", "4", "Flagged"] as const).map((f) => (<button key={f} onClick={() => setReviewFilter(f)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${reviewFilter === f ? "bg-[#1C1B19] text-white shadow-sm" : "text-[#8C8276] hover:text-[#1C1B19]"}`}>{f === "5" || f === "4" ? `${f}★` : f}</button>))}
                    </div>
                  </div>

                  {/* Review cards with product images */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {[
                      { user: "Jane D.", rating: 5, date: "June 28, 2026", product: "Daily Moisturizer", img: IMG.moisturizer, comment: "Absolutely love the texture! Keeps my skin hydrated all day without feeling greasy.", flagged: false },
                      { user: "Oliver P.", rating: 5, date: "June 25, 2026", product: "Radiance Serum", img: IMG.serum, comment: "My skin tone is visibly more even. High quality active ingredients, worth every penny!", flagged: false },
                      { user: "Sophia K.", rating: 4, date: "June 22, 2026", product: "Niacinamide Toner", img: IMG.toner, comment: "No white cast at all! Only wish the bottle size was slightly larger.", flagged: false },
                      { user: "Anon.", rating: 2, date: "June 20, 2026", product: "Cream Cleanser", img: IMG.cream, comment: "Package arrived slightly damaged. Product itself is fine but shipping needs work.", flagged: true },
                    ].map((r, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left space-y-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="relative w-14 h-14 rounded-xl bg-[#FAF6F0] border border-[#EAE3DC] p-1 shrink-0 overflow-hidden"><Image src={r.img} alt={r.product} fill sizes="56px" className="object-contain" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div><span className="font-bold text-[#1C1B19] text-sm block">{r.user}</span><span className="text-[9px] text-[#8C8276] uppercase tracking-wider">{r.product}</span></div>
                              {r.flagged && <Pill tone="red">Flagged</Pill>}
                            </div>
                            <div className="flex items-center gap-2 mt-1"><span className="text-amber-500 text-xs">{"★".repeat(r.rating)}<span className="text-[#EAE3DC]">{"★".repeat(5 - r.rating)}</span></span><span className="text-[9px] text-[#8C8276]">{r.date}</span></div>
                          </div>
                        </div>
                        <p className="text-xs text-[#1C1B19]/80 leading-relaxed font-light">{r.comment}</p>
                        <div className="flex gap-2 pt-3 border-t border-[#EAE3DC]/60">
                          <button className="flex-1 py-2 rounded-xl bg-[#FAF6F0] text-[#1C1B19] text-[9px] font-bold uppercase tracking-wider border border-[#EAE3DC] hover:border-[#BCAE9E] transition-colors">Reply</button>
                          <button className="flex-1 py-2 rounded-xl bg-white text-[#8C8276] text-[9px] font-bold uppercase tracking-wider border border-[#EAE3DC] hover:text-red-600 hover:border-red-200 transition-colors">{r.flagged ? "Remove" : "Hide"}</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================ SHIPPING ============================ */}
              {activeSection === "Shipping" && (
                <div className="space-y-6">
                  {/* Shipping stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "In Transit", value: "18", icon: Truck },
                      { label: "Delivered (7d)", value: "142", icon: Package },
                      { label: "Avg. Delivery", value: "3.4d", icon: Clock },
                      { label: "On-Time Rate", value: "96%", icon: Shield },
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#1C1B19] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>

                  {/* Shipping profiles */}
                  <Card className="p-8 text-left space-y-6">
                    <SectionHeader title="Logistics & Shipping Profiles" subtitle="Configuration details for global fulfillment" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-[#EAE3DC] rounded-2xl p-6 bg-[#FAF6F0]/40 space-y-3"><Pill tone="green">Profile Active</Pill><h4 className="font-serif text-sm font-semibold text-[#1C1B19]">Standard Delivery</h4><p className="text-xs text-[#8C8276] leading-relaxed font-light">Free shipping on all orders sitewide. Delivered within 3–6 business days.</p></div>
                      <div className="border border-[#EAE3DC] rounded-2xl p-6 bg-[#FAF6F0]/40 space-y-3"><Pill tone="green">Profile Active</Pill><h4 className="font-serif text-sm font-semibold text-[#1C1B19]">Express Courier</h4><p className="text-xs text-[#8C8276] leading-relaxed font-light">Flat $15 express fee. Next-day dispatch. Delivered via priority air in 1–2 business days.</p></div>
                    </div>
                  </Card>

                  {/* NEW: Active shipments with product images */}
                  <Card className="p-6 text-left">
                    <SectionHeader title="Active Shipments" subtitle="Live parcels currently in transit" />
                    <div className="space-y-3 mt-6">
                      {[
                        { id: "AURA-632190", carrier: "DHL Express", eta: "Jul 8", progress: 65, img: IMG.moisturizer, city: "London, UK" },
                        { id: "AURA-771043", carrier: "FedEx Priority", eta: "Jul 7", progress: 82, img: IMG.serum, city: "Berlin, DE" },
                        { id: "AURA-559821", carrier: "UPS Ground", eta: "Jul 10", progress: 34, img: IMG.cream, city: "Chicago, US" },
                      ].map((s) => (
                        <div key={s.id} className="flex items-center gap-4 bg-[#FAF6F0]/50 border border-[#EAE3DC] rounded-2xl p-4">
                          <div className="relative w-12 h-12 rounded-xl bg-white border border-[#EAE3DC] p-1 shrink-0 overflow-hidden"><Image src={s.img} alt="parcel" fill sizes="48px" className="object-contain" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#1C1B19] uppercase">{s.id}</span><span className="text-[10px] text-[#8C8276]">ETA {s.eta}</span></div>
                            <span className="text-[10px] text-[#8C8276] flex items-center gap-1 mt-0.5"><Truck className="w-3 h-3" />{s.carrier} → {s.city}</span>
                            <div className="w-full h-1.5 bg-[#EAE3DC] rounded-full overflow-hidden mt-2"><div className="h-full bg-gradient-to-r from-[#D4C5B9] to-[#BCAE9E]" style={{ width: `${s.progress}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* NEW: Shipping zones */}
                  <Card className="p-6 text-left">
                    <SectionHeader title="Shipping Zones" subtitle="Rates and coverage by region" />
                    <div className="overflow-x-auto scrollbar-none mt-6">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-[#EAE3DC] text-[10px] uppercase tracking-wider text-[#8C8276] font-semibold"><th className="pb-3">Zone</th><th className="pb-3">Standard</th><th className="pb-3">Express</th><th className="pb-3">Coverage</th></tr></thead>
                        <tbody className="text-xs text-[#1C1B19]/80 divide-y divide-[#EAE3DC]/60 font-light">
                          {[
                            { zone: "Domestic (US)", std: "Free", exp: "$15", cov: "All 50 states" },
                            { zone: "Europe", std: "$8", exp: "$22", cov: "EU + UK" },
                            { zone: "Asia Pacific", std: "$12", exp: "$28", cov: "IN, SG, AU, JP" },
                            { zone: "Rest of World", std: "$18", exp: "$40", cov: "Selected countries" },
                          ].map((z) => (<tr key={z.zone} className="hover:bg-[#FAF6F0]/40 transition-colors"><td className="py-4 font-semibold text-[#1C1B19]">{z.zone}</td><td className="py-4">{z.std}</td><td className="py-4">{z.exp}</td><td className="py-4 text-[#8C8276]">{z.cov}</td></tr>))}
                        </tbody>
                      </table>
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
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#8C8276] font-semibold">Store Brand Name</label><input type="text" defaultValue="AURA Skincare" className="bg-[#FAF6F0] border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs text-[#1C1B19] focus:outline-none" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#8C8276] font-semibold">Store Currency</label><input type="text" defaultValue="USD ($)" disabled className="bg-[#FAF6F0] border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs text-[#8C8276] cursor-not-allowed" /></div>
                      <div className="flex flex-col space-y-1"><label className="text-[9px] uppercase tracking-wider text-[#8C8276] font-semibold">Support Contact Email</label><input type="email" defaultValue="support@auraskincare.com" className="bg-[#FAF6F0] border border-[#D4C5B9] rounded-xl px-4 py-3 text-xs text-[#1C1B19] focus:outline-none" /></div>
                      <button className="w-full bg-[#BCAE9E] text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md hover:opacity-90">Save configurations</button>
                    </div>
                  </Card>

                  {/* NEW: Team members with avatars */}
                  <Card className="p-8 space-y-6">
                    <SectionHeader title="Team Access" subtitle="Manage admin roles and permissions" />
                    <div className="space-y-3">
                      {[
                        { name: "Jane Doe", role: "Super Admin", tone: "green" },
                        { name: "Ravi Menon", role: "Fulfillment", tone: "blue" },
                        { name: "Lena Ortiz", role: "Support", tone: "neutral" },
                      ].map((m) => (
                        <div key={m.name} className="flex items-center justify-between bg-[#FAF6F0]/50 border border-[#EAE3DC] rounded-xl p-3">
                          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#BCAE9E] to-[#D4C5B9] flex items-center justify-center text-[10px] font-bold text-[#1C1B19]">{m.name.split(" ").map((n) => n[0]).join("")}</div><span className="text-xs font-semibold text-[#1C1B19]">{m.name}</span></div>
                          <Pill tone={m.tone as any}>{m.role}</Pill>
                        </div>
                      ))}
                      <button className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1C1B19] bg-white border border-[#EAE3DC] py-3 rounded-xl hover:border-[#BCAE9E] transition-colors"><Plus className="w-3.5 h-3.5" />Invite Member</button>
                    </div>
                  </Card>

                  {/* NEW: Notification prefs */}
                  <Card className="p-8 space-y-6 lg:col-span-2">
                    <SectionHeader title="Notifications" subtitle="Choose which alerts you receive" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: "New Orders", desc: "Email on every placed order", on: true, icon: ShoppingBag },
                        { label: "Low Stock", desc: "Alert when items run low", on: true, icon: Bell },
                        { label: "New Reviews", desc: "Notify on customer feedback", on: false, icon: MessageSquare },
                      ].map((n) => { const NI = n.icon; return (
                        <div key={n.label} className="bg-[#FAF6F0]/50 border border-[#EAE3DC] rounded-2xl p-5 flex flex-col gap-3">
                          <div className="flex items-center justify-between"><div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#BCAE9E] border border-[#EAE3DC]"><NI className="w-4 h-4" /></div><div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${n.on ? "bg-[#BCAE9E]" : "bg-[#EAE3DC]"}`}><div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${n.on ? "translate-x-4" : ""}`} /></div></div>
                          <div><h4 className="text-xs font-semibold text-[#1C1B19]">{n.label}</h4><p className="text-[10px] text-[#8C8276] mt-0.5">{n.desc}</p></div>
                        </div>
                      ); })}
                    </div>
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
                    ].map((s) => { const SI = s.icon; return (<div key={s.label} className="bg-white border border-[#EAE3DC] rounded-2xl p-5 text-left flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-widest text-[#8C8276] font-bold block">{s.label}</span><span className="text-2xl font-bold text-[#1C1B19] block mt-1">{s.value}</span></div><div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#BCAE9E]"><SI className="w-4 h-4" /></div></div>); })}
                  </div>

                  <Card className="p-8 text-left space-y-6">
                    <SectionHeader title="System Logs" subtitle="Security trails and transaction audit histories" />
                    <div className="relative pl-6 max-h-[500px] overflow-y-auto scrollbar-none">
                      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#EAE3DC]" />
                      {[
                        { user: "Jane Doe (Super Admin)", action: "Marked order AURA-632190 as Shipped", time: "10 mins ago", tone: "bg-blue-400" },
                        { user: "System Scheduler", action: "Cleared daily expired caches", time: "1 hour ago", tone: "bg-[#BCAE9E]" },
                        { user: "Ravi Menon (Fulfillment)", action: "Printed 12 shipping labels", time: "2 hours ago", tone: "bg-[#BCAE9E]" },
                        { user: "Jane Doe (Super Admin)", action: "Deactivated discount code SUMMER25", time: "4 hours ago", tone: "bg-amber-400" },
                        { user: "Security Monitor", action: "Blocked 2 failed login attempts", time: "6 hours ago", tone: "bg-red-400" },
                        { user: "Fulfillment Agent", action: "Dispatched batch standard orders", time: "12 hours ago", tone: "bg-[#BCAE9E]" },
                      ].map((log, idx) => (
                        <div key={idx} className="relative pb-6 last:pb-0">
                          <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${log.tone} ring-4 ring-white`} />
                          <div className="flex justify-between items-start gap-3">
                            <div className="text-left"><span className="font-semibold text-[#1C1B19] text-xs block">{log.action}</span><span className="text-[9px] text-[#8C8276] uppercase tracking-wider block mt-0.5">{log.user}</span></div>
                            <span className="text-[10px] text-[#8C8276] uppercase tracking-wider shrink-0">{log.time}</span>
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
      </main>
    </div>
  );
}