/**
 * GigBuddy Seed Script
 * Run: node seed.js  (from /server directory)
 * Drops and re-creates all collections with rich sample data matching the new schemas.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Gig from './models/Gig.js';
import Application from './models/Application.js';
import Contract from './models/Contract.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // --- Wipe existing data ---
  await User.deleteMany({});
  await Gig.deleteMany({});
  await Application.deleteMany({});
  await Contract.deleteMany({});
  console.log('🗑️  Cleared existing collections');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [sarah, leo, clara, marcus] = await User.insertMany([
    // Organizer 1 (mock logged-in organizer)
    {
      name: 'Sarah Jenkins',
      email: 'sarah@skylightlounge.com',
      password: 'hashed_placeholder',
      role: 'organizer',
      location: 'Chicago, IL',
    },
    // Musician 1 (mock logged-in musician)
    {
      name: 'Leo Mercer',
      email: 'leo@mercer.music',
      password: 'hashed_placeholder',
      role: 'musician',
      bio: 'Professional multi-instrumentalist based in Chicago. Specializes in providing thick bass grooves, synth bass layers, and rhythmic syncopation for funk, jazz-fusion, and premium corporate cover bands.',
      instruments: ['Electric Bass', 'Synthesizer', 'Fretless Bass'],
      genres: ['Jazz-Fusion', 'Funk', 'Electronic'],
      location: 'Chicago, IL',
    },
    // Musician 2
    {
      name: 'Clara Sterling',
      email: 'clara@sterling.music',
      password: 'hashed_placeholder',
      role: 'musician',
      bio: 'Classically trained bassist with 8 years of live jazz club experience. Expert in swing and hard bop.',
      instruments: ['Double Bass', 'Upright Bass'],
      genres: ['Jazz', 'Hard Bop', 'Swing'],
      location: 'New York, NY',
    },
    // Musician 3
    {
      name: 'Marcus "Shred" Vance',
      email: 'marcus@shredvance.com',
      password: 'hashed_placeholder',
      role: 'musician',
      bio: 'Touring guitarist with West Coast cover act experience. Massive repertoire of 80s hair metal and 90s alt-rock.',
      instruments: ['Electric Guitar (Lead)', 'Backing Vocals'],
      genres: ['Rock', 'Hard Rock', 'Pop-Punk'],
      location: 'Los Angeles, CA',
    },
  ]);

  console.log(`👥 Created ${4} users`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GIGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [gig1, gig2, gig3, gig4] = await Gig.insertMany([
    {
      organizerId: sarah._id,
      title: 'Modern Jazz Trio - Double Bassist Needed',
      venueName: 'The Blue Note Lounge (Speakeasy)',
      date: new Date('2026-07-04'),
      soundcheckTime: '18:00',
      setTime: '20:30',
      endTime: '23:00',
      budget: 650,
      genres: ['Jazz', 'Hard Bop', 'Swing'],
      instruments: ['Double Bass', 'Upright Bass'],
      backlineProvided: ['Acoustic Grand Piano', 'Yamaha Maple Custom Drum Kit', 'Gallien-Krueger Bass Amp'],
      description: 'Looking for a seasoned double bassist with strong improvisational skills and a pristine acoustic tone. We will be performing three 45-minute sets of standard repertoire and contemporary jazz-fusion arrangements. Dress code is semi-formal (dark suits). Free meal and beverages provided by the venue.',
      status: 'open',
    },
    {
      organizerId: sarah._id,
      title: 'Rock Cover Band - Lead Guitarist for Summer Festival',
      venueName: 'The Foundry Outdoor Stage',
      date: new Date('2026-07-11'),
      soundcheckTime: '15:30',
      setTime: '19:00',
      endTime: '21:00',
      budget: 850,
      genres: ['Rock', 'Hard Rock', 'Pop-Punk'],
      instruments: ['Electric Guitar (Lead)', 'Backing Vocals'],
      backlineProvided: ['Marshall JCM800 Half-Stack', 'Orange PPC412 Cabinet', 'Monaural Monitor Mixes'],
      description: 'Urgent call for a versatile lead guitarist who can tackle 80s rock classics, modern alternative anthems, and perform backup harmony vocals. Must be energetic on stage. We have full professional PA and sound engineering support. 15-track setlist will be provided upon MoA signing.',
      status: 'open',
    },
    {
      organizerId: sarah._id,
      title: 'Acoustic Duo with Violinist for Premium Wedding',
      venueName: 'Vineyard & Oak Estate Cellars',
      date: new Date('2026-07-18'),
      soundcheckTime: '13:00',
      setTime: '15:30',
      endTime: '17:30',
      budget: 1200,
      genres: ['Classical-Crossover', 'Acoustic', 'Folk'],
      instruments: ['Violin', 'Acoustic Violin'],
      backlineProvided: ["Shure SM137 Instrument Mic", 'Direct Box (DI)', 'Bose L1 Compact PA System'],
      description: "Upscale wedding ceremony and cocktail hour. We need an elegant, precise violinist to collaborate with our resident acoustic guitarist. Must be able to play modern popular songs rearranged for classical strings, plus Pachelbel's Canon in D. Neat attire (formal tux/gown) is strictly required.",
      status: 'open',
    },
    {
      organizerId: sarah._id,
      title: 'Synthwave Keyboardist for Indie EP Release',
      venueName: 'The Neon Grid Underground',
      date: new Date('2026-07-25'),
      soundcheckTime: '17:00',
      setTime: '21:30',
      endTime: '22:45',
      budget: 500,
      genres: ['Synthwave', 'Indie Pop', 'Electronic'],
      instruments: ['Synthesizer', 'MIDI Keyboard Controller'],
      backlineProvided: ['Heavy-Duty Keyboard Stand', 'Stereo Radial DI Boxes', 'Vocal Microphone Shure Beta 58A'],
      description: 'Underground Electronic/Retro band looking for a live synth player to handle pads, lead solos, and manual arpeggios for our 8-track EP release party. High preference for players with their own portable performance synthesizers (e.g. Sequential Prophet, Korg Minilogue). Cyberpunk visual aesthetic.',
      status: 'open',
    },
  ]);

  console.log(`🎸 Created ${4} gigs`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // APPLICATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [app1, app2] = await Application.insertMany([
    {
      gigId: gig1._id,
      musicianId: clara._id,
      musicianName: 'Clara Sterling',
      musicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      instrument: 'Double Bass',
      skills: ['Sight-reading', 'Be-bop walking lines', 'Acoustic bow (arco)'],
      sampleVideoUrl: 'https://www.youtube.com/watch?v=demo1',
      coverNote: 'Hello! I am a classically trained bassist with 8 years of live jazz club experience. I love swing and hard bop, and I can lock in seamlessly with any rhythm section. I have my own high-end carbon-fiber flight case and Realist pickup setup. Looking forward to making music together!',
      status: 'pending',
      initiatedBy: 'musician',
      appliedAt: new Date('2026-06-22'),
    },
    {
      gigId: gig2._id,
      musicianId: marcus._id,
      musicianName: 'Marcus "Shred" Vance',
      musicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      instrument: 'Electric Guitar (Lead)',
      skills: ['Improvisational solos', 'High-range backing vocals', 'Stage acrobatics'],
      sampleVideoUrl: 'https://www.youtube.com/watch?v=demo2',
      coverNote: "Hey guys! This is Marcus. I've toured with cover acts all over the West Coast and have a massive repertoire of 80s hair metal and 90s alt-rock. I use a Kemper Profiler for instant perfect tones directly to FOH. I have solid backing vocal range (up to high B). Let's rock!",
      status: 'pending',
      initiatedBy: 'musician',
      appliedAt: new Date('2026-06-23'),
    },
  ]);

  console.log(`📝 Created ${2} applications`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTRACTS (archived / completed example)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await Contract.insertMany([
    {
      gigId: gig1._id, // reference any gig for archive purposes
      musicianId: leo._id,
      organizerId: sarah._id,
      gigTitle: 'Summer Lounge Session - Rhythm Section Pack',
      venueName: 'The Skylight Rooftop Bar',
      date: '2026-06-15',
      compensation: 450,
      organizerSignature: 'Sarah Jenkins (Skylight Lounge)',
      musicianSignature: 'Leo Mercer',
      signedAt: '2026-06-10',
      status: 'completed',
    },
  ]);

  console.log(`📄 Created ${1} archived contract`);

  console.log('\n🌱 Seed complete!');
  console.log(`\nMock user IDs for Phase 1 hardcoded auth:`);
  console.log(`  Organizer (Sarah Jenkins): ${sarah._id}`);
  console.log(`  Musician  (Leo Mercer):    ${leo._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
