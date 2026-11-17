import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Admin Portal', path: '/admin/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 font-sans">
              OmniERP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <span>Dashboard ({user.role})</span>
                <span className="text-xs">&rarr;</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-xs"
              >
                Enter Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
