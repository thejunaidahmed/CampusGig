import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    major: 'Computer Science',
    semester: 4,
    phone: '03123237006',
    bio: '',
    skills: 'React, Node.js, UI Design',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        major: form.major,
        semester: Number(form.semester),
        phone: form.phone,
        bio: form.bio,
        skills: skillsArray,
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto gh-box p-6 mt-6 space-y-4">
      {/* Brand Icon */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-full bg-[#f0f6fc] text-[#0d1117] flex items-center justify-center font-bold text-sm mx-auto mb-2">
          CG
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-[#f0f6fc] tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-[#8b949e]">
          Join Pakistan's campus marketplace with EasyPaisa & JazzCash integration.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Full Name</label>
          <input
            type="text"
            required
            className="gh-input text-xs"
            placeholder="e.g. ABC"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">University Email</label>
          <input
            type="email"
            required
            className="gh-input text-xs"
            placeholder="e.g. student@campus.edu.pk"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Password</label>
            <input
              type="password"
              required
              className="gh-input text-xs"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="gh-input text-xs"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Department</label>
            <input
              type="text"
              required
              className="gh-input text-xs"
              placeholder="e.g. CS / SE"
              value={form.major}
              onChange={(e) => update('major', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Semester</label>
            <select
              className="gh-input text-xs"
              value={form.semester}
              onChange={(e) => update('semester', e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">
            Pakistani Mobile Number (EasyPaisa / JazzCash)
          </label>
          <input
            type="tel"
            required
            className="gh-input text-xs font-mono"
            placeholder="03xxxxxxxxx"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">
            Skills (comma separated)
          </label>
          <input
            type="text"
            className="gh-input text-xs"
            placeholder="React, Figma, Python, Copywriting"
            value={form.skills}
            onChange={(e) => update('skills', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Short Bio</label>
          <textarea
            rows={2}
            className="gh-input text-xs"
            placeholder="Brief intro about yourself..."
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="gh-btn-primary !w-full !py-2 font-semibold text-xs mt-2"
        >
          {submitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="pt-3 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#58a6ff] hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
}
