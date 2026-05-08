'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { loginAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSwitchMode: () => void;
  onClose: () => void;
}

export default function LoginForm({ onSwitchMode, onClose }: LoginFormProps) {
  const { login } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await loginAPI(email, password);
      login(user, token);
      onClose();
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.name}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sign In
      </Button>
      <div className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchMode} className="text-red-600 hover:underline font-medium">
          Register now
        </button>
      </div>
      <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
        <p className="mb-1">Demo accounts:</p>
        <p>Admin: admin@bloodconnect.ug / admin123</p>
        <p>Donor: john.musoke@gmail.com / donor123</p>
      </div>
    </form>
  );
}
