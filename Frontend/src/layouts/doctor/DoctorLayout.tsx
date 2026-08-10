// src/layouts/doctor/DoctorLayout.tsx
import React from "react";
import { DoctorSidebar } from "./DoctorSidebar";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-150">
      {/* Top Horizontal Navigation Bar */}
      <DoctorSidebar />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-6 py-5">
        {children}
      </main>
    </div>
  );
};
