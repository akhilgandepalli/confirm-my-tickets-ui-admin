import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Film, Building2, Calendar, Ticket, Users, LogOut, Sun, Moon, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/movies', icon: Film, label: 'Movies' },
  { to: '/theaters', icon: Building2, label: 'Theaters' },
  { to: '/shows', icon: Calendar, label: 'Shows' },
  { to: '/bookings', icon: Ticket, label: 'Bookings' },
  { to: '/users', icon: Users, label: 'Users' },
];

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent leading-tight">
          Confirm My Tickets
        </h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel • {admin?.name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">{sidebar}</div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
