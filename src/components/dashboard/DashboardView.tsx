'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, CalendarDays, Heart, Award, Clock, MapPin,
  Bell, TrendingUp, CheckCircle2, AlertCircle, Activity,
  ArrowRight, ChevronRight, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, Donation, Appointment, Notification } from '@/lib/store';
import { api } from '@/lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function SkeletonCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-white p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

function BloodDrivesInArea() {
  const { currentUser } = useAppStore();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    try {
      const params = currentUser?.city
        ? { city: currentUser.city }
        : {};
      const data = await api.bloodDrives.list(params);
      setDrives(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [currentUser?.city]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.city]);

  // Separate upcoming and cancelled drives
  const upcomingDrives = drives.filter((d) => d.status !== 'CANCELLED' && d.status !== 'COMPLETED' && new Date(d.endDate) >= new Date());
  const cancelledDrives = drives.filter((d) => d.status === 'CANCELLED');

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" /> Blood Drives Near You
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={load}>
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </Button>
          <Badge variant="secondary" className="text-xs">{upcomingDrives.length} upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingDrives.length === 0 && cancelledDrives.length === 0 ? (
          <div className="py-6 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No upcoming blood drives in your area</p>
          </div>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar pr-1">
            {upcomingDrives.slice(0, 5).map((drive) => {
              let days: string[] = [];
              try { days = JSON.parse(drive.scheduledDays); } catch { days = []; }

              const isExpanded = expandedId === drive.id;
              const fmtDate = (d: string) => {
                return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              };

              return (
                <div
                  key={drive.id}
                  className="rounded-xl border border-border/40 bg-white transition-all hover:shadow-sm"
                >
                  <button
                    className="flex items-center gap-3 w-full p-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : drive.id)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{drive.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(drive.startDate)} · <MapPin className="inline h-3 w-3" /> {drive.city}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 pt-0"
                    >
                      <div className="ml-5 pl-4 space-y-2 border-l-2 border-primary/20">
                        <p className="text-xs text-muted-foreground">{drive.description}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{drive.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{drive.startTime} — {drive.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{days.join(', ')}</span>
                          </div>
                          {drive.organizer && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{drive.organizer}</span>
                            </div>
                          )}
                        </div>
                        {drive.contactPhone && (
                          <p className="text-xs text-muted-foreground">
                            Contact: {drive.contactPhone}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Show cancelled drives */}
            {cancelledDrives.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-xs text-muted-foreground">Cancelled</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                {cancelledDrives.slice(0, 3).map((drive) => {
                  const fmtDate = (d: string) => {
                    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  };

                  return (
                    <div
                      key={drive.id}
                      className="rounded-xl border border-red-200 bg-red-50/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-sm truncate">{drive.title}</p>
                          <p className="text-xs text-red-600">
                            Cancelled · {drive.location}, {drive.city}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs shrink-0">Cancelled</Badge>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardView() {
  const { currentUser, setCurrentView, setAuthDialogOpen, setAuthDialogMode } = useAppStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      api.donations.list(currentUser.id),
      api.appointments.list(currentUser.id),
      api.notifications.list(currentUser.id),
    ])
      .then(([d, a, n]) => {
        setDonations(d);
        setAppointments(a);
        setNotifications(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <motion.div {...fadeUp} className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Droplets className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">Join LifeBlood Connect</h2>
          <p className="mb-6 text-muted-foreground">
            Sign in to track your donations, schedule appointments, and earn rewards for saving lives.
          </p>
          <Button
            size="lg"
            className="bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
            onClick={() => { setAuthDialogMode('login'); setAuthDialogOpen(true); }}
          >
            Sign In to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((a) => a.status === 'SCHEDULED');
  const pastDonations = donations.slice(0, 5);
  const livesSaved = currentUser.totalDonations * 3;
  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getNextEligible = () => {
    if (!currentUser.nextEligibleDate) return null;
    const diff = new Date(currentUser.nextEligibleDate).getTime() - Date.now();
    if (diff <= 0) return 'Eligible now!';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} days remaining`;
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markRead(currentUser.id);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <motion.div {...fadeUp} className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-red-700 p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white">
                {currentUser.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Welcome back, {currentUser.name?.split(' ')[0]}!
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {currentUser.bloodType && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      {currentUser.bloodType}
                    </Badge>
                  )}
                  <span className="text-sm text-white/80">
                    {currentUser.isEligible ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Eligible to donate
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {getNextEligible()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                onClick={() => setCurrentView('appointments')}
              >
                <CalendarDays className="mr-1.5 h-4 w-4" /> Schedule
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => setCurrentView('centers')}
              >
                <MapPin className="mr-1.5 h-4 w-4" /> Find Center
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Donations', value: currentUser.totalDonations, icon: <Droplets className="h-5 w-5" />, color: 'text-primary bg-primary/10' },
          { label: 'Points Earned', value: currentUser.points, icon: <Award className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Lives Saved', value: livesSaved, icon: <Heart className="h-5 w-5" />, color: 'text-green-600 bg-green-50' },
          { label: 'Next Eligible', value: currentUser.nextEligibleDate ? formatDate(currentUser.nextEligibleDate) : 'Anytime', icon: <Clock className="h-5 w-5" />, color: 'text-sky-600 bg-sky-50' },
        ].map((stat, i) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Upcoming Appointments */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-primary" /> Upcoming Appointments
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('appointments')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => <SkeletonRow key={i} />)}
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="py-8 text-center">
                    <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
                    <Button size="sm" className="bg-primary text-white" onClick={() => setCurrentView('appointments')}>
                      Schedule Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-white p-4 transition-all hover:shadow-sm">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{apt.center?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(apt.date)} at {apt.timeSlot}
                          </p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200 shrink-0">{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Donation History */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" /> Donation History
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{currentUser.totalDonations} total</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                  </div>
                ) : pastDonations.length === 0 ? (
                  <div className="py-8 text-center">
                    <Droplets className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No donations recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastDonations.map((d) => (
                      <div key={d.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-white p-4 transition-all hover:shadow-sm">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Droplets className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{d.center?.name || 'Unknown Center'}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(d.date)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="font-bold">{d.bloodType}</Badge>
                          <span className="text-xs text-muted-foreground">{d.volumeMl}ml</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Notifications */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" /> Notifications
                </CardTitle>
                {unreadNotifs.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                    Mark all read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        className={`rounded-lg border p-3 transition-all ${
                          notif.isRead
                            ? 'border-transparent bg-muted/30'
                            : 'border-primary/20 bg-primary/5'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.isRead && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                          <div className={notif.isRead ? '' : 'pl-0'}>
                            <p className={`text-sm font-medium ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {notif.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Blood Drives in Your Area */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.28 }}>
            <BloodDrivesInArea />
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.35 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { label: 'Schedule Appointment', icon: <CalendarDays className="h-4 w-4" />, view: 'appointments' as const, desc: 'Book your next donation' },
                  { label: 'Find Centers', icon: <MapPin className="h-4 w-4" />, view: 'centers' as const, desc: 'Locate nearby centers' },
                  { label: 'View Rewards', icon: <Award className="h-4 w-4" />, view: 'rewards' as const, desc: 'Check your badges' },
                  { label: 'Learn More', icon: <Activity className="h-4 w-4" />, view: 'education' as const, desc: 'Donation guidelines' },
                ].map((action) => (
                  <button
                    key={action.view}
                    onClick={() => setCurrentView(action.view)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/40 p-3 text-left transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Eligibility Tracker */}
          {!currentUser.isEligible && currentUser.lastDonationDate && (
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.4 }}>
              <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800">Eligibility Countdown</p>
                      <p className="mt-1 text-sm text-amber-700">
                        You need to wait 56 days between donations. Your next eligible date is{' '}
                        <strong>{formatDate(currentUser.nextEligibleDate!)}</strong>.
                      </p>
                      <Progress value={75} className="mt-3 h-2 bg-amber-100" />
                      <p className="mt-1 text-xs text-amber-600">{getNextEligible()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentUser.isEligible && (
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.4 }}>
              <Card className="border-green-200 bg-green-50/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">You are eligible to donate!</p>
                      <p className="mt-1 text-sm text-green-700">
                        Schedule your next appointment today and help save lives.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-green-600 text-white hover:bg-green-700"
                        onClick={() => setCurrentView('appointments')}
                      >
                        <Droplets className="mr-1.5 h-3.5 w-3.5" /> Schedule Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}