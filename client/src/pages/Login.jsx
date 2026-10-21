import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const { user, loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // Fetch demo users for convenience
    api
      .get('/users')
      .then((res) => setDemoUsers(res.data.slice(0, 5)))
      .catch(() => {});
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithCredentials(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto gh-box p-6 mt-10 space-y-4">
      {/* Brand Icon */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-full bg-[#f0f6fc] text-[#0d1117] flex items-center justify-center font-bold text-sm mx-auto mb-2">
          CG
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-[#f0f6fc] tracking-tight">
          Sign In to CampusGig
        </h1>
        <p className="text-xs text-[#8b949e]">
          Enter your university credentials to manage gigs & payments.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
          {error}
        </div>
      )}

      {/* Real Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Email Address</label>
          <input
            type="email"
            required
            className="gh-input text-xs"
            placeholder="student@campus.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[#c9d1d9]">Password</label>
            <span className="text-[11px] text-[#8b949e]">Default: password123</span>
          </div>
          <input
            type="password"
            required
            className="gh-input text-xs"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="gh-btn-primary !w-full !py-2 font-semibold text-xs mt-2"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo helper accordion */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDemo(!showDemo)}
          className="w-full text-center text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors py-1 flex items-center justify-center gap-1"
        >
          <span>{showDemo ? 'Hide Demo Logins' : '💡 Need a test account? Click to auto-fill'}</span>
          <span className="text-[10px]">{showDemo ? '▲' : '▼'}</span>
        </button>

        {showDemo && (
          <div className="mt-2 p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-[10px] font-semibold text-[#8b949e] uppercase">
              Click any seeded account:
            </div>
            {demoUsers.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => handleFillDemo(u.email)}
                className="w-full text-left p-1.5 rounded hover:bg-[#21262d] text-xs text-[#c9d1d9] flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-[#f0f6fc]">{u.name}</span>
                <span className="text-[#8b949e] font-mono text-[11px]">{u.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Register Link */}
      <div className="pt-3 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#58a6ff] hover:underline font-semibold">
          Create Account
        </Link>
      </div>
    </div>
  );
}
