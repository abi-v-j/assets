import React from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Contact from './Contact';
import { useAuth } from '../../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Item Master Catalog',
      desc: 'Centralized SKU database with automated units of measurement (UOM), active lifecycle tracking, and standard unit prices.',
      badge: 'Inventory',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      link: '/admin/items',
    },
    {
      title: 'Customer Directory',
      desc: 'Comprehensive client organization profiles with tax billing addresses, primary contact channels, and transaction history.',
      badge: 'Clients',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: '/admin/customers',
    },
    {
      title: 'Multi-Line Sales Orders',
      desc: 'Dynamic order creation supporting multiple items per order, automated total price calculation, and status workflows.',
      badge: 'Transactions',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/admin/sales',
    },
    {
      title: 'Automated Tax Invoicing',
      desc: 'Seamless conversion from confirmed orders into legally compliant invoices with customizable regional tax rates and payment logs.',
      badge: 'Billing',
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
      link: '/admin/invoices',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Enterprise ERP &amp; Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
              Enterprise Operations.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                Streamlined &amp; Scalable.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Integrate item catalogs, client accounts, multi-line sales order dispatch, and automated tax invoicing under one unified, responsive workspace powered by Inter typography and Tailwind CSS.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to={user ? '/admin/dashboard' : '/auth/login'}
                className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {user ? 'Enter Admin Dashboard &rarr;' : 'Access Management Portal &rarr;'}
              </Link>
              <Link
                to="/admin/demo"
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-xs transition-colors"
              >
                Explore UI Components
              </Link>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        </section>

        {/* Stats Banner */}
        <section className="bg-slate-900 border-t border-slate-800 text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">ACID Stored Procedures</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">4 Modules</div>
              <div className="text-xs text-slate-400 mt-1">Integrated Enterprise Core</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">&lt; 50ms</div>
              <div className="text-xs text-slate-400 mt-1">Procedure Execution Speed</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-violet-400 font-mono">Inter</div>
              <div className="text-xs text-slate-400 mt-1">Variable Font System</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Core Capabilities
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Robust Multi-Tenant Enterprise Workflows
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Each module connects directly with PostgreSQL schema and stored procedure transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={feat.link}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Manage {feat.badge}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Embedded Contact Section */}
        <section className="bg-slate-100/60 border-t border-slate-200">
          <Contact embedded />
        </section>
      </div>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">OmniERP</span>
            <span>&bull;</span>
            <span>Enterprise Management System &copy; 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
            <Link to="/auth/login" className="hover:text-indigo-600 transition-colors font-semibold text-indigo-600">Admin Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
