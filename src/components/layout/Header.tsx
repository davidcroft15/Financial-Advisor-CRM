import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SearchService } from '../../lib/searchService';
import { NotificationsService, Notification } from '../../lib/notificationsService';

interface SearchResult {
  type: 'client' | 'appointment' | 'task' | 'consultation';
  id: string;
  title: string;
  description: string;
  date?: string;
  status?: string;
}

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onLogout?: () => void;
  user?: any;
  searchResults?: SearchResult[];
  showSearchResults?: boolean;
  onSearchResultClick?: (result: SearchResult) => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery, onLogout, user, searchResults = [], showSearchResults = false, onSearchResultClick, onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Load notifications when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoadingNotifications(true);
    try {
      const fetchedNotifications = await NotificationsService.getNotifications(user.id);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setShowNotifications(false);
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl.replace('/', ''));
    }
  };

  const handleSettingsClick = () => {
    setShowAccountMenu(false);
    if (onNavigate) {
      onNavigate('settings');
    }
  };
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients, tasks, or documents..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-80 pl-10"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 px-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-start space-x-3"
                    onClick={() => onSearchResultClick?.(result)}
                  >
                    <div className="text-lg">{SearchService.getTypeIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      <div className="text-xs text-gray-500 truncate">{result.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${SearchService.getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                        {result.status && (
                          <span className="text-xs text-gray-400">{result.status}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications Button */}
        <div className="relative" ref={notificationsRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Notifications</CardTitle>
                    <button 
                      onClick={loadNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={loadingNotifications}
                    >
                      {loadingNotifications ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                          notification.isRead ? 'bg-gray-50' : 'bg-white'
                        } ${NotificationsService.getPriorityColor(notification.priority)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-lg">
                            {NotificationsService.getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {NotificationsService.formatTimestamp(notification.timestamp)}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Account Menu Button */}
        <div className="relative" ref={accountRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
          
          {/* Account Dropdown */}
          {showAccountMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white border rounded-lg shadow-lg z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b">
                  <div className="text-sm font-medium">{user?.email || 'Admin User'}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <button 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  onClick={handleSettingsClick}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                {onLogout && (
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
