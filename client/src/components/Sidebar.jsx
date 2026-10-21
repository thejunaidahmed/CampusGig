import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      to: '/',
      label: 'Explore Gigs',
      icon: (
        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      to: '/create',
      label: 'Post a Gig',
      icon: (
        <svg className="w-4 h-4 text-[#3fb950]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      to: '/my-gigs',
      label: 'My Gigs',
      icon: (
        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      to: '/my-applications',
      label: 'My Proposals',
      icon: (
        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      to: user ? `/profile/${user._id}` : '/login',
      label: 'Profile',
      icon: (
        <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#161b22] border-r border-[#30363d] z-50 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* GitHub-inspired Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              {/* GitHub Octicon mark style */}
              <div className="w-8 h-8 rounded-full bg-[#f0f6fc] flex items-center justify-center text-[#0d1117] font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-[#f0f6fc]">CampusGig</span>
                <span className="ml-1.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                  v1.0
                </span>
              </div>
            </div>

            {mobileOpen && (
              <button
                className="lg:hidden p-1 text-[#8b949e] hover:text-[#f0f6fc]"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
            )}
          </div>

          {/* User Profile Card with Dropdown */}
          <div className="mt-4 relative" ref={dropdownRef}>
            {user ? (
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between p-2 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] text-[#f0f6fc] font-semibold flex items-center justify-center text-xs">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-semibold text-[#f0f6fc] truncate">{user.name}</div>
                    <div className="text-[11px] text-[#8b949e] truncate">{user.major}</div>
                  </div>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-[#8b949e] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full gh-btn-primary !w-full !py-2 text-xs"
              >
                Sign in
              </button>
            )}

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161b22] rounded-md shadow-2xl border border-[#30363d] py-1 z-50 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#c9d1d9] hover:bg-[#21262d] transition-colors"
                >
                  View Profile
                </button>
                <div className="border-t border-[#30363d] mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#f85149] hover:bg-[#b62324]/20 flex items-center gap-2 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="mt-5">
            <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider px-2 mb-1.5">
              Workspace
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#21262d] text-[#f0f6fc] font-semibold border-l-2 border-[#58a6ff]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/50'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer info (Clean, no plus plan) */}
        <div className="pt-4 border-t border-[#30363d] flex items-center justify-between text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]"></span>
            Mongo Connected
          </span>
          <span className="font-mono text-[10px]">CampusGig</span>
        </div>
      </aside>
    </>
  );
}
