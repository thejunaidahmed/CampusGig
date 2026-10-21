import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Top Header (GitHub style) */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm tracking-tight text-[#f0f6fc]">CampusGig</span>
        </div>

        {user ? (
          <Link
            to={`/profile/${user._id}`}
            className="w-7 h-7 rounded-full bg-[#21262d] border border-[#30363d] text-[#f0f6fc] font-semibold flex items-center justify-center text-xs"
          >
            {user.name?.[0]}
          </Link>
        ) : (
          <Link
            to="/login"
            className="gh-btn-primary !py-1 !px-2.5 text-xs"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-200">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
