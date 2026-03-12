import { Building2, Building, FolderOpen, Settings, LogOut, User, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  activeView: 'buildings' | 'files' | 'documents' | 'ai' | 'settings';
  onNavigate: (view: 'buildings' | 'files' | 'documents' | 'ai' | 'settings') => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { profile, logout } = useAuth();
  
  const navItems = [
    { id: 'buildings' as const, icon: Building, label: 'Buildings' },
    { id: 'files' as const, icon: FolderOpen, label: 'File Management' },
    { id: 'documents' as const, icon: FileText, label: 'Documents' },
    { id: 'ai' as const, icon: MessageSquare, label: 'AI Assistant' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">BuildingOS</h1>
            <p className="text-sm text-gray-500">AI Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.name || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.role || ''}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3 truncate">
          {profile?.company || ''}
        </p>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
