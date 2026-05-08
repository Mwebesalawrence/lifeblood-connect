'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Droplets, LogIn, User, UserPlus, LayoutDashboard,
  MapPin, CalendarDays, Award, BookOpen, Shield, Bell,
  LogOut, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

export default function Navbar() {
  const {
    currentUser, currentView, setCurrentView, sidebarOpen,
    toggleSidebar, logout, setAuthDialogOpen, setAuthDialogMode,
    unreadCount,
  } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: any) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Droplets className="h-5 w-5 text-white" />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Life<span className="text-primary">Blood</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {currentUser ? (
              <>
                <NavButton
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard"
                  active={currentView === 'dashboard'}
                  onClick={() => handleNav('dashboard')}
                />
                <NavButton
                  icon={<MapPin className="h-4 w-4" />}
                  label="Centers"
                  active={currentView === 'centers'}
                  onClick={() => handleNav('centers')}
                />
                <NavButton
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Appointments"
                  active={currentView === 'appointments'}
                  onClick={() => handleNav('appointments')}
                />
                <NavButton
                  icon={<Award className="h-4 w-4" />}
                  label="Rewards"
                  active={currentView === 'rewards'}
                  onClick={() => handleNav('rewards')}
                />
                {currentUser.role === 'ADMIN' && (
                  <NavButton
                    icon={<Shield className="h-4 w-4" />}
                    label="Admin"
                    active={currentView === 'admin'}
                    onClick={() => handleNav('admin')}
                  />
                )}
                <NavButton
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Learn"
                  active={currentView === 'education'}
                  onClick={() => handleNav('education')}
                />
              </>
            ) : (
              <>
                <NavButton label="Home" active={currentView === 'landing'} onClick={() => handleNav('landing')} />
                <NavButton label="Centers" active={currentView === 'centers'} onClick={() => handleNav('centers')} />
                <NavButton label="Learn" active={currentView === 'education'} onClick={() => handleNav('education')} />
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => handleNav('dashboard')}
                  className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-1.5 shadow-sm transition-shadow hover:shadow">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {currentUser.name?.charAt(0)}
                    </div>
                    <span className="hidden text-sm font-medium sm:inline">{currentUser.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <div className="invisible absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-border bg-white py-1.5 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <button
                      onClick={() => handleNav('profile')}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <hr className="my-1 border-border/50" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => { setAuthDialogMode('login'); setAuthDialogOpen(true); }}
                >
                  <LogIn className="mr-1.5 h-4 w-4" /> Sign In
                </Button>
                <Button
                  className="bg-primary text-sm font-medium text-white shadow-md shadow-primary/25 hover:bg-primary/90"
                  onClick={() => { setAuthDialogMode('register'); setAuthDialogOpen(true); }}
                >
                  <UserPlus className="mr-1.5 h-4 w-4" /> Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {currentUser ? (
                <>
                  {[
                    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', view: 'dashboard' },
                    { icon: <MapPin className="h-4 w-4" />, label: 'Centers', view: 'centers' },
                    { icon: <CalendarDays className="h-4 w-4" />, label: 'Appointments', view: 'appointments' },
                    { icon: <Award className="h-4 w-4" />, label: 'Rewards', view: 'rewards' },
                    { icon: <BookOpen className="h-4 w-4" />, label: 'Learn', view: 'education' },
                    ...(currentUser.role === 'ADMIN'
                      ? [{ icon: <Shield className="h-4 w-4" />, label: 'Admin', view: 'admin' as const }]
                      : []),
                  ].map((item) => (
                    <button
                      key={item.view}
                      onClick={() => handleNav(item.view)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        currentView === item.view
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <hr className="my-2 border-border/50" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavItem label="Home" onClick={() => handleNav('landing')} />
                  <MobileNavItem label="Donation Centers" onClick={() => handleNav('centers')} />
                  <MobileNavItem label="Learn" onClick={() => handleNav('education')} />
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setAuthDialogMode('login'); setAuthDialogOpen(true); setMobileMenuOpen(false); }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-white"
                      onClick={() => { setAuthDialogMode('register'); setAuthDialogOpen(true); setMobileMenuOpen(false); }}
                    >
                      Register
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </button>
  );
}
