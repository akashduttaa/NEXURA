import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, Link2, BarChart3, Home, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/blockchain', label: 'Blockchain', icon: Link2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm font-display group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-shadow">
              N
            </div>
            <span className="font-display text-lg font-bold gradient-text hidden sm:block">NEXURA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              // Hide some links if not authenticated
              if (!isAuthenticated && path !== '/' && path !== '/blockchain') return null;
              
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${active ? 'text-nexura-cyan' : 'text-nexura-text-dim hover:text-nexura-text'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-nexura-cyan/10 rounded-lg border border-nexura-cyan/20"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-2">
                <span className="text-sm font-medium text-nexura-cyan flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2 ml-2 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:border-nexura-cyan/50"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-nexura-text-dim hover:text-nexura-text p-2">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                if (!isAuthenticated && path !== '/' && path !== '/blockchain') return null;
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'text-nexura-cyan bg-nexura-cyan/10' : 'text-nexura-text-dim hover:text-nexura-text hover:bg-white/5'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                );
              })}

              <div className="h-px bg-white/10 my-2" />

              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-nexura-cyan">
                    <User className="w-4 h-4" />
                    <span className="truncate">{user?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-nexura-cyan/10 uppercase font-semibold border border-nexura-cyan/20 ml-auto">{user?.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:border-nexura-cyan/50"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
