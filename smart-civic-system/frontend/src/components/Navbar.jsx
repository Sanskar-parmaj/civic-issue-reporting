import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/issues',  label: 'Issues' },
    { to: '/map',     label: 'Map' },
    ...(user ? [{ to: '/report', label: 'Report' }] : []),
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin() ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-violet-900/30"
      style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              🏙️
            </div>
            <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CivicSmart
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-400">
                  👤 {user.name}
                  {isAdmin() && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300">Admin</span>}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-400 hover:text-white py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4 flex flex-col gap-1"
          >
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${isActive(link.to)
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-slate-400 hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
            {user
              ? <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-secondary text-sm mt-2">Logout</button>
              : <><Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm mt-2 text-center">Login</Link>
                 <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm mt-2 text-center">Register</Link></>
            }
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
