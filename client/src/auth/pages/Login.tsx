import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { CustomInput, CustomButton } from '../../utilities';

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

  return (
    <div>
      <h1>Enterprise Admin Login</h1>
      <p>Enter your administrator credentials to access the management portal.</p>

      {error && (
        <div>
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email Address:</label>
          <br />
          <CustomInput
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin1@company.com"
          />
        </div>
        <br />
        <div>
          <label htmlFor="password">Password:</label>
          <br />
          <CustomInput
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <br />
        <CustomButton
          name={loading ? 'Authenticating...' : 'Sign In'}
          type="submit"
          disabled={loading}
        />
      </form>

      <hr />
      <div>
        <h3>Default Seed Admin Accounts (from seed_admins.sql):</h3>
        <ul>
          <li><strong>Superadmin:</strong> admin1@company.com / AdminPass123!</li>
          <li><strong>Operations Admin:</strong> admin2@company.com / AdminPass123!</li>
          <li><strong>Finance Admin:</strong> admin3@company.com / AdminPass123!</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;