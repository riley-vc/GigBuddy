/**
 * GigBag Seed Script — Philippines Context
 * Run: node seed.js  (from /server directory)
 * Drops and re-creates all collections with PH-flavored sample data.
 *
 * Also exports runSeed() for use by the /api/dev/seed endpoint
 * (called from the in-app Sandbox Refresh button).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User         from './models/User.js';
import Gig          from './models/Gig.js';
import Application  from './models/Application.js';
import Contract     from './models/Contract.js';
import Conversation from './models/Conversation.js';
import Message      from './models/Message.js';

dotenv.config();

/**
 * Core seed logic. Assumes Mongoose is already connected.
 * Returns the created mock user IDs so callers can use them.
 */
export async function runSeed() {
  // --- Wipe existing data ---
  await Promise.all([
    User.deleteMany({}),
    Gig.deleteMany({}),
    Application.deleteMany({}),
    Contract.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing collections');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [maria, carlo, bea, jomar] = await User.insertMany([
    // Organizer 1 (mock logged-in organizer)
    {
      name: 'Maria Santos',
      email: 'maria@skydeck.com.ph',
      password: 'password123',
      role: 'organizer',
      location: 'BGC, Taguig',
    },
    // Musician 1 (mock logged-in musician)
    {
      name: 'Carlo Reyes',
      email: 'carlo@gigbag.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Professional guitarist and bassist based in BGC, Taguig. Specializes in OPM, Bisrock, and P-pop sessions for corporate events, weddings, and live bar gigs across Metro Manila. Full backline available.',
      instruments: ['Electric Guitar', 'Bass Guitar', 'Acoustic Guitar'],
      genres: ['OPM', 'Bisrock', 'P-pop'],
      location: 'BGC, Taguig',
    },
    // Musician 2
    {
      name: 'Bea Villanueva',
      email: 'bea@beatrice.music',
      password: 'password123',
      role: 'musician',
      bio: 'Versatile vocalist and keys player from Cebu City. 6 years of live OPM lounge and events experience. Fluent in Visayan and Tagalog repertoire, Filipino jazz standards, and kundiman.',
      instruments: ['Vocals', 'Piano', 'Keyboard'],
      genres: ['OPM', 'Kundiman', 'Jazz-OPM'],
      location: 'Cebu City',
    },
    // Musician 3
    {
      name: 'Jomar "JR" Ramos',
      email: 'jr@jrdrums.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Session drummer with extensive Bisrock and alt-OPM gig history. Has played at Route 196, 12 Monkeys, and B-Side Collective. Tight grooves, reliable kit, and full professional setup.',
      instruments: ['Drums', 'Percussion', 'Cajon'],
      genres: ['Bisrock', 'Alternative OPM', 'Indie PH'],
      location: 'Quezon City',
    },
  ]);

  console.log(`👥 Created ${4} users`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GIGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [gig1, gig2, gig3, gig4] = await Gig.insertMany([
    {
      organizerId: maria._id,
      title: 'OPM Jazz Duo — Vocalist & Keys for Corporate Dinner',
      venueName: 'Blackbird Restaurant, Ayala Triangle Gardens',
      date: new Date('2026-07-12'),
      soundcheckTime: '17:30',
      setTime: '19:00',
      endTime: '22:00',
      budget: 12000,
      genres: ['OPM', 'Jazz-OPM', 'Kundiman'],
      instruments: ['Vocals', 'Keyboard'],
      backlineProvided: ['Yamaha Clavinova Grand', 'DI Box', 'Vocal Monitor Wedge', 'Shure SM58'],
      description: 'Looking for an elegant vocalist-keys duo for an intimate corporate anniversary dinner at Blackbird, Makati. Repertoire should cover classic OPM ballads (APO Hiking Society, Eraserheads era), kundiman standards, and tasteful bossa nova. Semi-formal attire required. Free dinner for talent provided by the venue.',
      status: 'open',
    },
    {
      organizerId: maria._id,
      title: 'Bisrock Full Band — Lead Guitarist for Music Festival',
      venueName: 'B-Side Collective, The Palace BGC',
      date: new Date('2026-07-19'),
      soundcheckTime: '15:00',
      setTime: '20:00',
      endTime: '22:30',
      budget: 18000,
      genres: ['Bisrock', 'Alternative OPM', 'Indie PH'],
      instruments: ['Electric Guitar', 'Backing Vocals'],
      backlineProvided: ['Marshall JVM410H Full Stack', 'Fender Twin Reverb (backline)', 'In-ear Monitor Packs'],
      description: 'Urgent open call for a high-energy Bisrock lead guitarist who can nail the Parokya, Rivermaya, and Bamboo catalog. Must be able to execute lead fills, power chord walls, and harmony vocals up to high G. Professional PA with full sound engineering by Midas M32. Setlist of 14 tracks provided on signing.',
      status: 'open',
    },
    {
      organizerId: maria._id,
      title: 'Acoustic Duo — Wedding Ceremony at Tagaytay',
      venueName: 'Fernwood Gardens Tagaytay',
      date: new Date('2026-07-26'),
      soundcheckTime: '13:00',
      setTime: '15:00',
      endTime: '17:30',
      budget: 22000,
      genres: ['OPM', 'Acoustic', 'Wedding Pop'],
      instruments: ['Acoustic Guitar', 'Vocals'],
      backlineProvided: ['Bose L1 Compact System', 'Shure SM137 Instrument Mic', 'Vocal Condenser Mic', 'DI Box'],
      description: "Elegant outdoor garden wedding in Tagaytay. Need a polished acoustic guitar-vocal duo. Songs include Faithfully (Journey), Here and Now (Luther Vandross), Ikaw (Yeng Constantino), and Can't Help Falling in Love. Smart casual attire. Venue provides full catering for the duo. Must have own reliable transport to Tagaytay.",
      status: 'open',
    },
    {
      organizerId: maria._id,
      title: 'P-pop Keyboardist — EP Launch at 12 Monkeys',
      venueName: '12 Monkeys Music Hall & Bar, Tomas Morato, QC',
      date: new Date('2026-08-02'),
      soundcheckTime: '18:00',
      setTime: '21:00',
      endTime: '23:00',
      budget: 9500,
      genres: ['P-pop', 'Electronic', 'OPM'],
      instruments: ['Keyboard', 'Synthesizer'],
      backlineProvided: ['Roland Phantom 8 Workstation', 'Stereo Radial DI Boxes', 'Heavy-Duty Keyboard Stand x2'],
      description: 'P-pop-influenced indie project launching their debut EP at 12 Monkeys. Looking for a live synth player for pads, lead arpeggios, and real-time filter sweeps during an 8-track set. Aesthetic: night market / neon Manila. Prefer players with their own portable synths (Korg Minilogue, Roland Juno). Streetwear / urban-formal attire.',
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
      musicianId: bea._id,
      organizerId: maria._id,
      musicianName: 'Bea Villanueva',
      musicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      organizerName: 'Maria Santos',
      instrument: 'Vocals & Piano',
      skills: ['OPM ballads', 'Kundiman standards', 'Bossa nova', 'Jazz chords', 'Fluent Cebuano repertoire'],
      sampleVideoUrl: 'https://www.youtube.com/watch?v=demo-bea',
      coverNote: "Magandang araw po! I'm Bea, a professional vocalist-pianist from Cebu with 6 years of lounge and events experience. I have a full repertoire of APO Hiking Society, Eraserheads era OPM, and kundiman classics. My piano voicings are clean and elegant — perfect for a corporate dinner setting. Happy to provide a brief audio demo!",
      status: 'pending',
      initiatedBy: 'musician',
      appliedAt: new Date('2026-06-24'),
    },
    {
      gigId: gig2._id,
      musicianId: jomar._id,
      organizerId: maria._id,
      musicianName: 'Jomar "JR" Ramos',
      musicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      organizerName: 'Maria Santos',
      instrument: 'Electric Guitar (Lead)',
      skills: ['Bisrock lead riffs', 'High-range backing vocals', 'Parokya & Rivermaya catalog', 'Kemper tones'],
      sampleVideoUrl: 'https://www.youtube.com/watch?v=demo-jr',
      coverNote: "Hey! Jomar here. I've played B-Side, 70s Bistro, and Route 196 and have the full Bisrock catalog memorized from Parokya to Bamboo to Rivermaya. I use a Kemper Profiler direct to FOH for zero-noise, instant-perfect tones. Backing vocals up to high G on chord. Malaya tayo. Let's rock Pilipinas!",
      status: 'pending',
      initiatedBy: 'musician',
      appliedAt: new Date('2026-06-25'),
    },
  ]);

  console.log(`📝 Created ${2} applications`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTRACTS (archived / completed example)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await Contract.insertMany([
    {
      gigId: gig1._id,
      musicianId: carlo._id,
      organizerId: maria._id,
      gigTitle: 'Rooftop Lounge Session — OPM Acoustic Set',
      venueName: 'SkyDeck Events Place, BGC Taguig',
      date: '2026-06-15',
      compensation: 8500,
      organizerSignature: 'Maria Santos (SkyDeck Events)',
      musicianSignature: 'Carlo Reyes',
      signedAt: '2026-06-10',
      status: 'completed',
    },
  ]);

  console.log(`📄 Created ${1} archived contract`);
  console.log('\n🌱 Seed complete! 🇵🇭');
  console.log(`\nMock user IDs for Phase 1 hardcoded auth:`);
  console.log(`  Organizer (Maria Santos): ${maria._id}`);
  console.log(`  Musician  (Carlo Reyes):  ${carlo._id}`);

  return { maria, carlo };
}

// ── Standalone CLI entry point ────────────────────────────────────────────────
// Only run when executed directly: `node seed.js`
// Does not auto-run when imported by other modules.
const isMainModule = process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
      await runSeed();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    }
  })();
}
