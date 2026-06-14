import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Link2,
  BarChart3,
  Home,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  Sparkles,
}
 from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { path: "/", label: "Home", icon: Home, authOnly: false },
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    authOnly: true,
  },
  { path: "/timetable", label: "Timetable", icon: Calendar, authOnly: true },
  { path: "/blockchain", label: "Blockchain", icon: Link2, authOnly: false },
  { path: "/analytics", label: "Analytics", icon: BarChart3, authOnly: true },

];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const doLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const navList = navItems.filter((item) => !item.authOnly || isAuthenticated);
  const userAvatar = user?.name?.charAt(0).toUpperCase() ?? "?";
  const userName = user?.name?.split(" ")[0] ?? "";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm font-display group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-shadow">
              N
            </div>
            <span className="font-display text-lg font-bold gradient-text hidden sm:block">
              NEXURA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navList.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    active
                      ? "text-nexura-cyan"
                      : "text-nexura-text-dim hover:text-nexura-text"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-nexura-cyan/10 rounded-lg border border-nexura-cyan/20"
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 28,
                      }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-white/10 mx-2" />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-2">
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-500">
                    <div className="w-7 h-7 rounded-full bg-nexura-dark flex items-center justify-center text-white text-xs font-bold">
                      {userAvatar}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-nexura-cyan">
                    {userName}
                  </span>
                  {user?.role && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Shield className="w-3 h-3" />
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </div>

                <button
                  onClick={doLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
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

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-nexura-text-dim hover:text-nexura-text hover:bg-white/5 transition-colors"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              style={{ top: "64px" }}
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="md:hidden glass-strong border-t border-white/5 relative z-50"
            >
              <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-nexura-cyan opacity-70" />
                <span className="text-xs text-nexura-text-dim tracking-widest uppercase">
                  Navigation
                </span>
              </div>

              {isAuthenticated && (
                <div className="mx-4 mb-3 p-3 rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 flex items-center gap-3">
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#0d0d1a] flex items-center justify-center text-white font-bold text-sm">
                      {userAvatar}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-nexura-text truncate">
                      {user?.name}
                    </span>
                    {user?.role && (
                      <span className="flex items-center gap-1 text-xs text-purple-300 mt-0.5">
                        <Shield className="w-3 h-3 shrink-0" />
                        {user.role.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="px-4 py-2 space-y-1">
                {navList.map(({ path, label, icon: Icon }, i) => {
                  const active = location.pathname === path;
                  return (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.15 }}
                    >
                      <Link
                        to={path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "text-nexura-cyan bg-nexura-cyan/10 border border-nexura-cyan/20"
                            : "text-nexura-text-dim hover:text-nexura-text hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            active ? "bg-nexura-cyan" : "bg-transparent"
                          }`}
                        />
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-4 pt-2 pb-4 mt-1 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={doLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-nexura-cyan bg-nexura-cyan/10 hover:bg-nexura-cyan/20 border border-nexura-cyan/30 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
        
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
