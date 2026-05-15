'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AuthDialog from '@/components/auth/AuthDialog';
import LandingPage from '@/components/landing/LandingPage';
import DashboardView from '@/components/dashboard/DashboardView';
import CentersView from '@/components/centers/CentersView';
import CenterDetailView from '@/components/centers/CenterDetailView';
import AppointmentsView from '@/components/appointments/AppointmentsView';
import RewardsView from '@/components/rewards/RewardsView';
import EducationView from '@/components/education/EducationView';
import AdminView from '@/components/admin/AdminView';
import ProfileView from '@/components/dashboard/ProfileView';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function ViewRouter() {
  const { currentView } = useAppStore();

  return (
    <AnimatePresence mode="wait">
  {currentView === 'landing' && (
    <motion.div
      key="landing"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <LandingPage />
    </motion.div>
  )}
  {currentView === 'dashboard' && (
    <motion.div
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <DashboardView />
    </motion.div>
  )}
  {currentView === 'centers' && (
    <motion.div
      key="centers"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <CentersView />
    </motion.div>
  )}
  {currentView === 'center-detail' && (
    <motion.div
      key="center-detail"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <CenterDetailView />
    </motion.div>
  )}
  {currentView === 'appointments' && (
    <motion.div
      key="appointments"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <AppointmentsView />
    </motion.div>
  )}
  {currentView === 'rewards' && (
    <motion.div
      key="rewards"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <RewardsView />
    </motion.div>
  )}
  {currentView === 'education' && (
    <motion.div
      key="education"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <EducationView />
    </motion.div>
  )}
  {currentView === 'admin' && (
    <motion.div
      key="admin"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <AdminView />
    </motion.div>
  )}
  {currentView === 'profile' && (
    <motion.div
      key="profile"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1"
    >
      <ProfileView />
    </motion.div>
  )}
</AnimatePresence>
  );
}

export default function Home() {
  const { currentUser, setNotifications } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      api.notifications.list(currentUser.id).then(setNotifications).catch(() => {});
    }
  }, [currentUser?.id]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ViewRouter />
      </main>
      <Footer />
      <AuthDialog />
    </div>
  );
}
