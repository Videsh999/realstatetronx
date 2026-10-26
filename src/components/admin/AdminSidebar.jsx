"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  Building2,
  ChevronRight,
  X,
  Clock,
  Bell,
  Globe,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function DemoUserBlock() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/demo-login", { method: "DELETE" });
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/5 rounded-2xl">
      <div className="overflow-hidden">
        <p className="text-sm font-bold truncate">Administrator</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">
          Demo Access
        </p>
      </div>
      <button
        onClick={logout}
        disabled={loggingOut}
        className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition"
        title="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}



export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Projects", icon: Building2, href: "/admin/projects" },
    { name: "Plots", icon: Map, href: "/admin/plots" },
    { name: "Reserved Plots", icon: Clock, href: "/admin/reserved" },
    { name: "Enquiries", icon: MessageSquare, href: "/admin/enquiries" },
    { name: "Notifications", icon: Bell, href: "/admin/notifications" },
    { name: "Site Info", icon: Globe, href: "/admin/site-info" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-8 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-playfair font-bold tracking-wider">
          TRONX{" "}
          <span className="text-xs block text-white/60 font-inter font-normal mt-1 tracking-widest uppercase">
            Admin Portal
          </span>
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-white text-[#1B4332] shadow-lg"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={
                    isActive
                      ? "text-[#1B4332]"
                      : "text-white/40 group-hover:text-white"
                  }
                />
                <span className="font-medium text-sm md:text-base">
                  {item.name}
                </span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        {clerkEnabled ? <ClerkUserLazy /> : <DemoUserBlock />}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-[#1B4332] text-white flex-col fixed left-0 top-0 bottom-0 z-50">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#1B4332] text-white z-50 lg:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
