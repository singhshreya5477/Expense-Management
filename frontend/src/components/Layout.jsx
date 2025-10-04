import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  CheckSquare, 
  Settings, 
  LogOut,
  Building2,
  User
} from 'lucide-react';

const Layout = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clearAuth();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { path: '/expenses', label: 'Expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee'] },
    { path: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['Admin', 'Manager'] },
    { path: '/approval-rules', label: 'Approval Rules', icon: Settings, roles: ['Admin'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
    { path: '/company', label: 'Company', icon: Building2, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Expense Manager</h1>
        </div>

        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors mb-2"
          >
            <User size={20} className="text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
