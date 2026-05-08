'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Droplets,
  Award,
  CalendarDays,
  TrendingUp,
  Search,
  Plus,
  BarChart3,
  ShieldAlert,
  X,
  ChevronRight,
  Activity,
  Heart,
  Building2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import BloodTypeBadge from '@/components/shared/BloodTypeBadge';

// ─── Types ───────────────────────────────────────────────────────────
interface Stats {
  totalDonors: number;
  totalDonations: number;
  activeCenters: number;
  livesSaved: number;
  scheduledAppointments: number;
  totalUnits: number;
  bloodTypeDistribution: Record<string, number>;
  monthlyData: Record<string, number>;
  inventoryByType: Record<string, number>;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  bloodType?: string;
  city?: string;
  points: number;
  totalDonations: number;
  isEligible: boolean;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
}

interface Center {
  id: string;
  name: string;
  city: string;
  type: string;
  isActive: boolean;
  phone?: string;
  address: string;
  operatingHours?: string;
}

interface DonationRecord {
  id: string;
  donorId: string;
  centerId: string;
  date: string;
  bloodType: string;
  volumeMl: number;
  status: string;
  notes?: string;
  center: { id: string; name: string; city: string };
  donor: { id: string; name: string; bloodType?: string };
}

interface InventoryItem {
  id: string;
  centerId: string;
  bloodType: string;
  units: number;
}

interface AppointmentRecord {
  id: string;
  centerId: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  center: { id: string; name: string; city: string };
}

// ─── Constants ───────────────────────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ─── Helper ──────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

