import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];

function randomDate(daysBack: number, daysForward: number = 0): Date {
  const now = new Date();
  const offset = Math.floor(Math.random() * (daysBack + daysForward + 1)) - daysBack;
  now.setDate(now.getDate() + offset);
  return now;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.bloodDrive.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userReward.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.donationCenter.deleteMany();
  await prisma.user.deleteMany();

  // Create rewards
  const rewards = await Promise.all([
    prisma.reward.create({ data: { name: 'First Donation', description: 'Made your first blood donation', icon: 'drop', pointsRequired: 10, type: 'BADGE' } }),
    prisma.reward.create({ data: { name: 'Regular Donor', description: 'Donated blood 3 times', icon: 'star', pointsRequired: 25, type: 'BADGE' } }),
    prisma.reward.create({ data: { name: 'Five Club', description: 'Donated blood 5 times', icon: 'handshake', pointsRequired: 50, type: 'BADGE' } }),
    prisma.reward.create({ data: { name: 'Life Saver', description: 'Donated blood 10 times', icon: 'heart', pointsRequired: 100, type: 'BADGE' } }),
    prisma.reward.create({ data: { name: 'Hero Award', description: 'Donated blood 15 times', icon: 'trophy', pointsRequired: 150, type: 'ACHIEVEMENT' } }),
    prisma.reward.create({ data: { name: 'Community Champion', description: 'Outstanding contribution to blood donation', icon: 'medal', pointsRequired: 200, type: 'ACHIEVEMENT' } }),
  ]);

  // Create donation centers
  const centers = await Promise.all([
    prisma.donationCenter.create({
      data: { name: 'Uganda Blood Transfusion Service - Nakasero', address: '1 Nakasero Hill Road', city: 'Kampala', district: 'Kampala Central', latitude: 0.3132, longitude: 32.5816, phone: '+256-414-256881', email: 'info@ubts.go.ug', operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM', type: 'HOSPITAL' }
    }),
    prisma.donationCenter.create({
      data: { name: 'Mulago National Referral Hospital', address: 'Mulago Hill Road', city: 'Kampala', district: 'Kawempe', latitude: 0.3476, longitude: 32.5825, phone: '+256-414-540581', email: 'bloodbank@mulago.go.ug', operatingHours: 'Mon-Sat: 7:00 AM - 6:00 PM', type: 'HOSPITAL' }
    }),
    prisma.donationCenter.create({
      data: { name: 'Entebbe Regional Referral Hospital', address: 'Port Bell Road', city: 'Entebbe', district: 'Wakiso', latitude: 0.0469, longitude: 32.4635, phone: '+256-414-321234', email: 'bloodbank@entebbehosp.go.ug', operatingHours: 'Mon-Fri: 8:00 AM - 4:00 PM', type: 'HOSPITAL' }
    }),
    prisma.donationCenter.create({
      data: { name: 'Jinja Regional Referral Hospital', address: 'Main Street', city: 'Jinja', district: 'Jinja', latitude: 0.4361, longitude: 33.2051, phone: '+256-434-121234', operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM', type: 'HOSPITAL' }
    }),
    prisma.donationCenter.create({
      data: { name: 'Mbarara Regional Referral Hospital', address: 'Mbarara-Kampala Road', city: 'Mbarara', district: 'Mbarara', latitude: -0.6079, longitude: 30.6548, phone: '+256-485-421234', operatingHours: 'Mon-Fri: 8:00 AM - 4:30 PM', type: 'HOSPITAL' }
    }),
    prisma.donationCenter.create({
      data: { name: 'Gulu Regional Referral Hospital', address: 'Kampala Road', city: 'Gulu', district: 'Gulu', latitude: 2.7745, longitude: 32.2990, phone: '+256-471-431234', operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM', type: 'CLINIC' }
    }),
  ]);

  // Create inventory for each center
  for (const center of centers) {
    for (const bt of BLOOD_TYPES) {
      await prisma.bloodInventory.create({
        data: { centerId: center.id, bloodType: bt, units: Math.floor(Math.random() * 30) + 5 },
      });
    }
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bloodconnect.ug',
      password: 'admin123',
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+256-700-000001',
      bloodType: 'O+',
    },
  });

  // Create donor users
  const donorData = [
    { email: 'john.musoke@gmail.com', password: 'donor123', name: 'John Musoke', phone: '+256-771-234567', bloodType: 'A+', gender: 'Male', city: 'Kampala', address: 'Makerere Hill Road', points: 100, totalDonations: 8 },
    { email: 'peace.nakamya@gmail.com', password: 'donor123', name: 'Peace Nakamya', phone: '+256-782-345678', bloodType: 'O+', gender: 'Female', city: 'Kampala', address: 'Bukoto', points: 50, totalDonations: 4 },
    { email: 'david.okello@gmail.com', password: 'donor123', name: 'David Okello', phone: '+256-773-456789', bloodType: 'B-', gender: 'Male', city: 'Gulu', address: 'Layibi', points: 25, totalDonations: 2 },
    { email: 'grace.ainen@gmail.com', password: 'donor123', name: 'Grace Ainen', phone: '+256-774-567890', bloodType: 'AB+', gender: 'Female', city: 'Jinja', address: 'Walukuba', points: 150, totalDonations: 12 },
    { email: 'robert.tumwesige@gmail.com', password: 'donor123', name: 'Robert Tumwesige', phone: '+256-775-678901', bloodType: 'O-', gender: 'Male', city: 'Mbarara', address: 'Ruharo', points: 75, totalDonations: 6 },
    { email: 'sarah.babiiha@gmail.com', password: 'donor123', name: 'Sarah Babiiha', phone: '+256-776-789012', bloodType: 'A-', gender: 'Female', city: 'Entebbe', address: 'Kitoro', points: 10, totalDonations: 1 },
  ];

  const donors: any[] = [];
  for (const d of donorData) {
    const lastDonationDate = d.totalDonations > 0 ? randomDate(120, 0) : undefined;
    const nextEligible = lastDonationDate ? new Date(lastDonationDate) : undefined;
    if (nextEligible) nextEligible.setDate(nextEligible.getDate() + 56);

    const donor = await prisma.user.create({
      data: {
        ...d,
        country: 'Uganda',
        dateOfBirth: randomDate(7300, 12000),
        isEligible: !lastDonationDate || new Date() > (nextEligible || new Date()),
        lastDonationDate,
        nextEligibleDate: nextEligible,
      },
    });
    donors.push(donor);
  }

  // Create donations
  for (const donor of donors) {
    const numDonations = Math.min(donor.totalDonations, 8);
    for (let i = 0; i < numDonations; i++) {
      const center = randomItem(centers);
      const date = randomDate(365 - (i * 45), 0);
      await prisma.donation.create({
        data: {
          donorId: donor.id,
          centerId: center.id,
          date,
          bloodType: donor.bloodType || randomItem(BLOOD_TYPES),
          volumeMl: 450,
          status: 'COMPLETED',
        },
      });
    }
  }

  // Create appointments
  const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  for (const donor of donors) {
    const numAppts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numAppts; i++) {
      const center = randomItem(centers);
      const date = randomDate(14, 30);
      await prisma.appointment.create({
        data: {
          donorId: donor.id,
          centerId: center.id,
          date,
          timeSlot: randomItem(TIME_SLOTS),
          status: i === 0 ? 'SCHEDULED' : randomItem(statuses),
        },
      });
    }
  }

  // Assign rewards to donors
  for (const donor of donors) {
    for (const reward of rewards) {
      if (donor.points >= reward.pointsRequired) {
        await prisma.userReward.upsert({
          where: { userId_rewardId: { userId: donor.id, rewardId: reward.id } },
          update: {},
          create: { userId: donor.id, rewardId: reward.id },
        });
      }
    }
  }

  // Create notifications
  const notifData = [
    { userId: donors[0].id, title: 'Welcome to LifeBlood Connect!', message: 'Thank you for registering. You can now book appointments and track your donation history.', type: 'INFO' },
    { userId: donors[0].id, title: 'You are eligible to donate!', message: 'It has been 56 days since your last donation. Schedule your next appointment today.', type: 'REMINDER' },
    { userId: donors[1].id, title: 'Appointment Reminder', message: 'Your appointment is coming up soon. Please remember to eat well and stay hydrated.', type: 'APPOINTMENT' },
    { userId: donors[2].id, title: 'New Badge Earned!', message: 'Congratulations! You earned the Regular Donor badge.', type: 'ACHIEVEMENT' },
    { userId: donors[3].id, title: 'Blood Drive This Weekend', message: 'Join our blood drive at Mulago Hospital this Saturday from 8 AM to 4 PM.', type: 'INFO' },
    { userId: donors[4].id, title: 'Thank You, Hero!', message: 'Your 6th donation has helped save lives. Every drop counts!', type: 'ACHIEVEMENT' },
  ];

  for (const n of notifData) {
    await prisma.notification.create({ data: n });
  }

  // Create blood drives
  const bloodDrives = await Promise.all([
    prisma.bloodDrive.create({
      data: {
        title: 'Kampala City Blood Drive',
        description: 'Join us for a community blood drive at Makerere University. All blood types needed. Free health screening available for all donors.',
        location: 'Makerere University Main Hall',
        district: 'Kampala Central',
        city: 'Kampala',
        latitude: 0.3350,
        longitude: 32.5670,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        scheduledDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        organizer: 'Uganda Blood Transfusion Service',
        contactPhone: '+256-414-256881',
        status: 'UPCOMING',
      },
    }),
    prisma.bloodDrive.create({
      data: {
        title: 'Gulu Community Blood Drive',
        description: 'A two-day blood drive event at Gulu Regional Hospital. Help us save lives in Northern Uganda.',
        location: 'Gulu Regional Hospital Grounds',
        district: 'Gulu',
        city: 'Gulu',
        latitude: 2.7745,
        longitude: 32.2990,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        scheduledDays: JSON.stringify(['Saturday', 'Sunday']),
        startTime: '09:00 AM',
        endTime: '03:00 PM',
        organizer: 'Gulu Regional Hospital',
        contactPhone: '+256-471-431234',
        status: 'UPCOMING',
      },
    }),
    prisma.bloodDrive.create({
      data: {
        title: 'Jinja Town Blood Drive',
        description: 'Annual blood drive in Jinja town. Come donate and receive a free health check-up plus refreshments.',
        location: 'Jinja Main Street Community Center',
        district: 'Jinja',
        city: 'Jinja',
        latitude: 0.4361,
        longitude: 33.2051,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        scheduledDays: JSON.stringify(['Saturday']),
        startTime: '08:00 AM',
        endTime: '05:00 PM',
        organizer: 'Jinja Regional Referral Hospital',
        contactPhone: '+256-434-121234',
        status: 'UPCOMING',
      },
    }),
  ]);

  console.log('Seeding completed successfully!');
  console.log(`   - ${donors.length} donors created`);
  console.log(`   - ${centers.length} centers created`);
  console.log(`   - ${rewards.length} rewards created`);
  console.log(`   - ${bloodDrives.length} blood drives created`);
  console.log(`   Admin login: admin@bloodconnect.ug / admin123`);
  console.log(`   Donor login: john.musoke@gmail.com / donor123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });