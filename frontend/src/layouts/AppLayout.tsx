import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen p-4 lg:ml-64 lg:p-8">
        <button
          className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
}
