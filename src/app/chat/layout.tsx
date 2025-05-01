'use client';

import React, { useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import { Menu } from 'react-feather'; // Import Menu icon for better UI

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State for mobile sidebar (shown/hidden)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for sidebar collapsed state (expanded/collapsed)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes from ClientSidebar
  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-full">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-white/10 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 
          transform transition-all ease-in-out duration-300
          
          /* Mobile behavior */
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          
          /* Desktop behavior */
          lg:relative lg:translate-x-0
          ${isSidebarCollapsed ? 'lg:w-12' : 'lg:w-64'}
          
          h-full
        `}
      >
        <ClientSidebar onCollapsedChange={handleSidebarCollapsedChange} />
      </div>

      {/* Main content area - expands when sidebar is collapsed */}
      <main 
        className={`
          flex-1 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Mobile menu button */}
        <div className="lg:hidden p-4 bg-white dark:bg-[#1B1C1D]">
          <button
            className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar menu"
          >
            <Menu size={24} className="text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 px-0.5">
          {children}
        </div>
      </main>
    </div>
  );
}
