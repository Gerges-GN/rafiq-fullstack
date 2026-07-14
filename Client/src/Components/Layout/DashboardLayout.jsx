import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

/**
 * Page shell combining the Sidebar and Topbar around page content.
 * Every page (Dashboard, Guides, Places, Users) renders itself inside this.
 *
 * @param {Object} props
 * @param {Object} props.sidebarProps - Passed straight through to <Sidebar />.
 * @param {Object} props.topbarProps - Passed straight through to <Topbar />.
 * @param {React.ReactNode} props.children
 */
export default function DashboardLayout({
  sidebarProps = {},
  topbarProps = {},
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-surface">
      <div
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar
        {...sidebarProps}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar {...topbarProps} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
