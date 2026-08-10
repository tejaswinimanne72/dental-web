// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationPanel } from '../components/navigation/NotificationPanel';
import { AgentAlertPanel } from '../components/navigation/AgentAlertPanel';
import { AdminSidebar } from './admin/AdminSidebar';

export type AIAssistantContext =
  | 'appointments'
  | 'inventory'
  | 'revenue'
  | 'cases'
  | 'general';

export const MainLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAgentAlerts, setShowAgentAlerts] = useState(false);

  const openAIAssistant = (_context: AIAssistantContext = 'general') => {};

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-150">
      {/* Top Horizontal Header Bar */}
      <AdminSidebar />

      {/* Main content column */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <Outlet
          context={{
            openAIAssistant,
          }}
        />
      </main>

      {/* Panels */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <AgentAlertPanel
        isOpen={showAgentAlerts}
        onClose={() => setShowAgentAlerts(false)}
        openAIAssistant={openAIAssistant}
      />
    </div>
  );
};
