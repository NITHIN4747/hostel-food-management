import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  Utensils, 
  CreditCard,
  FileBarChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { currentUser, userData, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-3" /> }
    ];

    if (userData?.role === 'student') {
      return [
        ...commonLinks,
        { href: '/attendance', label: 'Attendance', icon: <Clock className="w-5 h-5 mr-3" /> },
        { href: '/meals', label: 'Meal Plans', icon: <Utensils className="w-5 h-5 mr-3" /> },
        { href: '/leave-requests', label: 'Leave Requests', icon: <Calendar className="w-5 h-5 mr-3" /> },
        { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5 mr-3" /> }
      ];
    } else if (userData?.role === 'kitchen') {
      return [
        ...commonLinks,
        { href: '/meal-management', label: 'Meal Management', icon: <Utensils className="w-5 h-5 mr-3" /> },
        { href: '/attendance-tracking', label: 'Attendance', icon: <Clock className="w-5 h-5 mr-3" /> },
        { href: '/reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5 mr-3" /> }
      ];
    } else if (userData?.role === 'admin') {
      return [
        ...commonLinks,
        { href: '/users', label: 'User Management', icon: <User className="w-5 h-5 mr-3" /> },
        { href: '/finance', label: 'Financial Reports', icon: <CreditCard className="w-5 h-5 mr-3" /> },
        { href: '/reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5 mr-3" /> },
        { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> }
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Hostel Meals</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                >
                  <a 
                    className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      location === link.href 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            {currentUser && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="" alt={userData?.displayName || ''} />
                    <AvatarFallback>
                      {userData?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{userData?.displayName}</p>
                    <p className="text-xs text-gray-500">{userData?.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="flex w-full items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="lg:hidden font-semibold">Hostel Meals</div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="" alt={userData?.displayName || ''} />
                  <AvatarFallback>
                    {userData?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="flex w-full items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}