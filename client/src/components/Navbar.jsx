import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        { to: '/', label: 'Browse' },
        { to: '/create', label: 'Post Gig' },
        { to: '/my-gigs', label: 'My Gigs' },
        { to: '/my-applications', label: 'My Applications' },
        { to: `/profile/${user._id}`, label: 'Profile' },
      ]
    : [{ to: '/', label: 'Browse' }, { to: '/login', label: 'Login' }];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 grid place-items-center">🤝</span>
          CampusGig
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost ml-2">
              Logout
            </button>
          )}
        </nav>

        <button className="md:hidden btn-ghost" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-800 px-4 py-3 flex flex-col gap-1 bg-slate-950">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({isActive}) =>
                `px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="text-left btn-ghost">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
