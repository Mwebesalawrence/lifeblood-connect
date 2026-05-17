'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, Heart, ShieldCheck, Clock, MapPin, CalendarDays,
  Award, BarChart3, Users, ArrowRight, CheckCircle2,
  TrendingUp, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { setCurrentView, setAuthDialogOpen, setAuthDialogMode } = useAppStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  const handleGetStarted = () => {
    if (useAppStore.getState().currentUser) {
      setCurrentView('dashboard');
    } else {
      setAuthDialogMode('register');
      setAuthDialogOpen(true);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-red-100/40 blur-3xl" />
          {/* Floating blood drops */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/10"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Droplets className="h-8 w-8" />
            </motion.div>
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Heart className="mr-1.5 h-3.5 w-3.5" />
                Saving Lives Across Uganda
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Every Drop Counts,{' '}
                <span className="bg-gradient-to-r from-primary to-red-700 bg-clip-text text-transparent">
                  Every Donor Saves a Life
                </span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                LifeBlood Connect bridges the gap between willing donors and those in need. Register, schedule donations, track your impact, and join a community of life-savers across Uganda.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-13 rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02]"
                  onClick={handleGetStarted}
                >
                  <Droplets className="mr-2 h-5 w-5" /> Become a Donor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-xl border-border/60 px-8 text-base font-semibold transition-all hover:bg-muted"
                  onClick={() => setCurrentView('centers')}
                >
                  <MapPin className="mr-2 h-5 w-5" /> Find a Center
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {['J', 'P', 'D', 'G'].map((letter, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary to-red-600 text-xs font-bold text-white"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">2,400+ Active Donors</p>
                  <p className="text-xs text-muted-foreground">Join our growing community</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto w-full max-w-md">
                {/* Main blood drop visual */}
                <div className="relative mx-auto flex h-80 w-80 items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-red-50"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                      className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-red-100"
                    >
                      <Droplets className="h-20 w-20 text-primary" />
                    </motion.div>
                  </motion.div>
                  {/* Orbiting badges */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="absolute left-0 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-lg">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute right-0 top-1/2 flex h-14 w-14 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-lg">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-lg">
                      <Activity className="h-6 w-6 text-orange-500" />
                    </div>
                  </motion.div>
                </div>
                {/* Stats mini cards */}
                <div className="absolute -right-4 bottom-12 rounded-xl bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <p className="text-sm font-bold text-foreground">+147 Donations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-4 top-16 rounded-xl bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">New Donors</p>
                      <p className="text-sm font-bold text-foreground">+52 This Week</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-y border-border/40 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: 'Registered Donors', value: stats?.totalDonors || 2400, icon: <Users className="h-6 w-6" />, color: 'text-primary' },
              { label: 'Donations Made', value: stats?.totalDonations || 8750, icon: <Droplets className="h-6 w-6" />, color: 'text-red-600' },
              { label: 'Donation Centers', value: stats?.activeCenters || 6, icon: <MapPin className="h-6 w-6" />, color: 'text-orange-500' },
              { label: 'Lives Saved', value: stats?.totalDonations ? stats.totalDonations * 3 : 26250, icon: <Heart className="h-6 w-6" />, color: 'text-green-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-foreground">
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 bg-primary/10 text-primary">
              Features
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to{' '}
              <span className="text-primary">Save Lives</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our comprehensive platform makes blood donation simple, accessible, and rewarding for everyone in Uganda.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: 'Easy Registration',
                desc: 'Sign up in minutes with a simple form. Provide your details, blood type, and start your journey as a life-saving donor.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: 'Track Donations',
                desc: 'View your complete donation history, monitor your eligibility status, and see the real impact of every donation you make.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: <MapPin className="h-6 w-6" />,
                title: 'Find Centers',
                desc: 'Locate nearby donation centers across Uganda with our location-based directory. Filter by city, type, and operating hours.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: <CalendarDays className="h-6 w-6" />,
                title: 'Schedule Appointments',
                desc: 'Book donation appointments at your preferred center and time slot. Never miss your next eligible donation date.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: 'Rewards & Recognition',
                desc: 'Earn points and badges for every donation. Climb the leaderboard and get recognized for your life-saving contributions.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: 'Smart Reminders',
                desc: 'Receive timely notifications when you become eligible to donate again. Stay hydrated, eat well, and show up prepared.',
                color: 'bg-sky-100 text-sky-600',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.08, duration: 0.5 }}
              >
                <Card className="group h-full border-border/50 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 bg-primary/10 text-primary">
              How It Works
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Three Simple Steps to{' '}
              <span className="text-primary">Save a Life</span>
            </h2>
          </motion.div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connection line */}
            <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />

            {[
              {
                step: '01',
                title: 'Register',
                desc: 'Create your donor profile with your details and blood type. It only takes a few minutes to get started on your life-saving journey.',
                icon: <Users className="h-7 w-7" />,
              },
              {
                step: '02',
                title: 'Schedule',
                desc: 'Browse nearby donation centers and book an appointment at a time that works for you. Choose from available time slots.',
                icon: <CalendarDays className="h-7 w-7" />,
              },
              {
                step: '03',
                title: 'Donate',
                desc: 'Visit the center, complete the donation process, and earn reward points. Track your impact and inspire others to join.',
                icon: <Heart className="h-7 w-7" />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-primary/10" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
                    {item.icon}
                  </div>
                </div>
                <div className="mb-2 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  Step {item.step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Types Info */}
      <section className="bg-gray-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 bg-primary/10 text-primary">
              Blood Types
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Know Your{' '}
              <span className="text-primary">Blood Type</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Understanding blood types is crucial for donation. Here&apos;s a quick overview of the distribution and importance of each type.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { type: 'O+', label: 'Universal Donor (Positive)', pct: '38%', note: 'Most common, can donate to all positive types' },
              { type: 'O-', label: 'Universal Donor', pct: '6%', note: 'Can donate to all blood types — most needed' },
              { type: 'A+', label: 'Common Type', pct: '24%', note: 'Second most common blood type' },
              { type: 'A-', label: 'Rare Type', pct: '5%', note: 'Can donate to A+ and A- recipients' },
              { type: 'B+', label: 'Common Type', pct: '8%', note: 'Found commonly in East African populations' },
              { type: 'B-', label: 'Rare Type', pct: '2%', note: 'Very rare, always in high demand' },
              { type: 'AB+', label: 'Universal Recipient', pct: '3%', note: 'Can receive from all blood types' },
              { type: 'AB-', label: 'Rarest Type', pct: '1%', note: 'Rarest of all, critical for emergencies' },
            ].map((bt, i) => (
              <motion.div
                key={bt.type}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.05, duration: 0.4 }}
              >
                <Card className="border-border/50 bg-white transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-extrabold text-primary">
                      {bt.type}
                    </div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{bt.label}</p>
                    <p className="mb-1 text-2xl font-bold text-foreground">{bt.pct}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">{bt.note}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 bg-primary/10 text-primary">
              Testimonials
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Real Stories from{' '}
              <span className="text-primary">Real Donors</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'John Musoke',
                role: 'Regular Donor, Kampala',
                quote: 'LifeBlood Connect made it so easy to track my donations and schedule appointments. The reminders are a game changer — I never miss my eligible date now.',
                donations: 8,
                initials: 'JM',
              },
              {
                name: 'Grace Ainen',
                role: 'Life Saver, Jinja',
                quote: 'As a nurse, I see firsthand the impact of blood shortages. This platform helps us connect willing donors with hospitals that desperately need blood supplies.',
                donations: 12,
                initials: 'GA',
              },
              {
                name: 'Peace Nakamya',
                role: 'Student Donor, Kampala',
                quote: 'I was nervous about donating for the first time, but the education resources on this platform prepared me well. Now I donate regularly and have earned several badges!',
                donations: 4,
                initials: 'PN',
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                {...stagger}
                transition={{ ...stagger.transition, delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 bg-white">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Heart key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-red-600 text-sm font-bold text-white">
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto rounded-full bg-primary/10 text-xs text-primary">
                        {t.donations} donations
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-red-600 to-red-800 py-20">
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
        </div>
        <motion.div {...fadeUp} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Every blood donation can save up to three lives. Join thousands of Ugandan donors who are making a real impact in their communities.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="h-13 rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-xl transition-all hover:bg-white/90 hover:scale-[1.02]"
              onClick={handleGetStarted}
            >
              <Droplets className="mr-2 h-5 w-5" /> Register Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 rounded-xl border-white/30 px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
              onClick={() => setCurrentView('education')}
            >
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            {[
              <CheckCircle2 key="c1" className="mr-1.5 h-4 w-4 inline" />,
              <CheckCircle2 key="c2" className="mr-1.5 h-4 w-4 inline" />,
              <CheckCircle2 key="c3" className="mr-1.5 h-4 w-4 inline" />,
            ].map((_, i) => (
              <span key={i} className="flex items-center">
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                {['Free Registration', 'Track Your Impact', 'Earn Rewards'][i]}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
