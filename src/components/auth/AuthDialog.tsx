'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function AuthDialog() {
  const { authDialogOpen, setAuthDialogOpen, authDialogMode, setAuthDialogMode, login, setCurrentView } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', phone: '', bloodType: '',
    gender: '', dateOfBirth: '', city: '', address: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login(loginForm.email, loginForm.password);
      login(res.user, res.token);
      setAuthDialogOpen(false);
      setLoginForm({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.register(registerForm);
      login(res.user, res.token);
      setAuthDialogOpen(false);
      setRegisterForm({ name: '', email: '', password: '', phone: '', bloodType: '', gender: '', dateOfBirth: '', city: '', address: '' });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError('');
    setAuthDialogMode(authDialogMode === 'login' ? 'register' : 'login');
  };

  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent className="max-w-md rounded-2xl border-border/50 p-0 shadow-2xl">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary to-red-700 px-6 pb-8 pt-6">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5" />
          <button
            onClick={() => setAuthDialogOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative z-10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {authDialogMode === 'login' ? 'Welcome Back' : 'Join LifeBlood'}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-1.5 text-sm text-white/80">
              {authDialogMode === 'login'
                ? 'Sign in to manage your donations'
                : 'Register to start saving lives'}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {authDialogMode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="h-11 rounded-lg border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="h-11 rounded-lg border-border/60 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 custom-scrollbar"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      placeholder="John Musoke"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      placeholder="+256 7XX XXX XXX"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Blood Type</Label>
                    <Select
                      value={registerForm.bloodType}
                      onValueChange={(v) => setRegisterForm({ ...registerForm, bloodType: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg border-border/60">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                          <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select
                      value={registerForm.gender}
                      onValueChange={(v) => setRegisterForm({ ...registerForm, gender: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg border-border/60">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      type="date"
                      value={registerForm.dateOfBirth}
                      onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">City</Label>
                    <Input
                      placeholder="Kampala"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Address</Label>
                    <Input
                      placeholder="Your address"
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                      className="h-10 rounded-lg border-border/60"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
