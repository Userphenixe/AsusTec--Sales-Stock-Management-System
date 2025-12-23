import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      <TopBar onLogout={onLogout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} mt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
}