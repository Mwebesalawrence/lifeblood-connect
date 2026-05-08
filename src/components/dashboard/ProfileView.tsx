'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, CalendarDays, Droplets,
  Heart, Award, Edit3, Save, X, ArrowLeft, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, UserReward } from '@/lib/store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function ProfileView() {
  const { currentUser, updateUser, setCurrentView } = useAppStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [form, setForm] = useState({
    name: '', phone: '', bloodType: '', gender: '', city: '', address: '',
  });

  useEffect(() => {
    if (!currentUser) return;
    api.donors.get(currentUser.id)
      .then((data: any) => {
        setUserRewards(data.rewards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser?.id]);

  // Sync form with currentUser when not editing
  const currentFormData = editing ? form : {
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    bloodType: currentUser?.bloodType || '',
    gender: currentUser?.gender || '',
    city: currentUser?.city || '',
    address: currentUser?.address || '',
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const updated = await api.donors.update(currentUser.id, form);
      updateUser(updated);
      setEditing(false);
      toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const livesSaved = currentUser.totalDonations * 3;
  const joinDate = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <motion.div {...fadeUp} className="mb-6">
        <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </motion.div>

      {/* Profile Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }} className="mb-8">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-red-700 relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-primary to-red-600 text-3xl font-bold text-white shadow-lg">
                  {currentUser.name?.charAt(0)}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-foreground">{currentUser.name}</h1>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {currentUser.email}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {currentUser.bloodType && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                        <Droplets className="mr-1 h-3 w-3" /> {currentUser.bloodType}
                      </Badge>
                    )}
                    {currentUser.city && (
                      <Badge variant="outline">
                        <MapPin className="mr-1 h-3 w-3" /> {currentUser.city}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <CalendarDays className="mr-1 h-3 w-3" /> Since {joinDate}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant={editing ? 'outline' : 'default'}
                className={editing ? '' : 'bg-primary text-white shadow-md shadow-primary/25'}
                onClick={() => editing ? setEditing(false) : setEditing(true)}
              >
                {editing ? <X className="mr-1.5 h-4 w-4" /> : <Edit3 className="mr-1.5 h-4 w-4" />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Stats + Achievements */}
        <div className="space-y-6 lg:col-span-1">
          {/* Stats */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Donations', value: currentUser.totalDonations, icon: <Droplets className="h-4 w-4" />, color: 'text-primary' },
                  { label: 'Points', value: currentUser.points, icon: <Award className="h-4 w-4" />, color: 'text-amber-600' },
                  { label: 'Lives Saved', value: livesSaved, icon: <Heart className="h-4 w-4" />, color: 'text-green-600' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {stat.icon} {stat.label}
                    </span>
                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-amber-500" /> Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                  </div>
                ) : userRewards.length === 0 ? (
                  <div className="py-4 text-center">
                    <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No achievements yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userRewards.map((ur) => (
                      <div key={ur.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-white p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg">
                          {ur.reward?.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{ur.reward?.name}</p>
                          <p className="text-xs text-muted-foreground">{ur.reward?.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Profile Form */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm font-medium">Full Name</Label>
                  {editing ? (
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm">{currentUser.name || 'Not set'}</p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {currentUser.email}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Phone</Label>
                  {editing ? (
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+256 7XX XXX XXX" className="h-10" />
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {currentUser.phone || 'Not set'}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Blood Type</Label>
                  {editing ? (
                    <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                          <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm flex items-center gap-2">
                      <Droplets className="h-3.5 w-3.5 text-primary" /> {currentUser.bloodType || 'Not set'}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Gender</Label>
                  {editing ? (
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm">{currentUser.gender || 'Not set'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm">
                    {currentUser.dateOfBirth
                      ? new Date(currentUser.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">City</Label>
                  {editing ? (
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kampala" className="h-10" />
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {currentUser.city || 'Not set'}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Address</Label>
                  {editing ? (
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" className="h-10" />
                  ) : (
                    <p className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm">{currentUser.address || 'Not set'}</p>
                  )}
                </div>
              </div>
              {editing && (
                <Button
                  className="mt-6 w-full bg-primary text-white hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
