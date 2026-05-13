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
  Calendar,
  Trash2,
  Flag,
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

// Types
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

interface BloodDrive {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  scheduledDays: string;
  startTime: string;
  endTime: string;
  organizer?: string;
  contactPhone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
const DRIVE_STATUSES = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  } catch { return dateStr; }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'UPCOMING': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
    case 'COMPLETED': return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

// Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border/50 rounded-xl">
          <CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  );
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/50 rounded-xl">
          <CardHeader className="pb-2"><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-28" /></CardContent>
        </Card>
      ))}
    </div>
  );
}

// Access Denied
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div {...fadeInUp} className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view the admin dashboard.</p>
      </motion.div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, donationsData] = await Promise.all([api.stats(), api.donations.list()]);
        setStats(statsData);
        setDonations(donationsData);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const monthlyChart = useMemo(() => {
    if (!stats?.monthlyData) return [];
    return Object.entries(stats.monthlyData).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [stats]);

  const bloodTypeEntries = useMemo(() => {
    if (!stats?.bloodTypeDistribution) return [];
    return BLOOD_TYPES.map((bt) => ({ type: bt, count: stats.bloodTypeDistribution[bt] || 0 })).filter((bt) => bt.count > 0);
  }, [stats]);

  const maxMonthly = useMemo(() => monthlyChart.length === 0 ? 1 : Math.max(...monthlyChart.map(([, v]) => v), 1), [monthlyChart]);
  const maxBloodCount = useMemo(() => bloodTypeEntries.length === 0 ? 1 : Math.max(...bloodTypeEntries.map((bt) => bt.count), 1), [bloodTypeEntries]);

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
          <Card className="border-border/50 rounded-xl"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card className="border-border/50 rounded-xl"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" {...staggerContainer} initial="initial" animate="animate">
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" {...fadeInUp}>
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/50 rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}><card.icon className="h-4 w-4" /></div>
              </div>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeInUp}>
          <Card className="border-border/50 rounded-xl h-full">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-red-600" />Monthly Donations</CardTitle></CardHeader>
            <CardContent>
              {monthlyChart.length > 0 ? (
                <div className="flex items-end gap-3 h-48 pt-4">
                  {monthlyChart.map(([month, value]) => {
                    const height = (value / maxMonthly) * 100;
                    const [year, mon] = month.split('-');
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold">{value}</span>
                        <motion.div className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-md min-h-[4px]" initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.6 }} style={{ maxHeight: '160px' }} />
                        <span className="text-[10px] text-muted-foreground">{MONTH_NAMES[parseInt(mon) - 1]} {year.slice(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeInUp}>
          <Card className="border-border/50 rounded-xl h-full">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Droplets className="h-4 w-4 text-red-600" />Blood Type Distribution</CardTitle></CardHeader>
            <CardContent>
              {bloodTypeEntries.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {bloodTypeEntries.map((bt) => {
                    const pct = (bt.count / maxBloodCount) * 100;
                    return (
                      <div key={bt.type} className="flex items-center gap-3">
                        <BloodTypeBadge bloodType={bt.type} size="sm" className="w-10 justify-center shrink-0" />
                        <div className="flex-1"><div className="h-5 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} /></div></div>
                        <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{bt.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Donor Detail Panel
function DonorDetailPanel({ donorId, onClose }: { donorId: string; onClose: () => void }) {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, don, appts] = await Promise.all([api.donors.get(donorId), api.donations.list(donorId), api.appointments.list(donorId)]);
        setDonor(d); setDonations(don); setAppointments(appts);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [donorId]);

  if (loading) return <Card className="border-border/50 rounded-xl"><CardContent className="p-6 space-y-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-64" /></CardContent></Card>;
  if (!donor) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Users className="h-6 w-6 text-red-600" /></div>
            <div><CardTitle className="text-lg">{donor.name}</CardTitle><p className="text-sm text-muted-foreground">{donor.email}</p></div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground mb-1">Blood Type</p><BloodTypeBadge bloodType={donor.bloodType} size="lg" /></div>
            <div><p className="text-xs text-muted-foreground mb-1">City</p><p className="text-sm font-medium">{donor.city || 'N/A'}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Points</p><p className="text-sm font-medium">{donor.points}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Total Donations</p><p className="text-sm font-medium">{donor.totalDonations}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Status</p><Badge variant={donor.isEligible ? 'default' : 'secondary'}>{donor.isEligible ? 'Eligible' : 'Not Eligible'}</Badge></div>
            <div><p className="text-xs text-muted-foreground mb-1">Member Since</p><p className="text-sm font-medium">{formatDate(donor.createdAt)}</p></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Donors Tab
function DonorsTab() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  useEffect(() => {
    async function load() { try { setDonors(await api.donors.list()); } catch {} finally { setLoading(false); } }
    load();
  }, []);

  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase()) || (d.city && d.city.toLowerCase().includes(search.toLowerCase()));
      return matchSearch && (bloodFilter === 'all' || d.bloodType === bloodFilter);
    });
  }, [donors, search, bloodFilter]);

  if (loading) return <div className="space-y-4"><div className="flex gap-3"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 w-36" /></div><TableSkeleton /></div>;

  return (
    <motion.div {...fadeInUp}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={bloodFilter} onValueChange={setBloodFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Blood Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem>{BLOOD_TYPES.map((bt) => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50 rounded-xl"><CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto"><Table><TableHeader><TableRow>
              <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs hidden md:table-cell">Email</TableHead><TableHead className="text-xs">Blood</TableHead><TableHead className="text-xs hidden sm:table-cell">City</TableHead><TableHead className="text-xs text-center">Donations</TableHead><TableHead className="text-xs">Status</TableHead>
            </TableRow></TableHeader><TableBody>
              {filteredDonors.length > 0 ? filteredDonors.map((d) => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDonorId(d.id)}>
                  <TableCell className="text-sm font-medium">{d.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{d.email}</TableCell>
                  <TableCell><BloodTypeBadge bloodType={d.bloodType} size="sm" /></TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{d.city || '--'}</TableCell>
                  <TableCell className="text-xs text-center">{d.totalDonations}</TableCell>
                  <TableCell><Badge variant={d.isEligible ? 'default' : 'secondary'} className="text-[10px]">{d.isEligible ? 'Eligible' : 'Wait'}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center py-8">No donors found</TableCell></TableRow>}
            </TableBody></Table></div>
          </CardContent></Card>
        </div>
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDonorId ? <DonorDetailPanel key={selectedDonorId} donorId={selectedDonorId} onClose={() => setSelectedDonorId(null)} /> : (
              <Card className="border-border/50 border-dashed rounded-xl"><CardContent className="flex flex-col items-center justify-center py-16 text-center"><Users className="h-10 w-10 text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">Select a donor to view details</p></CardContent></Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Inventory Dialog
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
        for (const item of data) map[item.bloodType] = item.units;
        for (const bt of BLOOD_TYPES) if (!(bt in map)) map[bt] = 0;
        setInventory(map);
      } catch { const map: Record<string, number> = {}; for (const bt of BLOOD_TYPES) map[bt] = 0; setInventory(map); }
      finally { setLoading(false); }
    }
    load();
  }, [center.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(BLOOD_TYPES.map((bt) => api.inventory.update({ centerId: center.id, bloodType: bt, units: inventory[bt] || 0 })));
      toast({ title: 'Success', description: 'Inventory updated' });
      onClose();
    } catch { toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-red-600" />Inventory - {center.name}</DialogTitle></DialogHeader>
      <div className="space-y-3 py-4">
        {loading ? <div className="space-y-2">{BLOOD_TYPES.map((bt) => <Skeleton key={bt} className="h-10 w-full" />)}</div> : (
          <div className="space-y-2">{BLOOD_TYPES.map((bt) => (
            <div key={bt} className="flex items-center gap-3">
              <BloodTypeBadge bloodType={bt} size="sm" className="w-12 justify-center shrink-0" />
              <Input type="number" min={0} value={inventory[bt] ?? 0} onChange={(e) => setInventory((prev) => ({ ...prev, [bt]: Math.max(0, parseInt(e.target.value) || 0) }))} className="h-9" />
              <span className="text-xs text-muted-foreground shrink-0">units</span>
            </div>
          ))}</div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-red-600 hover:bg-red-700">{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </DialogContent>
  );
}

// Centers Tab
function CentersTab() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invCenter, setInvCenter] = useState<Center | null>(null);

  useEffect(() => {
    async function load() { try { const [c, i] = await Promise.all([api.centers.list(), api.inventory.list()]); setCenters(c); setInventory(i); } catch {} finally { setLoading(false); } }
    load();
  }, []);

  const getInv = useCallback((cid: string) => inventory.filter((i) => i.centerId === cid), [inventory]);
  const getTotal = useCallback((cid: string) => getInv(cid).reduce((s, i) => s + i.units, 0), [getInv]);

  if (loading) return <CardGridSkeleton />;

  return (
    <motion.div {...fadeInUp}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centers.map((center) => {
          const cInv = getInv(center.id);
          return (
            <Card key={center.id} className="border-border/50 rounded-xl hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-red-600" />{center.name}</CardTitle>
                  <Badge variant={center.isActive ? 'default' : 'secondary'} className="text-[10px]">{center.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span>{center.city}</span></div>
                {cInv.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Inventory ({getTotal(center.id)} units)</p>
                    <div className="flex flex-wrap gap-1.5">{cInv.filter((i) => i.units > 0).map((i) => (
                      <div key={i.bloodType} className="flex items-center gap-1 bg-muted rounded-md px-1.5 py-0.5"><span className="text-[10px] font-bold">{i.bloodType}</span><span className="text-[10px] text-muted-foreground">{i.units}</span></div>
                    ))}</div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setInvCenter(center)}><Droplets className="h-3.5 w-3.5 mr-1.5" />Manage Inventory</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={!!invCenter} onOpenChange={(o) => { if (!o) setInvCenter(null); }}>{invCenter && <InventoryDialog center={invCenter} onClose={() => setInvCenter(null)} />}</Dialog>
    </motion.div>
  );
}

// Add Blood Drive Dialog
function AddBloodDriveDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '', description: '', location: '', district: '', city: '', latitude: '', longitude: '',
    startDate: '', endDate: '', scheduledDays: [] as string[], startTime: '08:00 AM', endTime: '04:00 PM',
    organizer: '', contactPhone: '',
  });

  const toggleDay = (day: string) => {
    setForm((prev) => ({ ...prev, scheduledDays: prev.scheduledDays.includes(day) ? prev.scheduledDays.filter((d) => d !== day) : [...prev.scheduledDays, day] }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.district || !form.city || !form.startDate || !form.endDate || form.scheduledDays.length === 0) {
      toast({ title: 'Validation Error', description: 'Fill all required fields and select at least one day', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.bloodDrives.create({ ...form, latitude: form.latitude || undefined, longitude: form.longitude || undefined, scheduledDays: JSON.stringify(form.scheduledDays) });
      toast({ title: 'Success', description: 'Blood drive created' });
      onCreated(); onClose();
    } catch { toast({ title: 'Error', description: 'Failed to create', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-red-600" />Add Blood Drive</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Kampala City Blood Drive" /></div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the blood drive..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Location *</label><Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Venue name" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">District *</label><Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} placeholder="e.g. Kampala Central" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">City *</label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Kampala" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Organizer</label><Input value={form.organizer} onChange={(e) => setForm((p) => ({ ...p, organizer: e.target.value }))} placeholder="Organization" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date *</label><Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">End Date *</label><Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Start Time *</label>
            <Select value={form.startTime} onValueChange={(v) => setForm((p) => ({ ...p, startTime: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">End Time *</label>
            <Select value={form.endTime} onValueChange={(v) => setForm((p) => ({ ...p, endTime: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Scheduled Days *</label>
          <div className="flex flex-wrap gap-2">{WEEKDAYS.map((day) => (
            <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.scheduledDays.includes(day) ? 'bg-red-600 text-white border-red-600' : 'bg-background text-muted-foreground border-border hover:border-red-300'}`}>{day.slice(0, 3)}</button>
          ))}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Latitude</label><Input type="number" step="any" value={form.latitude} onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))} placeholder="0.3350" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Longitude</label><Input type="number" step="any" value={form.longitude} onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))} placeholder="32.5670" /></div>
        </div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Phone</label><Input value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} placeholder="+256-414-256881" /></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700">{submitting ? 'Creating...' : 'Create Blood Drive'}</Button>
      </div>
    </DialogContent>
  );
}

// Blood Drives Tab
function BloodDrivesTab() {
  const [drives, setDrives] = useState<BloodDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadDrives = useCallback(async () => { try { setDrives(await api.bloodDrives.list()); } catch {} finally { setLoading(false); } }, []);
  useEffect(() => { loadDrives(); }, [loadDrives]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blood drive?')) return;
    try { await api.bloodDrives.delete(id); toast({ title: 'Deleted' }); setDrives((prev) => prev.filter((d) => d.id !== id)); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await api.bloodDrives.update(id, { status }); toast({ title: `Status: ${status}` }); setDrives((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d))); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  if (loading) return <CardGridSkeleton count={3} />;

  return (
    <motion.div {...fadeInUp}>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-red-600" />Blood Drives</h2><p className="text-sm text-muted-foreground">{drives.length} drives total</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-1.5" />Add Blood Drive</Button></DialogTrigger>
          <AddBloodDriveDialog onClose={() => setDialogOpen(false)} onCreated={loadDrives} />
        </Dialog>
      </div>
      {drives.length === 0 ? (
        <Card className="border-border/50 border-dashed rounded-xl"><CardContent className="flex flex-col items-center justify-center py-16 text-center"><Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No blood drives yet</p><Button variant="outline" className="mt-4 text-red-600 border-red-200" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Create First Blood Drive</Button></CardContent></Card>
      ) : (
        <div className="space-y-4">{drives.map((drive) => {
          let days: string[] = [];
          try { days = JSON.parse(drive.scheduledDays); } catch { days = []; }
          return (
            <motion.div key={drive.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0"><Droplets className="h-5 w-5 text-red-600" /></div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold truncate">{drive.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-[10px] border ${getStatusVariant(drive.status)}`}>{drive.status}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{drive.city}, {drive.district}</span>
                          </div>
                        </div>
                      </div>
                      {drive.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{drive.description}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-red-400" /><span className="truncate">{drive.location}</span></div>
                        <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-red-400" /><span>{formatDate(drive.startDate)} - {formatDate(drive.endDate)}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-red-400" /><span>{drive.startTime} - {drive.endTime}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-red-400" /><span>{days.join(', ')}</span></div>
                        {drive.organizer && <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-red-400" /><span>{drive.organizer}</span></div>}
                        {drive.contactPhone && <div className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-red-400" /><span>{drive.contactPhone}</span></div>}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                      <div className="flex sm:flex-col gap-1">{DRIVE_STATUSES.map((s) => (
                        <button key={s} onClick={() => handleStatusChange(drive.id, s)} className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${drive.status === s ? getStatusVariant(s) : 'border-border/50 text-muted-foreground hover:border-red-200 hover:text-red-600'}`}>{s}</button>
                      ))}</div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8" onClick={() => handleDelete(drive.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}</div>
      )}
    </motion.div>
  );
}

// Record Donation Dialog
function RecordDonationDialog({ onClose }: { onClose: () => void }) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [donorSearch, setDonorSearch] = useState('');
  const { toast } = useToast();
  const [form, setForm] = useState({ donorId: '', centerId: '', bloodType: '', volumeMl: 450, notes: '' });

  useEffect(() => {
    async function load() { try { const [d, c] = await Promise.all([api.donors.list(), api.centers.list()]); setDonors(d); setCenters(c); } catch {} finally { setLoading(false); } }
    load();
  }, []);

  const filteredDonors = useMemo(() => {
    if (!donorSearch) return donors.slice(0, 20);
    return donors.filter((d) => d.name.toLowerCase().includes(donorSearch.toLowerCase()) || d.email.toLowerCase().includes(donorSearch.toLowerCase()));
  }, [donors, donorSearch]);

  const selectedDonor = useMemo(() => donors.find((d) => d.id === form.donorId), [donors, form.donorId]);

  const handleDonorSelect = (donorId: string) => {
    const donor = donors.find((d) => d.id === donorId);
    setForm((prev) => ({ ...prev, donorId, bloodType: donor?.bloodType || '' }));
  };

  const handleSubmit = async () => {
    if (!form.donorId || !form.centerId || !form.bloodType) { toast({ title: 'Validation Error', variant: 'destructive' }); return; }
    setSubmitting(true);
    try { await api.donations.create({ donorId: form.donorId, centerId: form.centerId, bloodType: form.bloodType, volumeMl: form.volumeMl }); toast({ title: 'Success', description: 'Donation recorded' }); onClose(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSubmitting(false); }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-red-600" />Record Donation</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Donor *</label>
              {form.donorId ? (
                <div className="flex items-center justify-between h-10 px-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2"><span className="text-sm">{selectedDonor?.name}</span>{selectedDonor?.bloodType && <BloodTypeBadge bloodType={selectedDonor.bloodType} size="sm" />}</div>
                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => { setForm((prev) => ({ ...prev, donorId: '', bloodType: '' })); setDonorSearch(''); }}><X className="h-3 w-3" /></Button>
                </div>
              ) : (
                <>
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search donor..." value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)} className="pl-9" /></div>
                  {donorSearch && (
                    <div className="max-h-40 overflow-y-auto rounded-md border bg-popover">
                      {filteredDonors.length > 0 ? filteredDonors.map((d) => (
                        <button key={d.id} className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50" onClick={() => handleDonorSelect(d.id)}><span>{d.name}</span><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{d.email}</span><BloodTypeBadge bloodType={d.bloodType} size="sm" /></div></button>
                      )) : <p className="text-xs text-muted-foreground p-3">No donors found</p>}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Center *</label>
              <Select value={form.centerId} onValueChange={(v) => setForm((prev) => ({ ...prev, centerId: v }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select center" /></SelectTrigger><SelectContent>{centers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.city}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Blood Type</label><Input value={form.bloodType} disabled className="bg-muted/50" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Volume (ml)</label><Input type="number" min={200} max={1000} value={form.volumeMl} onChange={(e) => setForm((prev) => ({ ...prev, volumeMl: parseInt(e.target.value) || 450 }))} /></div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting || loading || !form.donorId || !form.centerId} className="bg-red-600 hover:bg-red-700">{submitting ? 'Recording...' : 'Record Donation'}</Button>
      </div>
    </DialogContent>
  );
}

// Appointments Tab
function AppointmentsTab() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try { setAppointments(await api.appointments.list('')); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.appointments.update({ id, status: newStatus });
      toast({ title: `Appointment ${newStatus}`, description: 'Status updated successfully' });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-40" /><TableSkeleton /></div>;

  return (
    <motion.div {...fadeInUp}>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-red-600" />Appointments</h2>
          <p className="text-sm text-muted-foreground">{filteredAppointments.length} appointments</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {APPOINTMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card className="border-border/50 rounded-xl"><CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto"><Table><TableHeader><TableRow>
          <TableHead className="text-xs">Center</TableHead>
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs hidden md:table-cell">Time</TableHead>
          <TableHead className="text-xs">Status</TableHead>
          <TableHead className="text-xs text-right">Actions</TableHead>
        </TableRow></TableHeader><TableBody>
          {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
            <TableRow key={apt.id}>
              <TableCell className="text-sm font-medium">{apt.center?.name || 'Unknown'}</TableCell>
              <TableCell className="text-xs">{formatDate(apt.date)}</TableCell>
              <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{apt.timeSlot}</TableCell>
              <TableCell>
                <Badge className={`text-[10px] border ${getStatusVariant(apt.status)}`}>{apt.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {APPOINTMENT_STATUSES.filter((s) => s !== apt.status).map((s) => (
                    <button
                      key={s}
                      disabled={updatingId === apt.id}
                      onClick={() => handleStatusChange(apt.id, s)}
                      className="px-2 py-1 rounded text-[10px] font-medium border border-border/50 text-muted-foreground hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-50"
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )) : <TableRow><TableCell colSpan={5} className="text-center py-8">No appointments found</TableCell></TableRow>}
        </TableBody></Table></div>
      </CardContent></Card>
    </motion.div>
  );
}

// Donations Tab
function DonationsTab() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadDonations = useCallback(async () => { try { setDonations(await api.donations.list()); } catch {} finally { setLoading(false); } }, []);
  useEffect(() => { loadDonations(); }, [loadDonations]);

  const filteredDonations = useMemo(() => statusFilter === 'all' ? donations : donations.filter((d) => d.status === statusFilter), [donations, statusFilter]);

  if (loading) return <div className="space-y-4"><div className="flex justify-between"><Skeleton className="h-10 w-36" /><Skeleton className="h-10 w-40" /></div><TableSkeleton /></div>;

  return (
    <motion.div {...fadeInUp}>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent></Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" />Record Donation</Button></DialogTrigger>
          <RecordDonationDialog onClose={() => setDialogOpen(false)} />
        </Dialog>
      </div>
      <Card className="border-border/50 rounded-xl"><CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto"><Table><TableHeader><TableRow>
          <TableHead className="text-xs">Donor</TableHead><TableHead className="text-xs hidden md:table-cell">Center</TableHead><TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs text-center hidden sm:table-cell">Volume</TableHead><TableHead className="text-xs">Status</TableHead>
        </TableRow></TableHeader><TableBody>
          {filteredDonations.length > 0 ? filteredDonations.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="text-sm font-medium">{d.donor?.name || 'Unknown'}</TableCell>
              <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{d.center?.name}</TableCell>
              <TableCell className="text-xs">{formatDate(d.date)}</TableCell>
              <TableCell><BloodTypeBadge bloodType={d.bloodType} size="sm" /></TableCell>
              <TableCell className="text-xs text-center hidden sm:table-cell">{d.volumeMl}ml</TableCell>
              <TableCell><Badge variant={d.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">{d.status}</Badge></TableCell>
            </TableRow>
          )) : <TableRow><TableCell colSpan={6} className="text-center py-8">No donations</TableCell></TableRow>}
        </TableBody></Table></div>
      </CardContent></Card>
    </motion.div>
  );
}

// Main AdminView
export default function AdminView() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser || currentUser.role !== 'ADMIN') return <AccessDenied />;

  const navItems = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'donors', label: 'Donors', icon: Users },
    { value: 'appointments', label: 'Appointments', icon: CalendarDays },
    { value: 'centers', label: 'Centers', icon: MapPin },
    { value: 'donations', label: 'Donations', icon: Droplets },
    { value: 'blood-drives', label: 'Blood Drives', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div {...fadeInUp} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center"><ShieldAlert className="h-5 w-5 text-white" /></div>
            <div><h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Manage donors, centers, blood drives, and inventory</p></div>
          </div>
        </motion.div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div {...fadeInUp}>
            <TabsList className="mb-6 w-full sm:w-auto inline-flex h-auto p-1 bg-muted/50 rounded-xl">
              {navItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-red-600 transition-all">
                  <item.icon className="h-4 w-4" /><span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <TabsContent value="overview" className="mt-0"><OverviewTab /></TabsContent>
              <TabsContent value="donors" className="mt-0"><DonorsTab /></TabsContent>
              <TabsContent value="appointments" className="mt-0"><AppointmentsTab /></TabsContent>
              <TabsContent value="centers" className="mt-0"><CentersTab /></TabsContent>
              <TabsContent value="donations" className="mt-0"><DonationsTab /></TabsContent>
              <TabsContent value="blood-drives" className="mt-0"><BloodDrivesTab /></TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}