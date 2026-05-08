'use client';

import { motion } from 'framer-motion';
import {
  Droplets, Heart, Clock, ShieldCheck, BookOpen, HelpCircle,
  CheckCircle2, XCircle, AlertTriangle, Stethoscope, Activity,
  ClipboardList, Coffee, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppStore } from '@/lib/store';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export default function EducationView() {
  const { setCurrentView, setAuthDialogOpen, setAuthDialogMode, currentUser } = useAppStore();

  const facts = [
    { icon: <Heart className="h-6 w-6" />, title: 'Save 3 Lives', desc: 'A single blood donation can save up to three lives, as blood is separated into red cells, plasma, and platelets.', color: 'bg-primary/10 text-primary' },
    { icon: <Droplets className="h-6 w-6" />, title: 'Every 2 Seconds', desc: 'Someone in the world needs blood every two seconds. The demand for blood is constant and never stops.', color: 'bg-red-100 text-red-600' },
    { icon: <ShieldCheck className="h-6 w-6" />, title: 'Safe Process', desc: 'Blood donation is a safe process. All equipment is sterile and used only once. You cannot get diseases from donating.', color: 'bg-green-100 text-green-600' },
    { icon: <Activity className="h-6 w-6" />, title: 'Only 10 Minutes', desc: 'The actual blood donation process takes only 8-10 minutes. The entire appointment including screening takes about 45 minutes.', color: 'bg-sky-100 text-sky-600' },
    { icon: <AlertTriangle className="h-6 w-6" />, title: 'Blood Cannot Be Manufactured', desc: 'Blood cannot be artificially manufactured. It can only come from generous donors who voluntarily give their time and blood.', color: 'bg-amber-100 text-amber-600' },
    { icon: <Clock className="h-6 w-6" />, title: 'Donate Every 56 Days', desc: 'You can donate whole blood every 56 days (about 8 weeks). Your body replaces the donated blood within a few weeks.', color: 'bg-purple-100 text-purple-600' },
  ];

  const canDonate = [
    'You are between 17 and 65 years old',
    'You weigh at least 50kg (110 lbs)',
    'You are in good general health',
    'You have not donated blood in the last 56 days',
    'You have eaten a meal before donating',
    'You are well hydrated (drink water before)',
    'You have a valid identification document',
    'You have not had a tattoo in the last 6 months',
  ];

  const cannotDonate = [
    'You are pregnant or breastfeeding',
    'You have a cold, flu, or active infection',
    'You have HIV, hepatitis B or C, or syphilis',
    'You have low hemoglobin (below 12.5 g/dL)',
    'You have recently had surgery or major illness',
    'You are taking certain medications',
    'You have had a tattoo or piercing in the last 6 months',
    'You have traveled to malaria-endemic areas recently',
  ];

  const steps = [
    { icon: <ClipboardList className="h-6 w-6" />, title: '1. Registration', desc: 'Fill out a donor registration form with your personal details, medical history, and consent form. Bring a valid ID.' },
    { icon: <Stethoscope className="h-6 w-6" />, title: '2. Health Screening', desc: 'A brief medical check including blood pressure, hemoglobin level, pulse, and a confidential health questionnaire.' },
    { icon: <Droplets className="h-6 w-6" />, title: '3. The Donation', desc: 'A trained professional cleans your arm and inserts a sterile needle. The actual donation takes only 8-10 minutes. About 450ml is collected.' },
    { icon: <Coffee className="h-6 w-6" />, title: '4. Rest & Refreshments', desc: 'After donating, rest for 10-15 minutes and enjoy light refreshments provided. Drink extra fluids throughout the day.' },
    { icon: <ShieldCheck className="h-6 w-6" />, title: '5. Post-Donation Care', desc: 'Keep the bandage on for 4-6 hours. Avoid heavy lifting for 24 hours. Eat iron-rich foods and stay well hydrated.' },
  ];

  const compatibilityData = [
    { type: 'O-', canDonateTo: 'All Types', canReceiveFrom: 'O-', label: 'Universal Donor' },
    { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-', label: 'Common' },
    { type: 'A-', canDonateTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-', label: 'Type A' },
    { type: 'A+', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-', label: 'Type A+' },
    { type: 'B-', canDonateTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-', label: 'Type B' },
    { type: 'B+', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-', label: 'Type B+' },
    { type: 'AB-', canDonateTo: 'AB+, AB-', canReceiveFrom: 'A-, B-, AB-, O-', label: 'Rare' },
    { type: 'AB+', canDonateTo: 'AB+', canReceiveFrom: 'All Types', label: 'Universal Recipient' },
  ];

  const faqs = [
    {
      q: 'How long does it take to donate blood?',
      a: 'The entire process takes about 45 minutes, but the actual blood collection only takes 8-10 minutes. This includes registration, health screening, the donation itself, and a short rest period afterward.',
    },
    {
      q: 'Is blood donation safe?',
      a: 'Yes, blood donation is very safe. A new, sterile needle is used for each donor and then discarded. You cannot contract any disease from donating blood. Trained professionals supervise the entire process.',
    },
    {
      q: 'How often can I donate blood?',
      a: 'You can donate whole blood every 56 days (about 8 weeks). This gives your body enough time to replenish the red blood cells. Platelet donors can donate more frequently, up to 24 times a year.',
    },
    {
      q: 'What should I do before donating blood?',
      a: 'Get a good night\'s sleep, eat a healthy meal, drink plenty of water, and avoid fatty foods. Do not fast before donating. Bring a valid form of identification.',
    },
    {
      q: 'What happens to my blood after donation?',
      a: 'Your blood is tested for safety, separated into components (red cells, plasma, and platelets), and stored under controlled conditions. It is then distributed to hospitals where it is used for surgeries, trauma care, cancer treatment, and more.',
    },
    {
      q: 'Can I donate if I have a medical condition?',
      a: 'It depends on the condition. Some conditions may temporarily or permanently defer you. Be honest during the health screening and discuss any concerns with the medical staff. They will determine if it is safe for you to donate.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div {...fadeUp} className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Learn About Blood Donation
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Understanding the donation process helps you prepare and feel confident. Learn about eligibility, the process, and how your donation saves lives in Uganda.
        </p>
      </motion.div>

      {/* Quick Facts */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }} className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Did You Know?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact, i) => (
            <motion.div
              key={fact.title}
              {...stagger}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Card className="group h-full border-border/50 bg-white transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${fact.color} transition-transform group-hover:scale-110`}>
                    {fact.icon}
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{fact.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{fact.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Eligibility Section */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Eligibility Criteria</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" /> You CAN Donate If
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {canDonate.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" /> You CANNOT Donate If
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {cannotDonate.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Donation Process Steps */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }} className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">The Donation Process</h2>
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-6 top-12 hidden h-[calc(100%-48px)] w-0.5 bg-gradient-to-b from-primary/20 to-transparent md:block" />
          <div className="space-y-4 md:space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="border-border/50 bg-white transition-all hover:shadow-md">
                  <CardContent className="flex gap-4 p-5 md:p-6">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Blood Type Compatibility */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Blood Type Compatibility</h2>
        <div className="overflow-x-auto">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="min-w-[600px]">
                {/* Header */}
                <div className="mb-3 grid grid-cols-[80px_1fr_1fr_100px] gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Type</span>
                  <span>Can Donate To</span>
                  <span>Can Receive From</span>
                  <span>Note</span>
                </div>
                <div className="space-y-2">
                  {compatibilityData.map((bt) => (
                    <div
                      key={bt.type}
                      className="grid grid-cols-[80px_1fr_1fr_100px] gap-3 items-center rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/30"
                    >
                      <span className="text-base font-extrabold text-primary">{bt.type}</span>
                      <span className="text-sm text-foreground">{bt.canDonateTo}</span>
                      <span className="text-sm text-muted-foreground">{bt.canReceiveFrom}</span>
                      <Badge variant="outline" className="text-xs justify-self-center">{bt.label}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }} className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-primary to-red-700 p-8 text-center">
            <Droplets className="mx-auto mb-4 h-10 w-10 text-white/90" />
            <h3 className="mb-2 text-2xl font-bold text-white">Ready to Donate?</h3>
            <p className="mb-6 max-w-md mx-auto text-white/80">
              Now that you know what to expect, schedule your appointment and help save lives in Uganda.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {currentUser ? (
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  onClick={() => setCurrentView('appointments')}
                >
                  Schedule Appointment
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  onClick={() => { setAuthDialogMode('register'); setAuthDialogOpen(true); }}
                >
                  Register to Donate
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setCurrentView('centers')}
              >
                Find a Center
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
