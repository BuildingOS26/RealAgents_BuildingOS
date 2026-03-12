import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BuildingView } from './components/BuildingView';
import { FileManagement } from './components/FileManagement';
import { AIAssistant } from './components/AIAssistant';
import { WorkOrders } from './components/WorkOrders';
import { Sidebar } from './components/Sidebar';
import { AuthProvider, useAuth, LoginPage, InvitePage } from './modules/auth';
import { SettingsPage } from './modules/settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'buildings' | 'files' | 'assistant' | 'settings' | 'workorders'>('buildings');

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} user={user} />
      
      <main className="flex-1 overflow-auto">
        {activeView === 'buildings' && <BuildingView />}
        {activeView === 'files' && <FileManagement />}
        {activeView === 'workorders' && <WorkOrders />}
        {activeView === 'assistant' && <AIAssistant />}
        {activeView === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}