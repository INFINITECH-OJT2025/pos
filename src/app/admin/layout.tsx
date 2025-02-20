"use client";

import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Ensures only authorized roles can access
import { useState } from "react";

export default function AdminLayout({
  children,
  role = "admin", // ✅ Dynamic Role Support
}: {
  children: React.ReactNode;
  role?: "admin" | "manager" | "cashier";
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ProtectedRoute allowedRoles={[role]}>
      <div className="flex h-screen">
        {/* ✅ Sidebar with role-based navigation */}
        <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} role={role} />

        {/* ✅ Main Page Content */}
        <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
