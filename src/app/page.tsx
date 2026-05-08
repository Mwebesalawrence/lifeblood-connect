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
      <motion.div
        key={currentView}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex-1"
      >
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'centers' && <CentersView />}
        {currentView === 'center-detail' && <CenterDetailView />}
        {currentView === 'appointments' && <AppointmentsView />}
        {currentView === 'rewards' && <RewardsView />}
        {currentView === 'education' && <EducationView />}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'profile' && <ProfileView />}
      </motion.div>
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