// ─── Loading Skeletons ───────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border/50 rounded-xl">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/50 rounded-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Access Denied ───────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        {...fadeInUp}
        className="text-center max-w-md"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view the admin dashboard. This area is restricted to administrators only.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, donationsData] = await Promise.all([
          api.stats(),
          api.donations.list(),
        ]);
        setStats(statsData);
        setDonations(donationsData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const monthlyChart = useMemo(() => {
    if (!stats?.monthlyData) return [];
    const entries = Object.entries(stats.monthlyData).sort(([a], [b]) => a.localeCompare(b));
    return entries.slice(-6);
  }, [stats]);

  const bloodTypeEntries = useMemo(() => {
    if (!stats?.bloodTypeDistribution) return [];
    return BLOOD_TYPES.map((bt) => ({
      type: bt,
      count: stats.bloodTypeDistribution[bt] || 0,
    })).filter((bt) => bt.count > 0);
  }, [stats]);

  const maxMonthly = useMemo(() => {
    if (monthlyChart.length === 0) return 1;
    return Math.max(...monthlyChart.map(([, v]) => v), 1);
  }, [monthlyChart]);

  const maxBloodCount = useMemo(() => {
    if (bloodTypeEntries.length === 0) return 1;
    return Math.max(...bloodTypeEntries.map((bt) => bt.count), 1);
  }, [bloodTypeEntries]);

  const recentDonations = donations.slice(0, 5);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Donors', value: stats.totalDonors, icon: Users, color: 'text-red-600 bg-red-50' },
      { label: 'Total Donations', value: stats.totalDonations, icon: Droplets, color: 'text-rose-600 bg-rose-50' },
      { label: 'Active Centers', value: stats.activeCenters, icon: Building2, color: 'text-orange-600 bg-orange-50' },
      { label: 'Blood Units', value: stats.totalUnits, icon: Heart, color: 'text-pink-600 bg-pink-50' },
      { label: 'Appointments', value: stats.scheduledAppointments, icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
      { label: 'Lives Saved', value: stats.livesSaved, icon: Award, color: 'text-emerald-600 bg-emerald-50' },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 rounded-xl">
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
          <Card className="border-border/50 rounded-xl">
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
        <Card className="border-border/50 rounded-xl">
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent><TableSkeleton rows={5} /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" {...staggerContainer} initial="initial" animate="animate">
      {/* Stat Cards */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" {...fadeInUp}>
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/50 rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Donations Bar Chart */}
        <motion.div {...fadeInUp}>
          <Card className="border-border/50 rounded-xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-600" />
                Monthly Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyChart.length > 0 ? (
                <div className="flex items-end gap-3 h-48 pt-4">
                  {monthlyChart.map(([month, value]) => {
                    const height = (value / maxMonthly) * 100;
                    const [year, mon] = month.split('-');
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{value}</span>
                        <motion.div
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-md min-h-[4px]"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{ maxHeight: '160px' }}
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {MONTH_NAMES[parseInt(mon) - 1]} {year.slice(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No donation data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Blood Type Distribution */}
        <motion.div {...fadeInUp}>
          <Card className="border-border/50 rounded-xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Droplets className="h-4 w-4 text-red-600" />
                Blood Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bloodTypeEntries.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {bloodTypeEntries.map((bt) => {
                    const pct = (bt.count / maxBloodCount) * 100;
                    return (
                      <div key={bt.type} className="flex items-center gap-3">
                        <BloodTypeBadge bloodType={bt.type} size="sm" className="w-10 justify-center shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{bt.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No distribution data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div {...fadeInUp}>
        <Card className="border-border/50 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-600" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDonations.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recentDonations.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.donor?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{d.center?.name || 'Unknown Center'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{formatShortDate(d.date)}</p>
                      <BloodTypeBadge bloodType={d.bloodType} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent donations recorded</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Donor Detail Panel ──────────────────────────────────────────────
function DonorDetailPanel({
  donorId,
  onClose,
}: {
  donorId: string;
  onClose: () => void;
}) {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, don, appts] = await Promise.all([
          api.donors.get(donorId),
          api.donations.list(donorId),
          api.appointments.list(donorId),
        ]);
        setDonor(d);
        setDonations(don);
        setAppointments(appts);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [donorId]);

  if (loading) {
    return (
      <Card className="border-border/50 rounded-xl">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!donor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{donor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{donor.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Blood Type</p>
              <BloodTypeBadge bloodType={donor.bloodType} size="lg" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">City</p>
              <p className="text-sm font-medium">{donor.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Points</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                {donor.points}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Donations</p>
              <p className="text-sm font-medium">{donor.totalDonations}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge variant={donor.isEligible ? 'default' : 'secondary'}>
                {donor.isEligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm font-medium">{formatDate(donor.createdAt)}</p>
            </div>
            {donor.lastDonationDate && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Donation</p>
                <p className="text-sm font-medium">{formatDate(donor.lastDonationDate)}</p>
              </div>
            )}
            {donor.nextEligibleDate && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next Eligible</p>
                <p className="text-sm font-medium">{formatDate(donor.nextEligibleDate)}</p>
              </div>
            )}
          </div>

          {/* Donation History */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Donation History</h4>
            {donations.length > 0 ? (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Center</TableHead>
                      <TableHead className="text-xs">Volume</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs py-2">{formatShortDate(d.date)}</TableCell>
                        <TableCell className="text-xs py-2">{d.center?.name}</TableCell>
                        <TableCell className="text-xs py-2">{d.volumeMl}ml</TableCell>
                        <TableCell className="text-xs py-2">
                          <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No donations yet</p>
            )}
          </div>

          {/* Appointment History */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Appointment History</h4>
            {appointments.length > 0 ? (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                      <TableHead className="text-xs">Center</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs py-2">{formatShortDate(a.date)}</TableCell>
                        <TableCell className="text-xs py-2">{a.timeSlot}</TableCell>
                        <TableCell className="text-xs py-2">{a.center?.name}</TableCell>
                        <TableCell className="text-xs py-2">
                          <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No appointments yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Donors Tab ──────────────────────────────────────────────────────
function DonorsTab() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.donors.list();
        setDonors(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        (d.city && d.city.toLowerCase().includes(search.toLowerCase()));
      const matchBlood = bloodFilter === 'all' || d.bloodType === bloodFilter;
      return matchSearch && matchBlood;
    });
  }, [donors, search, bloodFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-36" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search donors by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={bloodFilter} onValueChange={setBloodFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Blood Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {BLOOD_TYPES.map((bt) => (
              <SelectItem key={bt} value={bt}>{bt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donors Table */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 rounded-xl">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-xs">Blood Type</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">City</TableHead>
                      <TableHead className="text-xs text-center">Donations</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Points</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors.length > 0 ? (
                      filteredDonors.map((d) => (
                        <TableRow
                          key={d.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedDonorId(d.id)}
                        >
                          <TableCell className="text-sm font-medium">{d.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{d.email}</TableCell>
                          <TableCell>
                            <BloodTypeBadge bloodType={d.bloodType} size="sm" />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{d.city || '—'}</TableCell>
                          <TableCell className="text-xs text-center">{d.totalDonations}</TableCell>
                          <TableCell className="text-xs text-center hidden sm:table-cell">{d.points}</TableCell>
                          <TableCell>
                            <Badge
                              variant={d.isEligible ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {d.isEligible ? 'Eligible' : 'Wait'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No donors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredDonors.length} of {donors.length} donors
          </p>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDonorId ? (
              <DonorDetailPanel
                key={selectedDonorId}
                donorId={selectedDonorId}
                onClose={() => setSelectedDonorId(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border/50 border-dashed rounded-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select a donor to view their profile and history
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Inventory Dialog ────────────────────────────────────────────────
function InventoryDialog({ center, onClose }: { center: Center; onClose: () => void }) {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.inventory.list(center.id);
        const map: Record<string, number> = {};
        for (const item of data) {
          map[item.bloodType] = item.units;
        }
        for (const bt of BLOOD_TYPES) {
          if (!(bt in map)) map[bt] = 0;
        }
        setInventory(map);
      } catch {
        const map: Record<string, number> = {};
        for (const bt of BLOOD_TYPES) map[bt] = 0;
        setInventory(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [center.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        BLOOD_TYPES.map((bt) =>
          api.inventory.update({ centerId: center.id, bloodType: bt, units: inventory[bt] || 0 })
        )
      );
      toast({ title: 'Success', description: 'Inventory updated successfully' });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to update inventory', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-red-600" />
          Manage Inventory — {center.name}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-4">
        {loading ? (
          <div className="space-y-2">
            {BLOOD_TYPES.map((bt) => (
              <Skeleton key={bt} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {BLOOD_TYPES.map((bt) => (
              <div key={bt} className="flex items-center gap-3">
                <BloodTypeBadge bloodType={bt} size="sm" className="w-12 justify-center shrink-0" />
                <Input
                  type="number"
                  min={0}
                  value={inventory[bt] ?? 0}
                  onChange={(e) =>
                    setInventory((prev) => ({ ...prev, [bt]: Math.max(0, parseInt(e.target.value) || 0) }))
                  }
                  className="h-9"
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground shrink-0">units</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-red-600 hover:bg-red-700">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </DialogContent>
  );
}

// ─── Centers Tab ─────────────────────────────────────────────────────
function CentersTab() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryDialogCenter, setInventoryDialogCenter] = useState<Center | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [centersData, inventoryData] = await Promise.all([
          api.centers.list(),
          api.inventory.list(),
        ]);
        setCenters(centersData);
        setInventory(inventoryData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getCenterInventory = useCallback(
    (centerId: string) => {
      return inventory.filter((i) => i.centerId === centerId);
    },
    [inventory]
  );

  const getCenterTotalUnits = useCallback(
    (centerId: string) => {
      return getCenterInventory(centerId).reduce((sum, i) => sum + i.units, 0);
    },
    [getCenterInventory]
  );

  if (loading) {
    return <CardGridSkeleton count={6} />;
  }

  return (
    <motion.div {...fadeInUp}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centers.map((center) => {
          const centerInv = getCenterInventory(center.id);
          const totalUnits = getCenterTotalUnits(center.id);

          return (
            <Card key={center.id} className="border-border/50 rounded-xl hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-red-600" />
                    {center.name}
                  </CardTitle>
                  <Badge variant={center.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {center.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{center.city}</span>
                  <span className="text-border">|</span>
                  <span className="capitalize">{center.type}</span>
                </div>
                {center.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{center.operatingHours || center.phone}</span>
                  </div>
                )}

                {/* Inventory Summary */}
                {centerInv.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Inventory ({totalUnits} units)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {centerInv
                        .filter((i) => i.units > 0)
                        .map((i) => (
                          <div key={i.bloodType} className="flex items-center gap-1 bg-muted rounded-md px-1.5 py-0.5">
                            <span className="text-[10px] font-bold">{i.bloodType}</span>
                            <span className="text-[10px] text-muted-foreground">{i.units}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setInventoryDialogCenter(center)}
                >
                  <Droplets className="h-3.5 w-3.5 mr-1.5" />
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Dialog */}
      <Dialog
        open={!!inventoryDialogCenter}
        onOpenChange={(open) => {
          if (!open) setInventoryDialogCenter(null);
        }}
      >
        {inventoryDialogCenter && (
          <InventoryDialog
            center={inventoryDialogCenter}
            onClose={() => setInventoryDialogCenter(null)}
          />
        )}
      </Dialog>
    </motion.div>
  );
}

// ─── Record Donation Dialog ──────────────────────────────────────────
function RecordDonationDialog({ onClose }: { onClose: () => void }) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [donorSearch, setDonorSearch] = useState('');
  const { toast } = useToast();

  const [form, setForm] = useState({
    donorId: '',
    centerId: '',
    bloodType: '',
    volumeMl: 450,
    notes: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const [donorsData, centersData] = await Promise.all([
          api.donors.list(),
          api.centers.list(),
        ]);
        setDonors(donorsData);
        setCenters(centersData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredDonors = useMemo(() => {
    if (!donorSearch) return donors.slice(0, 20);
    return donors.filter(
      (d) =>
        d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
        d.email.toLowerCase().includes(donorSearch.toLowerCase())
    );
  }, [donors, donorSearch]);

  const selectedDonor = useMemo(() => {
    return donors.find((d) => d.id === form.donorId);
  }, [donors, form.donorId]);

  const handleDonorSelect = (donorId: string) => {
    const donor = donors.find((d) => d.id === donorId);
    setForm((prev) => ({
      ...prev,
      donorId,
      bloodType: donor?.bloodType || '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.donorId || !form.centerId || !form.bloodType) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.donations.create({
        donorId: form.donorId,
        centerId: form.centerId,
        bloodType: form.bloodType,
        volumeMl: form.volumeMl,
        notes: form.notes || undefined,
      });
      toast({ title: 'Success', description: 'Donation recorded successfully' });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to record donation', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-red-600" />
          Record Donation
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Donor Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Donor *</label>
              {form.donorId ? (
                <div className="flex items-center justify-between h-10 px-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedDonor?.name}</span>
                    {selectedDonor?.bloodType && (
                      <BloodTypeBadge bloodType={selectedDonor.bloodType} size="sm" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, donorId: '', bloodType: '' }));
                      setDonorSearch('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search donor by name or email..."
                      value={donorSearch}
                      onChange={(e) => setDonorSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {donorSearch && (
                    <div className="max-h-40 overflow-y-auto rounded-md border bg-popover">
                      {filteredDonors.length > 0 ? (
                        filteredDonors.map((d) => (
                          <button
                            key={d.id}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                            onClick={() => handleDonorSelect(d.id)}
                          >
                            <span>{d.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{d.email}</span>
                              <BloodTypeBadge bloodType={d.bloodType} size="sm" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground p-3">No donors found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Center Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Center *</label>
              <Select value={form.centerId} onValueChange={(v) => setForm((prev) => ({ ...prev, centerId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Blood Type (auto-filled) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Type</label>
              <Input
                value={form.bloodType}
                disabled
                className="bg-muted/50"
                placeholder="Auto-filled from donor"
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (ml)</label>
              <Input
                type="number"
                min={200}
                max={1000}
                value={form.volumeMl}
                onChange={(e) => setForm((prev) => ({ ...prev, volumeMl: parseInt(e.target.value) || 450 }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || loading || !form.donorId || !form.centerId}
          className="bg-red-600 hover:bg-red-700"
        >
          {submitting ? 'Recording...' : 'Record Donation'}
        </Button>
      </div>
    </DialogContent>
  );
}

// ─── Donations Tab ───────────────────────────────────────────────────
function DonationsTab() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadDonations = useCallback(async () => {
    try {
      const data = await api.donations.list();
      setDonations(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const filteredDonations = useMemo(() => {
    if (statusFilter === 'all') return donations;
    return donations.filter((d) => d.status === statusFilter);
  }, [donations, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-40" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <motion.div {...fadeInUp}>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Record Donation
            </Button>
          </DialogTrigger>
          <RecordDonationDialog onClose={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      <Card className="border-border/50 rounded-xl">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Donor</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Center</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Blood Type</TableHead>
                  <TableHead className="text-xs text-center hidden sm:table-cell">Volume</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-medium">
                        {d.donor?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {d.center?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(d.date)}</TableCell>
                      <TableCell>
                        <BloodTypeBadge bloodType={d.bloodType} size="sm" />
                      </TableCell>
                      <TableCell className="text-xs text-center hidden sm:table-cell">
                        {d.volumeMl}ml
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === 'COMPLETED'
                              ? 'default'
                              : d.status === 'SCHEDULED'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No donations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-2">
        Showing {filteredDonations.length} of {donations.length} donations
      </p>
    </motion.div>
  );
}

// ─── Main AdminView ──────────────────────────────────────────────────
export default function AdminView() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  const navItems = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'donors', label: 'Donors', icon: Users },
    { value: 'centers', label: 'Centers', icon: MapPin },
    { value: 'donations', label: 'Donations', icon: Droplets },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage donors, centers, donations, and inventory
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div {...fadeInUp}>
            <TabsList className="mb-6 w-full sm:w-auto inline-flex h-auto p-1 bg-muted/50 rounded-xl">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-red-600 transition-all"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="mt-0">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="donors" className="mt-0">
                <DonorsTab />
              </TabsContent>
              <TabsContent value="centers" className="mt-0">
                <CentersTab />
              </TabsContent>
              <TabsContent value="donations" className="mt-0">
                <DonationsTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
