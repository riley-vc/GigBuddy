/**
 * seed.js — Populate MongoDB with Philippine-context sample data for GigBuddy.
 * Run: node seed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Gig from './models/Gig.js';
import Application from './models/Application.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Gig.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Users ──────────────────────────────────────────────────────────────
    const [carlo, anna, marco, juan, maya, rico] = await User.insertMany([
      // Organizers
      {
        name: 'Carlo Santos',
        email: 'carlo@eventsmanila.ph',
        password: 'hashed_pw_1',
        role: 'organizer',
        location: 'Makati City',
      },
      {
        name: 'Anna Reyes',
        email: 'anna@festivalph.com',
        password: 'hashed_pw_2',
        role: 'organizer',
        location: 'Bonifacio Global City, Taguig',
      },
      {
        name: 'Marco Bautista',
        email: 'marco@bgcvenues.ph',
        password: 'hashed_pw_3',
        role: 'organizer',
        location: 'Pasig City',
      },
      // Musicians (with full profiles)
      {
        name: 'Juan Dela Cruz',
        email: 'juan@musicianph.com',
        password: 'hashed_pw_4',
        role: 'musician',
        bio: 'OPM rock guitarist at frontman ng indie band na "Tagalog Street". 8 taon sa scene, nakapag-perform na sa Araneta, Route 196, at iba pang iconic Manila venues.',
        genres: ['OPM', 'Bisrock', 'Rock', 'Alternative', 'Indie Rock'],
        instruments: ['Guitar', 'Vocals', 'Bass'],
        location: 'Quezon City',
      },
      {
        name: 'Maya Santos',
        email: 'maya@jazzph.com',
        password: 'hashed_pw_5',
        role: 'musician',
        bio: 'Jazz at OPM vocalist na may classical training mula sa UST Conservatory. Specializes sa intimate events, corporate gigs, at wedding receptions. Available as solo act o kasama ang jazz trio.',
        genres: ['Jazz', 'OPM', 'Bossa Nova', 'Soul', 'Kundiman'],
        instruments: ['Vocals', 'Piano'],
        location: 'Makati City',
      },
      {
        name: 'Rico Navarro',
        email: 'rico@soundwaveph.com',
        password: 'hashed_pw_6',
        role: 'musician',
        bio: 'Electronic at ambient music producer na nakabase sa BGC. Gumagawa ng original soundscapes para sa art events, brand activations, at experiential installations. Available bilang live electronic act o DJ.',
        genres: ['Electronic', 'Ambient', 'Lo-fi', 'Experimental'],
        instruments: ['Synthesizer', 'Laptop / DJ Setup', 'Modular'],
        location: 'Bonifacio Global City, Taguig',
      },
    ]);
    console.log('👤 Seeded 6 users (3 organizers, 3 musicians with profiles)');

    // ── Gigs ───────────────────────────────────────────────────────────────
    const gigs = await Gig.insertMany([
      {
        organizerId: carlo._id,
        title: 'OPM Acoustic Night',
        description: 'Isang gabi ng purong OPM acoustic sa iconic na Saguijo. Naghahanap kami ng solo artist o duo na may malalim na koneksyon sa Original Pilipino Music. Ang audience ay mga 18–35 taong gulang na passionate sa local music.',
        venue: 'Saguijo Café + Bar Works',
        location: 'Poblacion, Makati',
        date: new Date('2026-07-18'),
        startTime: '20:00',
        endTime: '23:00',
        soundcheckTime: '18:00',
        budget: 15000,
        requirements: {
          genres: ['OPM', 'Acoustic', 'Kundiman', 'Folk'],
          instruments: ['Acoustic Guitar', 'Vocals'],
          backlineProvided: false,
        },
        status: 'open',
      },
      {
        organizerId: carlo._id,
        title: 'Corporate Gala — Live Background Music',
        description: 'Taunang corporate gala para sa 400 bisita sa Sofitel. Kailangan namin ng eleganteng live music sa buong gabi. Walang malakas na rock — sophisticated at understated ang gusto namin.',
        venue: 'Sofitel Philippine Plaza Manila',
        location: 'CCP Complex, Pasay',
        date: new Date('2026-08-02'),
        startTime: '18:00',
        endTime: '23:00',
        soundcheckTime: '16:00',
        budget: 80000,
        requirements: {
          genres: ['Classical', 'Jazz', 'OPM', 'Bossa Nova'],
          instruments: ['String Quartet', 'Piano', 'Vocals'],
          backlineProvided: true,
        },
        status: 'open',
      },
      {
        organizerId: anna._id,
        title: 'Bisrock Festival — Main Stage',
        description: 'Headlining set sa aming taunang outdoor summer festival sa BGC. Inaasahan namin ang 2,000+ attendees. High-energy performance, full PA system provided.',
        venue: 'The Ruins BGC',
        location: 'Bonifacio Global City, Taguig',
        date: new Date('2026-07-26'),
        startTime: '17:00',
        endTime: '19:30',
        soundcheckTime: '14:00',
        budget: 150000,
        requirements: {
          genres: ['Bisrock', 'OPM', 'Rock', 'Alternative'],
          instruments: ['Guitar', 'Bass', 'Drums', 'Keys', 'Vocals'],
          backlineProvided: true,
        },
        status: 'open',
      },
      {
        organizerId: anna._id,
        title: 'Vineyard & Wine Acoustic Session',
        description: 'Relaxed Saturday afternoon session sa aming wine garden. Naghahanap ng solo acoustic act o duo na may warm, folk/OPM feel para sa aming mga bisita.',
        venue: 'Las Casas Filipinas de Acuzar',
        location: 'Bagac, Bataan',
        date: new Date('2026-07-12'),
        startTime: '14:00',
        endTime: '17:00',
        soundcheckTime: '13:00',
        budget: 20000,
        requirements: {
          genres: ['Folk', 'Acoustic', 'OPM', 'Kundiman'],
          instruments: ['Acoustic Guitar', 'Vocals', 'Ukulele'],
          backlineProvided: false,
        },
        status: 'open',
      },
      {
        organizerId: marco._id,
        title: 'Private Wedding Reception — Tagaytay',
        description: 'Wedding reception para sa 120 bisita sa Tagaytay Highlands. Ceremony music sa cocktail hour, then transition to upbeat Filipino love songs at dance music para sa reception.',
        venue: 'Tagaytay Highlands International Golf Club',
        location: 'Tagaytay City, Cavite',
        date: new Date('2026-08-15'),
        startTime: '17:00',
        endTime: '23:30',
        soundcheckTime: '15:30',
        budget: 100000,
        requirements: {
          genres: ['OPM', 'Pop', 'R&B', 'Jazz', 'Kundiman'],
          instruments: ['Piano', 'Vocals', 'Guitar', 'Bass'],
          backlineProvided: true,
        },
        status: 'open',
      },
      {
        organizerId: marco._id,
        title: 'Art Gallery Opening — Ambient / Electronic Set',
        description: 'Contemporary art gallery opening sa Silverlens. Gusto namin ng experimental, ambient, o electronic music na mag-complement sa mga installations.',
        venue: 'Silverlens Galleries',
        location: 'Mandaluyong City',
        date: new Date('2026-07-08'),
        startTime: '19:00',
        endTime: '23:00',
        soundcheckTime: '17:30',
        budget: 35000,
        requirements: {
          genres: ['Electronic', 'Ambient', 'Experimental', 'Lo-fi'],
          instruments: ['Synthesizer', 'Laptop / DJ Setup', 'Modular'],
          backlineProvided: true,
        },
        status: 'open',
      },
    ]);
    console.log(`🎸 Seeded ${gigs.length} gigs`);

    // ── Applications & Invitations ─────────────────────────────────────────
    await Application.insertMany([
      // Musician-initiated applications
      {
        gigId: gigs[0]._id,
        musicianId: juan._id,
        status: 'pending',
        initiatedBy: 'musician',
        message: 'Malaking fan ng OPM acoustic scene — ang aking duo ay perpekto para dito!',
      },
      {
        gigId: gigs[0]._id,
        musicianId: maya._id,
        status: 'accepted',
        initiatedBy: 'musician',
        message: 'Solo acoustic vocalist na may 6 na taon ng OPM performance. Puwede akong magpadala ng setlist.',
      },
      {
        gigId: gigs[2]._id,
        musicianId: juan._id,
        status: 'pending',
        initiatedBy: 'musician',
        message: 'Ang aming band ay nag-headline na sa mga outdoor festivals sa Metro Manila.',
      },
      // Organizer-initiated invitation
      {
        gigId: gigs[5]._id,
        musicianId: rico._id,
        status: 'pending',
        initiatedBy: 'organizer',
        message: "You've been personally invited to perform at our gallery opening. We love your ambient work!",
      },
      {
        gigId: gigs[3]._id,
        musicianId: maya._id,
        status: 'rejected',
        initiatedBy: 'musician',
        message: 'Available ako sa petsa na ito para sa acoustic session.',
      },
    ]);
    console.log('📝 Seeded 5 applications / invitations');

    console.log('\n🎉 Database seeded successfully! (Philippines context)');
    console.log(`\nMock Organizer ID (Carlo): ${carlo._id}`);
    console.log(`Mock Musician ID (Juan):   ${juan._id}`);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seed();
