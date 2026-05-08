'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Building2,
  Filter,
  Droplets,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAppStore, type DonationCenter } from '@/lib/store';

const CITIES = ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu'] as const;
const TYPES = ['Hospital', 'Clinic'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function CenterCardSkeleton() {
  return (
    <Card className="border-border/50 rounded-xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6">
        <Building2 className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {hasFilters ? 'No centers found' : 'No centers available'}
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {hasFilters
          ? 'Try adjusting your search or filter criteria to find donation centers nearby.'
          : 'There are currently no donation centers listed. Please check back later.'}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          onClick={() => {
            const searchInput = document.querySelector(
              'input[placeholder*="Search"]'
            ) as HTMLInputElement;
            if (searchInput) searchInput.value = '';
            const citySelect = document.querySelector(
              '[data-city-select]'
            ) as HTMLButtonElement;
            if (citySelect) citySelect.click();
          }}
          className="rounded-lg"
        >
          Clear all filters
        </Button>
      )}
    </motion.div>
  );
}

function CenterCard({
  center,
  index,
}: {
  center: DonationCenter;
  index: number;
}) {
  const { setSelectedCenter, setCurrentView, currentUser, setAuthDialogOpen } =
    useAppStore();

  const totalUnits = center.inventory?.reduce((sum, item) => sum + item.units, 0) ?? 0;
  const handleViewDetails = () => {
    setSelectedCenter(center);
    setCurrentView('center-detail');
  };

  const handleBookAppointment = () => {
    if (!currentUser) {
      setAuthDialogOpen(true);
      return;
    }
    setSelectedCenter(center);
    setCurrentView('appointments');
  };

  const typeColor =
    center.type === 'Hospital'
      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="border-border/50 rounded-xl h-full hover:border-red-200 dark:hover:border-red-800/50 transition-colors duration-300 overflow-hidden group">
        <CardContent className="p-6 flex flex-col h-full gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground leading-tight truncate">
                {center.name}
              </h3>
              <Badge
                variant="secondary"
                className={`text-xs font-medium ${typeColor} border-0`}
              >
                {center.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 shrink-0">
              <Droplets className="w-3.5 h-3.5 text-red-500" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {totalUnits}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span className="line-clamp-2">{center.address}</span>
            </div>
            {center.phone && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-red-400" />
                <span>{center.phone}</span>
              </div>
            )}
            {center.operatingHours && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0 text-red-400" />
                <span>{center.operatingHours}</span>
              </div>
            )}
          </div>

          {/* City and district */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs font-normal">
              <MapPin className="w-3 h-3 mr-1" />
              {center.city}
            </Badge>
            {center.district && (
              <Badge variant="outline" className="text-xs font-normal">
                {center.district}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1 rounded-lg group/btn"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
            <Button
              size="sm"
              onClick={handleBookAppointment}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              <CalendarCheck className="w-4 h-4 mr-1.5" />
              Book
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CentersView() {
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    api.centers
      .list()
      .then((data) => {
        if (!cancelled) {
          setCenters(data);
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
  }, []);

  const filteredCenters = useMemo(() => {
    const q = search.toLowerCase().trim();
    return centers.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q);
      const matchesCity = cityFilter === 'all' || c.city === cityFilter;
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesCity && matchesType;
    });
  }, [centers, search, cityFilter, typeFilter]);

  const hasActiveFilters = search.trim() !== '' || cityFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-red-50/40 dark:to-red-950/10">
      {/* Page Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Donation Centers
              </h1>
              {!loading && (
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-3 py-1">
                  {centers.length} {centers.length === 1 ? 'center' : 'centers'}
                </Badge>
              )}
            </div>
            <p className="text-red-100 text-lg max-w-2xl">
              Find blood donation centers across Uganda. Every donation can save up to three lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="border-border/50 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Search & Filter
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-lg"
                />
              </div>

              {/* City filter */}
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="rounded-lg">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-lg">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active filter indicators */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Showing</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredCenters.length} result{filteredCenters.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setCityFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-xs h-6 ml-auto text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </section>

      {/* Centers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={cardVariants}>
                <CenterCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Failed to load centers</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                setError(null);
                api.centers
                  .list()
                  .then(setCenters)
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              className="rounded-lg"
            >
              Try again
            </Button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCenters.length === 0 && (
          <EmptyState hasFilters={hasActiveFilters} />
        )}

        {/* Grid */}
        {!loading && !error && filteredCenters.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${search}-${cityFilter}-${typeFilter}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCenters.map((center, index) => (
              <CenterCard key={center.id} center={center} index={index} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
