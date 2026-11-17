import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router';

const About: React.FC = () => {
  const pillars = [
    {
      title: 'ACID Stored Procedures',
      desc: 'All critical financial calculations, stock updates, and sales validations execute directly inside PostgreSQL transactional stored procedures for guaranteed atomicity.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      title: 'Django REST Engine',
      desc: 'High-throughput Python middleware orchestrating JWT authentication, permission checks, structured error handling, and procedure execution.',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Modern React 19 & Tailwind',
      desc: 'Built with React 19, TypeScript, and Tailwind CSS v4, styled with the crisp Inter Variable Font for typographic legibility across desktop and mobile screens.',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      title: 'Enterprise Multi-Role Security',
      desc: 'Role-based access control (Superadmin, Operations Admin, Finance Admin) with dedicated audit logging and granular operational permissions.',
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-900/60 border border-indigo-700/60 px-3 py-1 rounded-full">
              Engineered For Reliability
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
              About OmniERP Platform
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We engineer dependable, enterprise-scale resource planning software combining the ironclad consistency of PostgreSQL stored procedures with reactive modern front-ends.
            </p>
          </div>
        </section>

        {/* Core Architecture */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Pillars of Our Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Designed from the database up to avoid concurrency conflicts and financial drift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Callout */}
        <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                  Full Stack Synergy
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                  Ready to explore the management portal?
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  Access live Item Masters, Customer directories, Sales Order dispatch, and tax invoice generation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/auth/login"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  Sign In Now &rarr;
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
                >
                  Contact Engineering
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        OmniERP Suite &copy; 2026. High-performance enterprise operations.
      </footer>
    </div>
  );
};

export default About;

