import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { CustomButton } from '../utilities';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: '/admin/items',
      label: 'Item Master',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      path: '/admin/customers',
      label: 'Customer Master',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      path: '/admin/sales',
      label: 'Sales Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      path: '/admin/invoices',
      label: 'Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
    },
    {
      path: '/admin/demo',
      label: 'UI Components',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            O
          </div>
          <span className="font-bold tracking-tight text-lg">OmniERP</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Section */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-lg block leading-tight">
                  OmniERP
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">Enterprise Suite</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Management Modules
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-800/60">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Public Site
              </p>
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Landing Page</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full bg-indigo-700/60 text-indigo-200 border border-indigo-500/40 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.full_name || 'Admin User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5 font-mono">
                  {user?.email || 'admin@company.com'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {user?.role || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Environment:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL Stored Procedures Connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-700">{user?.full_name || 'System Administrator'}</div>
              <div className="text-[11px] text-slate-400">{user?.email}</div>
            </div>
            <CustomButton
              name="Sign Out"
              size="sm"
              variant="outline"
              onClick={handleLogout}
            />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Modern Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>Enterprise Multi-National Architecture &copy; 2026. Powered by Inter Variable Font &amp; Tailwind CSS.</div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>PostgreSQL Backend</span>
              <span>&bull;</span>
              <span>Django REST API</span>
              <span>&bull;</span>
              <span>React 19 SPA</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
};
