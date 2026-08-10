import React from "react";
import { PatientSidebar } from "./PatientSidebar";

type Props = {
  children: React.ReactNode;
};

export const PatientLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-50">
      {/* Top Horizontal Navigation Bar */}
      <PatientSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
