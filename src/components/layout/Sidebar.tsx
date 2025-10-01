import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  Settings,
  BarChart3,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">Financial CRM</h1>
        <p className="text-sm text-muted-foreground">Independent Advisor</p>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
