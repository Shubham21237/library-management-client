import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  BookOpen,
  LayoutDashboard,
  ShieldAlert,
  QrCode,
  LogOut,
  Flame,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({ onOpenScanner }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav">
      <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Library<span className="text-indigo-400">IQ</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {isAdmin ? 'Librarian' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart Library Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <Link
              to="/catalog"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive('/catalog')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Book Catalog
            </Link>

            {user && (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/dashboard') || isActive('/admin')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAdmin ? <ShieldAlert className="w-4 h-4 text-amber-400" /> : <LayoutDashboard className="w-4 h-4" />}
                {isAdmin ? 'Admin Console' : 'My Dashboard'}
              </Link>
            )}

            {/* Webcam QR Scanner Trigger Button */}
            {user && (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Scan QR Code
              </button>
            )}
          </div>

          {/* User Controls & Profile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Reading Streak Badge */}
                {!isAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{user.readingStreak?.currentStreak || 0} Month Streak</span>
                  </div>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080c14] px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            Book Catalog
          </Link>
          {user && (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
            >
              {isAdmin ? 'Admin Console' : 'My Dashboard'}
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-500/10"
            >
              Logout ({user.name})
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-slate-800 text-slate-200 font-bold text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
