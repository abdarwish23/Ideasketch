'use client';

import React, { useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Client-side sidebar with chat functionality */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 z-40 transform transition-transform ease-in-out duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:flex h-full`}
      >
        <ClientSidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Button to toggle sidebar on small screens */}
        <button
          className="lg:hidden p-4 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* You can replace this with an icon */}
          Menu
        </button>
        {children}
      </main>
    </div>
  );
}
