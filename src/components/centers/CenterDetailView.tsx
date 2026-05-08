'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Droplets,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import {
  useAppStore,
  type DonationCenter,
  type BloodInventoryItem,
} from '@/lib/store';

interface CenterDetail extends DonationCenter {
  recentDonations?: {
    id: string;
    date: string;
    bloodType: string;
    volumeMl: number;
    donor?: { name: string };
  }[];
}

function getStockStatus(units: number) {
  if (units > 10) return { level: 'adequate', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50', icon: CheckCircle2, label: 'Adequate' };
  if (units >= 5) return { level: 'low', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/50', icon: MinusCircle, label: 'Low' };
  return { level: 'critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800/50', icon: AlertTriangle, label: 'Critical' };
}

function InventoryCard({ item }: { item: BloodInventoryItem }) {
  const status = getStockStatus(item.units);
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-xl border ${status.border} ${status.bg} p-4 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-foreground">{item.bloodType}</span>
        <div className="flex items-center gap-1.5">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-bold ${status.color}`}>{item.units}</span>
        <span className="text-sm text-muted-foreground mb-1">units</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-background/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((item.units / 30) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            status.level === 'adequate'
              ? 'bg-emerald-500'
              : status.level === 'low'
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Skeleton className="h-10 w-32 rounded-lg" />
      {/* Header */}
      <Card className="border-border/50 rounded-xl">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Inventory skeleton */}
      <Card className="border-border/50 rounded-xl">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CenterDetailView() {
  const {
    selectedCenter,
    setCurrentView,
    setSelectedCenter,
    currentUser,
    setAuthDialogOpen,
  } = useAppStore();

  const [center, setCenter] = useState<CenterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCenter) {
      setCurrentView('centers');
      return;
    }

    let cancelled = false;

    api.centers
      .get(selectedCenter.id)
      .then((data) => {
        if (!cancelled) {
          setCenter(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCenter?.id, setCurrentView, selectedCenter]);

  // Guard: redirect if no selected center
  if (!selectedCenter) {
    return null;
  }

  const handleBack = () => {
    setCurrentView('centers');
  };

  const handleBookAppointment = () => {
    if (!currentUser) {
      setAuthDialogOpen(true);
      return;
    }
    setCurrentView('appointments');
  };

  const handleRetry = () => {
    if (!selectedCenter) return;
    setLoading(true);
    setError(null);
    api.centers
      .get(selectedCenter.id)
      .then((data) => {
        setCenter(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  if (loading) return <DetailSkeleton />;

  if (error || !center) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Centers
        </Button>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {error ? 'Failed to load center details' : 'Center not found'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {error || 'The selected center could not be found.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRetry} className="rounded-lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button onClick={handleBack} className="rounded-lg bg-red-600 hover:bg-red-700 text-white">
              View all centers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalUnits =
    center.inventory?.reduce((sum, item) => sum + item.units, 0) ?? 0;
  const lowStockCount =
    center.inventory?.filter((i) => i.units < 5).length ?? 0;
  const criticalCount =
    center.inventory?.filter((i) => i.units < 5).length ?? 0;

  const typeColor =
    center.type === 'Hospital'
      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-red-50/30 dark:to-red-950/10">
      {/* Top bar with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="rounded-lg -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centers
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Center Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50 rounded-xl overflow-hidden">
            {/* Red accent strip */}
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700" />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-red-500" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {center.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium ${typeColor} border-0`}
                    >
                      {center.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    {center.address && (
                      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-0.5">
                            Address
                          </p>
                          <p className="leading-relaxed">
                            {center.address}
                            {center.district && (
                              <span>, {center.district}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {center.phone && (
                      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <Phone className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-0.5">
                            Phone
                          </p>
                          <p>{center.phone}</p>
                        </div>
                      </div>
                    )}

                    {center.email && (
                      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <Mail className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-0.5">
                            Email
                          </p>
                          <p>{center.email}</p>
                        </div>
                      </div>
                    )}

                    {center.operatingHours && (
                      <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-0.5">
                            Operating Hours
                          </p>
                          <p>{center.operatingHours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats sidebar */}
                <div className="flex md:flex-col gap-3 md:w-44 shrink-0">
                  <div className="flex-1 md:flex-none bg-red-50 dark:bg-red-950/30 rounded-xl p-4 text-center">
                    <Droplets className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {totalUnits}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Units
                    </p>
                  </div>
                  <div className="flex-1 md:flex-none bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {lowStockCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </div>

              {/* Book Appointment CTA */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button
                  onClick={handleBookAppointment}
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white px-8 h-12 text-base"
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  {currentUser ? 'Book Appointment' : 'Sign in to Book Appointment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blood Inventory Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border/50 rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-red-500" />
                    Blood Inventory
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Current stock levels by blood type
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Adequate (&gt;10)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Low (5-10)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Critical (&lt;5)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {center.inventory && center.inventory.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {center.inventory.map((item) => (
                    <InventoryCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No inventory data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom row: Recent Donations + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Donations Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 rounded-xl h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-red-500" />
                  Recent Donations
                </CardTitle>
                <CardDescription>
                  Last 10 donations recorded at this center
                </CardDescription>
              </CardHeader>
              <CardContent>
                {center.recentDonations && center.recentDonations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs uppercase tracking-wide">
                            Donor
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wide">
                            Date
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wide">
                            Blood Type
                          </TableHead>
                          <TableHead className="text-xs uppercase tracking-wide text-right">
                            Volume
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {center.recentDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">
                              {donation.donor?.name ?? 'Anonymous'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(donation.date).toLocaleDateString(
                                'en-UG',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-semibold text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                              >
                                {donation.bloodType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {donation.volumeMl} ml
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No recent donations recorded
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Donations will appear here once they are processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-border/50 rounded-xl h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="w-full h-48 bg-muted/50 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-border/60">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {center.city}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {center.latitude && center.longitude
                        ? `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`
                        : center.address}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Location Services Coming Soon
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Interactive maps and directions will be available in a
                    future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
