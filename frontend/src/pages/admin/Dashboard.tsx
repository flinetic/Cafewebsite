import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Coffee, 
  LogOut, 
  User, 
  ChefHat, 
  Shield, 
  Users,
  Bell,
  Settings,
  Calendar,
  Clock,
  TrendingUp,
  UtensilsCrossed
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="w-6 h-6" />;
      case 'chef':
        return <ChefHat className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'chef':
        return 'from-orange-500 to-amber-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'chef':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const quickActions = [
    { icon: Users, label: 'Team', desc: 'View staff members', color: 'bg-purple-500' },
    { icon: Calendar, label: 'Schedule', desc: 'View shifts', color: 'bg-green-500' },
    { icon: Bell, label: 'Notifications', desc: 'Check updates', color: 'bg-yellow-500' },
    { icon: Settings, label: 'Settings', desc: 'Manage profile', color: 'bg-gray-500' },
  ];

  const stats = [
    { label: 'Active Staff', value: '12', icon: Users, trend: '+2 this week' },
    { label: 'Today\'s Orders', value: '156', icon: UtensilsCrossed, trend: '+23% vs yesterday' },
    { label: 'Avg. Service Time', value: '4.2m', icon: Clock, trend: '-0.5m improved' },
    { label: 'Revenue', value: '₹45.2K', icon: TrendingUp, trend: '+12% this month' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">BookAVibe</h1>
                <p className="text-xs text-gray-500">Cafe Management</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-white`}>
                  {getRoleIcon()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.employeeId}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute left-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                {user?.role?.toUpperCase()}
              </span>
              {!user?.isEmailVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  Email Not Verified
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-purple-200 max-w-xl">
              {user?.role === 'admin' && "You have full access to manage the cafe operations, staff, and settings."}
              {user?.role === 'chef' && "Ready to create culinary masterpieces? Check today's orders and menu."}
              {user?.role === 'staff' && "Great to see you! Check your schedule and pending tasks for today."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions & Profile Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">{action.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-white`}>
                  {getRoleIcon()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Employee ID</span>
                  <span className="text-sm font-medium text-gray-800">{user?.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${getRoleBadgeColor()}`}>
                    {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email Verified</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${user?.isEmailVerified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                    {user?.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-2.5 border border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Role-specific Content */}
        <div className="mt-8">
          {user?.role === 'admin' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">Admin Panel</h3>
              </div>
              <p className="text-gray-600 mb-4">
                As an admin, you can manage staff accounts, view reports, and configure cafe settings.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Manage Staff
                </button>
                <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  View Reports
                </button>
              </div>
            </div>
          )}

          {user?.role === 'chef' && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <ChefHat className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">Kitchen Dashboard</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View incoming orders, manage menu items, and track inventory for the kitchen.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  View Orders
                </button>
                <button className="px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
                  Manage Menu
                </button>
              </div>
            </div>
          )}

          {user?.role === 'staff' && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Staff Hub</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Check your schedule, view assigned tasks, and manage customer orders.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  My Schedule
                </button>
                <button className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                  View Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 BookAVibe Cafe Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
