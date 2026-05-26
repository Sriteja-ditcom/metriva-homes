import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Building2, Heart, LogOut, Menu, Plus, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-brand-500" />
          <span className="font-bold text-lg text-foreground">
            Metriva <span className="text-brand-500">Homes</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/properties?listingType=BUY"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Buy
          </Link>
          <Link
            to="/properties?listingType=RENT"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Rent
          </Link>
          <Link
            to="/properties?listingType=COMMERCIAL"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Commercial
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/properties')}
            className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard/saved" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/dashboard" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Bell className="h-5 w-5" />
              </Link>

              {/* Post Property CTA */}
              <Link
                to="/post-property"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Post Property
              </Link>

              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                      {user?.firstName?.[0]}
                    </div>
                  )}
                </button>
                <div className={cn(
                  'absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background shadow-lg',
                  'opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150',
                )}>
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="px-3 pb-2 text-xs text-muted-foreground">{user?.email}</p>
                    <hr className="border-border mb-2" />
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-brand-500 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border p-4 bg-background space-y-1"
        >
          <Link to="/properties?listingType=BUY" className="block px-4 py-2.5 rounded-lg text-sm hover:bg-accent">Buy</Link>
          <Link to="/properties?listingType=RENT" className="block px-4 py-2.5 rounded-lg text-sm hover:bg-accent">Rent</Link>
          <Link to="/properties?listingType=COMMERCIAL" className="block px-4 py-2.5 rounded-lg text-sm hover:bg-accent">Commercial</Link>
          <Link to="/post-property" className="block px-4 py-2.5 rounded-lg text-sm bg-brand-500 text-white mt-2">+ Post Property</Link>
        </motion.div>
      )}
    </header>
  );
}
