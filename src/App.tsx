import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/landing/LandingPage';
import { Login } from './components/auth/Login';
import { AdminLogin } from './components/auth/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ConsultationRequests } from './components/admin/ConsultationRequests';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Clients } from './components/clients/Clients';
import { Tasks } from './components/tasks/Tasks';
import { Calendar } from './components/calendar/Calendar';
import { Reports } from './components/reports/Reports';
import { Settings } from './components/settings/Settings';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'advisor' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure loading doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await checkUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            await checkUserRole(session.user.id);
          } else {
            setUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
          setUserRole(null);
        } finally {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        // If no advisor record exists, this might be the first user
        // We'll handle this in the UI by showing appropriate options
        setUserRole(null);
      } else {
        setUserRole(data?.role || 'advisor');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleAdminLogin = (user?: any) => {
    if (user) {
      // Real Supabase user
      setUser(user);
      setUserRole('admin');
    } else {
      // Test admin fallback
      const mockUser = {
        id: 'test-admin-user',
        email: 'admin@test.com'
      };
      setUser(mockUser);
      setUserRole('admin');
    }
    setShowLanding(false);
    setShowAdminLogin(false);
    setShowUserLogin(false);
  };

  const handleUserLogin = (user?: any) => {
    if (user) {
      // Real Supabase user
      setUser(user);
      setUserRole('advisor');
    } else {
      // Test user fallback
      const mockUser = {
        id: 'test-user',
        email: 'user@test.com'
      };
      setUser(mockUser);
      setUserRole('advisor');
    }
    setShowLanding(false);
    setShowAdminLogin(false);
    setShowUserLogin(false);
  };

  const handleBackToUserLogin = () => {
    setShowAdminLogin(false);
    setShowUserLogin(true);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setShowAdminLogin(false);
    setShowUserLogin(false);
  };

  const handleShowUserLogin = () => {
    setShowLanding(false);
    setShowUserLogin(true);
  };

  const handleShowAdminLogin = () => {
    setShowLanding(false);
    setShowAdminLogin(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page by default if no user is logged in
  if (!user) {
    if (showAdminLogin) {
      return (
        <AdminLogin 
          onAdminLogin={handleAdminLogin}
          onBackToUserLogin={handleBackToUserLogin}
        />
      );
    }
    if (showUserLogin) {
      return (
        <Login 
          onLogin={handleUserLogin}
          onShowAdminLogin={handleShowAdminLogin}
          onBackToLanding={handleBackToLanding}
        />
      );
    }
    // Default to landing page
    return (
      <LandingPage 
        onShowLogin={handleShowUserLogin}
        onShowAdminLogin={handleShowAdminLogin}
      />
    );
  }

  // Show admin dashboard if user is admin
  if (user && userRole === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            userRole={userRole}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />
            <main className="flex-1 overflow-y-auto p-6">
              {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
              {activeTab === 'clients' && <Clients />}
              {activeTab === 'calendar' && <Calendar />}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'settings' && <Settings />}
              {activeTab === 'admin' && <AdminDashboard />}
              {activeTab === 'consultations' && <ConsultationRequests />}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Show regular dashboard if user is advisor or has any role
  if (user && (userRole === 'advisor' || userRole)) {
    // Continue to main app
  } else if (user) {
    // If user exists but no role, show landing page
    return (
      <LandingPage 
        onShowLogin={handleShowUserLogin}
        onShowAdminLogin={handleShowAdminLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userRole={userRole}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'clients' && <Clients />}
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'tasks' && <Tasks />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
