import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  CalendarCheck, 
  Clock, 
  FileText, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: React.ReactElement;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, icon, children, isActive, onClick }: NavLinkProps) => {
  return (
    <Link href={to}>
      <a
        className={`flex items-center px-4 py-3 text-sm rounded-md ${
          isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={onClick}
      >
        <span className="mr-3">{icon}</span>
        {children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser || !userData) return null;

  const isAdmin = userData.role === 'admin';

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
          <h1 className="text-xl font-bold text-primary">Hostel Meal System</h1>
        </div>
        
        <div className="px-3 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="text-gray-600" size={20} />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{userData.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{userData.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          <NavLink 
            to="/dashboard" 
            icon={<Home size={18} />} 
            isActive={location === '/dashboard'}
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/meal-preferences" 
            icon={<CalendarCheck size={18} />} 
            isActive={location === '/meal-preferences'}
          >
            Meal Preferences
          </NavLink>
          
          <NavLink 
            to="/attendance" 
            icon={<Clock size={18} />} 
            isActive={location === '/attendance'}
          >
            Attendance
          </NavLink>
          
          <NavLink 
            to="/leave-requests" 
            icon={<FileText size={18} />} 
            isActive={location === '/leave-requests'}
          >
            Leave Requests
          </NavLink>
          
          {isAdmin && (
            <NavLink 
              to="/admin" 
              icon={<Settings size={18} />} 
              isActive={location.startsWith('/admin')}
            >
              Admin Panel
            </NavLink>
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}