'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { registerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSwitchMode: () => void;
  onClose: () => void;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterForm({ onSwitchMode, onClose }: RegisterFormProps) {
  const { login } = useAppStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodType: '',
    gender: '',
    dateOfBirth: '',
    city: '',
    address: '',
  });

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Error', description: 'Name, email, and password are required', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await registerAPI({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        bloodType: form.bloodType || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        city: form.city || undefined,
        address: form.address || undefined,
      });
      login(user, token);
      onClose();
      toast({
        title: 'Welcome to LifeBlood Connect!',
        description: 'Your account has been created successfully.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="reg-name">Full Name *</Label>
          <Input id="reg-name" placeholder="John Musoke" value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="h-10" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="reg-email">Email *</Label>
          <Input id="reg-email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="h-10" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="reg-password">Password * (min 6 chars)</Label>
          <Input id="reg-password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone">Phone</Label>
          <Input id="reg-phone" placeholder="+256-7xx" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-blood">Blood Type</Label>
          <Select value={form.bloodType} onValueChange={(v) => updateForm('bloodType', v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-gender">Gender</Label>
          <Select value={form.gender} onValueChange={(v) => updateForm('gender', v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-dob">Date of Birth</Label>
          <Input id="reg-dob" type="date" value={form.dateOfBirth} onChange={(e) => updateForm('dateOfBirth', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-city">City</Label>
          <Input id="reg-city" placeholder="Kampala" value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-address">Address</Label>
          <Input id="reg-address" placeholder="Street address" value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="h-10" />
        </div>
      </div>
      <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white mt-2" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create Account
      </Button>
      <div className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchMode} className="text-red-600 hover:underline font-medium">
          Sign in
        </button>
      </div>
    </form>
  );
}
