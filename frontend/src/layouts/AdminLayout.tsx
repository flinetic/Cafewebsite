import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Settings,
  Grid,
  Tag,
  ChevronDown,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Role-based navigation items
  const isAdmin = user?.role === 'admin';

  const allNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
    { path: '/admin/tables', icon: Grid, label: 'Tables', adminOnly: true },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', adminOnly: false },
    { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu', adminOnly: true },
    { path: '/admin/offers', icon: Tag, label: 'Offers', adminOnly: true },
    { path: '/admin/settings', icon: Settings, label: 'Settings', adminOnly: false },
  ];

  // Filter nav items based on role
  const navItems = isAdmin
    ? allNavItems
    : allNavItems.filter(item => !item.adminOnly);

  // Get role display text
  const getRoleDisplayText = (role: string | null | undefined) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'kitchen') return 'Kitchen Staff';
    return role || 'Staff';
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    if (role === 'admin') return 'bg-red-100 text-red-700';
    if (role === 'kitchen') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-gradient-to-b from-amber-600 to-orange-700 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-4 flex items-center justify-between border-b border-amber-500">
          {sidebarOpen && <h1 className="text-xl font-bold">BookAVibe</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-amber-500 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                  ? 'bg-amber-500 text-white'
                  : 'hover:bg-amber-500/50'
                } ${!sidebarOpen && 'justify-center'}`
              }
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-amber-500">
          {sidebarOpen ? (
            <div className="text-center text-amber-200 text-sm">
              © 2024 BookAVibe
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isAdmin ? 'Admin Panel' : 'Kitchen Panel'}
          </h2>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {/* Avatar */}
              {user?.profileImage && !user.profileImage.includes('ui-avatars.com') ? (
                <img
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.firstName?.charAt(0).toUpperCase()}{user?.lastName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{getRoleDisplayText(user?.role)}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                {/* User Info */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {user?.profileImage && !user.profileImage.includes('ui-avatars.com') ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                        {user?.firstName?.charAt(0).toUpperCase()}{user?.lastName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded ${getRoleBadgeColor(user?.role || undefined)}`}>
                    {getRoleDisplayText(user?.role)}
                  </span>
                </div>

                {/* Menu Options */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User size={18} />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

