import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  PlusCircle,
  List,
  User,
  LogOut,
  Database,
  Activity,
  Home,
} from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, isAdmin, isHOD } = useAuth();

  // Determine which menu to show based on user role
  const isAdminUser = isAdmin || isHOD;

  const userMenuItems: MenuItem[] = [
    { icon: <Home className="h-4 w-4" />, label: 'Home', path: '/' },
    { icon: <PlusCircle className="h-4 w-4" />, label: 'Submit Grievance', path: '/submit' },
    { icon: <List className="h-4 w-4" />, label: 'My Grievances', path: '/dashboard' },
    { icon: <User className="h-4 w-4" />, label: 'Profile', path: '/profile' },
  ];

  const adminMenuItems: MenuItem[] = isAdmin 
    ? [
        { icon: <Database className="h-4 w-4" />, label: 'All Grievances', path: '/admin' },
        { icon: <Activity className="h-4 w-4" />, label: 'AI Logs', path: '/admin/ai-logs' },
        { icon: <Home className="h-4 w-4" />, label: 'Manage System', path: '/admin/manage' },
        { icon: <User className="h-4 w-4" />, label: 'Profile', path: '/profile' },
      ]
    : [
        { icon: <Database className="h-4 w-4" />, label: 'All Grievances', path: '/admin' },
        { icon: <Activity className="h-4 w-4" />, label: 'AI Logs', path: '/admin/ai-logs' },
        { icon: <User className="h-4 w-4" />, label: 'Profile', path: '/profile' },
      ];

  // Use admin menu if user is admin or HOD, regardless of current page
  const menuItems = isAdminUser ? adminMenuItems : userMenuItems;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin Panel';
    if (isHOD) return `HOD - ${user?.department || 'Department'}`;
    if (user?.role === 'teacher') return 'Teacher Portal';
    return 'Student Portal';
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <h3 className="text-primary">AI Grievance</h3>
        <p className="text-xs text-muted-foreground mt-1">{getRoleLabel()}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-primary text-white'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="mb-3 px-2">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm truncate">{user?.name || 'User'}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
