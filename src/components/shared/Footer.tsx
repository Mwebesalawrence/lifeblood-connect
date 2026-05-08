'use client';

import { Droplets, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Footer() {
  const { setCurrentView, setAuthDialogOpen, setAuthDialogMode } = useAppStore();

  return (
    <footer className="border-t border-border/40 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Life<span className="text-primary">Blood</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A digital blood donation management and donor engagement system connecting donors with donation centers across Uganda.
            </p>
            <div className="flex gap-1 text-muted-foreground">
              {[1, 2, 3, 4, 5].map((i) => (
                <Heart key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-primary text-primary' : ''}`} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Donation Centers', view: 'centers' },
                { label: 'Schedule Appointment', view: 'appointments' },
                { label: 'Rewards Program', view: 'rewards' },
                { label: 'Learn About Donation', view: 'education' },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => setCurrentView(item.view as any)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Nakasero Hill Road, Kampala, Uganda
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +256 414 256 881
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                info@lifeblood.ug
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Join Us</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Register today and help save lives through blood donation. Every drop counts.
            </p>
            <button
              onClick={() => {
                if (!useAppStore.getState().currentUser) {
                  setAuthDialogMode('register');
                  setAuthDialogOpen(true);
                } else {
                  setCurrentView('dashboard');
                }
              }}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Become a Donor
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LifeBlood Connect. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for Uganda Blood Transfusion Service
          </p>
        </div>
      </div>
    </footer>
  );
}
