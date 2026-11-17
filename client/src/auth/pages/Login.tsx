import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { CustomInput, CustomButton } from '../../utilities';

const DEMO_ACCOUNTS = [
  { role: 'Superadmin', email: 'admin1@company.com', pass: 'AdminPass123!', badge: 'bg-indigo-100 text-indigo-700' },
  { role: 'Operations Admin', email: 'admin2@company.com', pass: 'AdminPass123!', badge: 'bg-emerald-100 text-emerald-700' },
  { role: 'Finance Admin', email: 'admin3@company.com', pass: 'AdminPass123!', badge: 'bg-amber-100 text-amber-700' },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('admin1@company.com');
  const [password, setPassword] = useState<string>('AdminPass123!');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Authentication failed. Please verify credentials.';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">OmniERP</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Portal</h2>
        <p className="mt-2 text-sm text-slate-300">
          Enter your administrator credentials to access the management portal
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 sm:p-10">
        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <strong className="font-semibold block">Authentication Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <CustomInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin1@company.com"
              className="py-2.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <span className="text-xs text-indigo-600 hover:text-indigo-500 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <CustomInput
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="py-2.5"
            />
          </div>

          <div className="pt-2">
            <CustomButton
              name={loading ? 'Authenticating...' : 'Sign In to Portal'}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-medium shadow-md"
              icon={
                loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : undefined
              }
            />
          </div>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">
            Demo Accounts (Click to Fill)
          </p>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setCredentials(acc.email, acc.pass)}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 flex items-center gap-1.5">
                    <span>{acc.role}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${acc.badge}`}>
                      active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.email}</div>
                </div>
                <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
                  Select &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Back to Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
