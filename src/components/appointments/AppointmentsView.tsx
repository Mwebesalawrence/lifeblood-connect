'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Droplets,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Appointment, DonationCenter } from '@/lib/store';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
];

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-600 border-red-200',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'No Show',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: XCircle,
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function isUpcoming(dateStr: string, status: string): boolean {
  return status === 'SCHEDULED';
}

/* ------------------------------------------------------------------ */
/*  Card Animation Variants                                            */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Appointment Card                                                   */
/* ------------------------------------------------------------------ */

function AppointmentCard({
  appointment,
  index,
  onCancel,
}: {
  appointment: Appointment;
  index: number;
  onCancel?: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.SCHEDULED;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card className="border-border/50 bg-white transition-all hover:shadow-md hover:-translate-y-0.5 rounded-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left info */}
            <div className="flex-1 space-y-3">
              {/* Center name */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-base font-semibold text-foreground truncate">
                  {appointment.center?.name ?? 'Unknown Center'}
                </span>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground/70" />
                  {formatDate(appointment.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground/70" />
                  {appointment.timeSlot}
                </span>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/20 pl-3">
                  {appointment.notes}
                </p>
              )}
            </div>

            {/* Right side: badge + actions */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </Badge>

              {onCancel && appointment.status === 'SCHEDULED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                  onClick={() => onCancel(appointment.id)}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  New Appointment Dialog – Step Indicators                           */
/* ------------------------------------------------------------------ */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: i === current ? 1.15 : 1,
              backgroundColor: i <= current ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.25 }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          >
            {i + 1}
          </motion.div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  New Appointment Dialog                                             */
/* ------------------------------------------------------------------ */

function NewAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { currentUser } = useAppStore();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedCenter('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setSubmitting(false);
    }
  }, [open]);

  // Fetch centers when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingCenters(true);
    api.centers
      .list()
      .then((data) => {
        if (!cancelled) {
          setCenters(
            (data as DonationCenter[]).filter(
              (c: DonationCenter) => c.isActive !== false
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast({ title: 'Error', description: 'Failed to load centers', variant: 'destructive' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCenters(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!currentUser || !selectedCenter || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      await api.appointments.create({
        donorId: currentUser.id,
        centerId: selectedCenter,
        date: selectedDate,
        timeSlot: selectedTime,
        notes: notes || undefined,
      });
      toast({
        title: 'Appointment Scheduled!',
        description: 'Your blood donation appointment has been booked successfully.',
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create appointment';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep0 = !!selectedCenter;
  const canProceedStep1 = !!selectedDate;
  const canSubmit = !!selectedCenter && !!selectedDate && !!selectedTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            New Appointment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Schedule your next blood donation in 3 easy steps.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} total={3} />

        {/* Step 0: Select Center */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <Label className="text-sm font-semibold text-foreground">
                <MapPin className="inline mr-1.5 h-4 w-4 text-primary" />
                Select a Donation Center
              </Label>
              {loadingCenters ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : centers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No centers available at this time.
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {centers.map((center) => (
                    <button
                      key={center.id}
                      type="button"
                      onClick={() => setSelectedCenter(center.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        selectedCenter === center.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border/50 bg-white hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{center.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {center.address}, {center.city}
                      </p>
                      {center.operatingHours && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {center.operatingHours}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(1)}
                  disabled={!canProceedStep0}
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Select Date */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <Label className="text-sm font-semibold text-foreground">
                <CalendarDays className="inline mr-1.5 h-4 w-4 text-primary" />
                Select a Date
              </Label>
              <input
                type="date"
                min={getTomorrow()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {selectedDate && (
                <p className="text-xs text-muted-foreground">
                  Selected: {formatDate(selectedDate)}
                </p>
              )}
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Time + Notes */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  <Clock className="inline mr-1.5 h-4 w-4 text-primary" />
                  Select a Time Slot
                </Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIME_SLOTS.map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        selectedTime === slot
                          ? 'border-primary bg-primary text-white shadow-sm shadow-primary/25'
                          : 'border-border/50 bg-white text-foreground hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Notes (optional)
                </Label>
                <Textarea
                  placeholder="Any special requirements or information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] resize-none rounded-xl border-border/50 bg-white text-sm focus:border-primary focus:ring-primary/20"
                  maxLength={300}
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {notes.length}/300
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-muted/50 border border-border/40 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Appointment Summary
                </p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {centers.find((c) => c.id === selectedCenter)?.name ?? '—'}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                  {selectedDate ? formatDate(selectedDate) : '—'}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  {selectedTime || '—'}
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({
  activeTab,
  onSchedule,
}: {
  activeTab: string;
  onSchedule: () => void;
}) {
  const isUpcoming = activeTab === 'upcoming';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <CalendarDays className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        {isUpcoming ? 'No Upcoming Appointments' : 'No Past Appointments'}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground mb-6">
        {isUpcoming
          ? 'You don\'t have any scheduled appointments yet. Book your first donation slot and help save lives.'
          : 'Your past appointments will appear here once you complete or cancel a booking.'}
      </p>
      {isUpcoming && (
        <Button
          onClick={onSchedule}
          className="bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Your First Appointment
        </Button>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sign-In Prompt                                                     */
/* ------------------------------------------------------------------ */

function SignInPrompt() {
  const { setAuthDialogOpen, setAuthDialogMode } = useAppStore();

  const handleSignIn = () => {
    setAuthDialogMode('login');
    setAuthDialogOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Droplets className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Sign In to View Appointments
          </h2>
          <p className="max-w-md mx-auto text-sm text-muted-foreground">
            Please sign in to your LifeBlood Connect account to manage your donation appointments and schedule new ones.
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleSignIn}
          className="bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] px-8"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </Button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main View                                                          */
/* ------------------------------------------------------------------ */

export default function AppointmentsView() {
  const { currentUser, setCurrentView } = useAppStore();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api.appointments.list(currentUser.id);
      setAppointments(data as Appointment[]);
    } catch {
      toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to cancel appointment' }));
        throw new Error(err.message);
      }
      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been successfully cancelled.',
      });
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setCancellingId(null);
    }
  };

  // Derived lists
  const upcoming = appointments.filter((a) => isUpcoming(a.date, a.status));
  const past = appointments.filter((a) => !isUpcoming(a.date, a.status));

  // Not logged in
  if (!currentUser) {
    return <SignInPrompt />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Appointments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your blood donation schedule and track upcoming visits.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto mb-6 rounded-xl bg-muted/60 p-1 h-auto">
            <TabsTrigger
              value="upcoming"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              Upcoming
              {upcoming.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-1.5"
                >
                  {upcoming.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              Past
              {past.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-1.5"
                >
                  {past.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="mt-0">
            {loading ? (
              <div className="space-y-4 py-8">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl bg-muted/40 animate-pulse"
                  />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState activeTab="upcoming" onSchedule={() => setDialogOpen(true)} />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {upcoming.map((appt, i) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      index={i}
                      onCancel={cancellingId ? undefined : handleCancel}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Past Tab */}
          <TabsContent value="past" className="mt-0">
            {loading ? (
              <div className="space-y-4 py-8">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl bg-muted/40 animate-pulse"
                  />
                ))}
              </div>
            ) : past.length === 0 ? (
              <EmptyState activeTab="past" onSchedule={() => setDialogOpen(true)} />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {past.map((appt, i) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
