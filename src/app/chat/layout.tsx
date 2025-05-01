'use client';

import React from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      {/* Client-side sidebar with chat functionality */}
      <ClientSidebar />
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
