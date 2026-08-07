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
import User             from './models/User.js';
import Gig              from './models/Gig.js';
import Application      from './models/Application.js';
import Contract         from './models/Contract.js';
import Conversation     from './models/Conversation.js';
import Message          from './models/Message.js';
import Team             from './models/Team.js';
import TeamMember       from './models/TeamMember.js';
import TeamConversation from './models/TeamConversation.js';
import TeamInvite       from './models/TeamInvite.js';
import SessionBand      from './models/SessionBand.js';

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
    Team.deleteMany({}),
    TeamMember.deleteMany({}),
    TeamConversation.deleteMany({}),
    TeamInvite.deleteMany({}),
    SessionBand.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing collections');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [maria, carlo, bea, jomar, diego, pat, miguel, angela, rico, nico, vanessa] = await User.insertMany([
    // Organizer 1 (mock logged-in organizer) — free tier
    {
      name: 'Maria Santos',
      email: 'maria@skydeck.com.ph',
      password: 'password123',
      role: 'organizer',
      location: 'BGC, Taguig',
      rating: 4.7,
      ratingCount: 24,
    },
    // Musician 1 (mock logged-in musician) — free tier
    {
      name: 'Carlo Reyes',
      email: 'carlo@gigbag.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Professional guitarist and bassist based in BGC, Taguig. Specializes in OPM, Bisrock, and P-pop sessions for corporate events, weddings, and live bar gigs across Metro Manila. Full backline available.',
      instruments: ['Electric Guitar', 'Bass Guitar', 'Acoustic Guitar'],
      genres: ['OPM', 'Bisrock', 'P-pop'],
      location: 'BGC, Taguig',
      rating: 4.6,
      ratingCount: 19,
    },
    // Musician 2 — premium tier
    {
      name: 'Bea Villanueva',
      email: 'bea@beatrice.music',
      password: 'password123',
      role: 'musician',
      bio: 'Versatile vocalist and keys player from Cebu City. 6 years of live OPM lounge and events experience. Fluent in Visayan and Tagalog repertoire, Filipino jazz standards, and kundiman.',
      instruments: ['Vocals', 'Piano', 'Keyboard'],
      genres: ['OPM', 'Kundiman', 'Jazz-OPM'],
      location: 'Cebu City',
      isPremium: true,
      premiumSince: new Date('2026-04-10'),
      rating: 4.9,
      ratingCount: 37,
    },
    // Musician 3 — free tier
    {
      name: 'Jomar "JR" Ramos',
      email: 'jr@jrdrums.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Session drummer with extensive Bisrock and alt-OPM gig history. Has played at Route 196, 12 Monkeys, and B-Side Collective. Tight grooves, reliable kit, and full professional setup.',
      instruments: ['Drums', 'Percussion', 'Cajon'],
      genres: ['Bisrock', 'Alternative OPM', 'Indie PH'],
      location: 'Quezon City',
      rating: 4.5,
      ratingCount: 12,
    },
    // Organizer 2 — premium tier (needed so marketplace ranking has 2
    // organizers to compare — Maria alone can't demonstrate a boost)
    {
      name: 'Diego Fernandez',
      email: 'diego@fiestaproductions.ph',
      password: 'password123',
      role: 'organizer',
      location: 'Cebu City',
      isPremium: true,
      premiumSince: new Date('2026-05-01'),
      rating: 4.8,
      ratingCount: 29,
    },
    // Musician 4 — premium tier
    {
      name: 'Patricia "Pat" Mendoza',
      email: 'pat@patmendozamusic.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Premium-tier saxophonist and vocalist based in Makati, specializing in jazz-lounge sets and P-pop horn sections for corporate events, EP launches, and hotel lounges across Metro Manila.',
      instruments: ['Saxophone', 'Vocals'],
      genres: ['Jazz-OPM', 'P-pop', 'Lounge'],
      location: 'Makati City',
      isPremium: true,
      premiumSince: new Date('2026-06-15'),
      rating: 4.9,
      ratingCount: 15,
    },
    // Musician 5 — band-only (bassist, plays exclusively as part of The Manila Collective)
    {
      name: 'Miguel Torres',
      email: 'miguel@manilacollective.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Bass player and founding member of The Manila Collective. Anchors the band\'s rhythm section for corporate events and bar residencies across BGC — does not take solo bookings.',
      instruments: ['Bass Guitar'],
      genres: ['OPM', 'Pop', 'Jazz-OPM'],
      location: 'BGC, Taguig',
      rating: 4.7,
      ratingCount: 21,
    },
    // Musician 6 — band-only (vocalist, The Manila Collective)
    {
      name: 'Angela Cruz',
      email: 'angela@manilacollective.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Lead vocalist for The Manila Collective. Trained in musical theater and OPM pop repertoire — performs exclusively with the band.',
      instruments: ['Lead Vocals', 'Backing Vocals / BGV'],
      genres: ['OPM', 'Pop'],
      location: 'BGC, Taguig',
      rating: 4.8,
      ratingCount: 18,
    },
    // Musician 7 — band-only (drummer, founding member of Kalye Sound)
    {
      name: 'Rico Bautista',
      email: 'rico@kalyesound.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Drummer and founder of Kalye Sound. Books gigs exclusively as the band — hard-hitting Bisrock and alt-OPM grooves.',
      instruments: ['Drum Kit', 'Percussion / Congas'],
      genres: ['Bisrock', 'Alternative OPM'],
      location: 'Quezon City',
      rating: 4.6,
      ratingCount: 14,
    },
    // Musician 8 — band-only (keys, Kalye Sound)
    {
      name: 'Nico Salazar',
      email: 'nico@kalyesound.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Keys and synth player for Kalye Sound, layering pads and leads under the band\'s Bisrock and alt-OPM sets.',
      instruments: ['Keyboard / Keys', 'Synthesizer / Synth'],
      genres: ['Bisrock', 'Alternative OPM', 'Indie PH'],
      location: 'Quezon City',
      rating: 4.5,
      ratingCount: 9,
    },
    // Musician 9 — solo-only (no band, independent guitarist/vocalist)
    {
      name: 'Vanessa Lim',
      email: 'vanessa@vlmusic.ph',
      password: 'password123',
      role: 'musician',
      bio: 'Independent singer-songwriter and acoustic guitarist based in Makati. Books solo lounge sets, private events, and duo collaborations across Metro Manila — not part of any band.',
      instruments: ['Acoustic Guitar', 'Lead Vocals'],
      genres: ['OPM', 'Acoustic OPM', 'Indie PH'],
      location: 'Makati City',
      rating: 4.7,
      ratingCount: 11,
    },
  ]);

  console.log(`👥 Created ${11} users`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GIGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [gig1, gig2, gig3, gig4, gig5, gig6] = await Gig.insertMany([
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
    {
      organizerId: diego._id,
      title: 'Jazz-Lounge Sax & Vocals — Hotel Rooftop Launch Party',
      venueName: 'The Henry Hotel Rooftop, Cebu City',
      date: new Date('2026-08-09'),
      soundcheckTime: '17:00',
      setTime: '19:30',
      endTime: '22:00',
      budget: 15000,
      genres: ['Jazz-OPM', 'P-pop', 'Lounge'],
      instruments: ['Saxophone', 'Vocals'],
      backlineProvided: ['Alto & Tenor Sax Mics (Condenser)', 'Vocal Monitor Wedge', 'DI Box'],
      description: 'Premium hotel rooftop launch party in Cebu. Looking for a jazz-lounge sax and vocals act to set an elegant evening mood — smooth jazz standards into a light P-pop lounge set as the night progresses. Cocktail attire. Dinner and parking provided for talent.',
      status: 'open',
    },
    {
      organizerId: diego._id,
      title: 'Wedding Reception Band — OPM & Pop Covers',
      venueName: 'Marco Polo Plaza, Cebu City',
      date: new Date('2026-08-16'),
      soundcheckTime: '16:00',
      setTime: '18:30',
      endTime: '22:30',
      budget: 25000,
      genres: ['OPM', 'Pop', 'Wedding Pop'],
      instruments: ['Vocals', 'Electric Guitar', 'Bass Guitar', 'Drums'],
      backlineProvided: ['Full PA System', 'Stage Monitors x4', 'DI Boxes', 'Drum Kit (house)'],
      description: 'Full wedding reception band needed for a Cebu ballroom reception. Repertoire spans OPM classics, modern pop covers, and a dedicated first-dance set. Formal attire required. Reserved talent table with full-course dinner.',
      status: 'open',
    },
  ]);

  console.log(`🎸 Created ${6} gigs`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // APPLICATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [app1, app2, app3] = await Application.insertMany([
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
    {
      gigId: gig5._id,
      musicianId: pat._id,
      organizerId: diego._id,
      musicianName: 'Patricia "Pat" Mendoza',
      musicianAvatar: 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&q=80&w=200',
      organizerName: 'Diego Fernandez',
      instrument: 'Saxophone & Vocals',
      skills: ['Smooth jazz standards', 'Jazz-lounge sax', 'P-pop horn arrangements', 'Bilingual vocals'],
      sampleVideoUrl: 'https://www.youtube.com/watch?v=demo-pat',
      coverNote: "Hi Diego! Pat here — premium GigBag member specializing in exactly this kind of jazz-lounge sax and vocals set. I've played rooftop launches across Makati and would love to bring that same elegant, easy-listening energy to Cebu. Happy to send a set list tailored to the hotel's brand.",
      status: 'pending',
      initiatedBy: 'musician',
      appliedAt: new Date('2026-08-05'),
    },
  ]);

  console.log(`📝 Created ${3} applications`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTRACTS (archived / completed — feeds each organizer's "Finished
  // Events" profile section and each musician's earnings history)
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
    {
      gigId: gig1._id,
      musicianId: bea._id,
      organizerId: maria._id,
      gigTitle: 'Corporate Anniversary Jazz Duo',
      venueName: 'Blackbird Restaurant, Ayala Triangle Gardens',
      date: '2026-05-20',
      compensation: 11000,
      organizerSignature: 'Maria Santos (SkyDeck Events)',
      musicianSignature: 'Bea Villanueva',
      signedAt: '2026-05-14',
      status: 'completed',
    },
    {
      gigId: gig2._id,
      musicianId: jomar._id,
      organizerId: maria._id,
      gigTitle: 'Bisrock Night at Route 196',
      venueName: 'Route 196, Katipunan, QC',
      date: '2026-04-18',
      compensation: 9500,
      organizerSignature: 'Maria Santos (SkyDeck Events)',
      musicianSignature: 'Jomar "JR" Ramos',
      signedAt: '2026-04-11',
      status: 'completed',
    },
    {
      gigId: gig5._id,
      musicianId: pat._id,
      organizerId: diego._id,
      gigTitle: 'Hotel Lounge Sax Set',
      venueName: 'The Henry Hotel Rooftop, Cebu City',
      date: '2026-05-05',
      compensation: 13500,
      organizerSignature: 'Diego Fernandez (Fiesta Productions)',
      musicianSignature: 'Patricia "Pat" Mendoza',
      signedAt: '2026-04-28',
      status: 'completed',
    },
    {
      gigId: gig6._id,
      musicianId: rico._id,
      organizerId: diego._id,
      gigTitle: 'Kalye Sound Festival Slot',
      venueName: 'SM Seaside Cebu, Open Grounds',
      date: '2026-06-01',
      compensation: 20000,
      organizerSignature: 'Diego Fernandez (Fiesta Productions)',
      musicianSignature: 'Rico Bautista',
      signedAt: '2026-05-24',
      status: 'completed',
    },
  ]);

  console.log(`📄 Created ${5} archived contracts`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BANDS (Team + roster) — two fully-rostered bands. Carlo and Bea sit on a
  // roster while keeping their own solo profile ("both" category); Miguel,
  // Angela, Rico, and Nico are seeded as band-only members.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [manilaCollective, kalyeSound] = await Team.insertMany([
    {
      name: 'The Manila Collective',
      bio: 'BGC-based OPM/pop function band for corporate events, weddings, and hotel lounges. Full band, full backline, tight three-part harmonies.',
      genres: ['OPM', 'Pop', 'Jazz-OPM'],
      location: 'BGC, Taguig',
      createdBy: miguel._id,
      defaultPayoutMode: 'per_member',
      defaultPayoutManagerId: miguel._id,
    },
    {
      name: 'Kalye Sound',
      bio: 'Quezon City Bisrock and alt-OPM outfit. High-energy sets built for bars, festivals, and student org gigs.',
      genres: ['Bisrock', 'Alternative OPM', 'Indie PH'],
      location: 'Quezon City',
      createdBy: rico._id,
      defaultPayoutMode: 'per_member',
      defaultPayoutManagerId: rico._id,
    },
  ]);

  await TeamMember.insertMany([
    // The Manila Collective
    { teamId: manilaCollective._id, musicianId: miguel._id, role: 'manager', instrument: 'Bass Guitar', status: 'active' },
    { teamId: manilaCollective._id, musicianId: angela._id, role: 'member', instrument: 'Lead Vocals', status: 'active' },
    { teamId: manilaCollective._id, musicianId: carlo._id, role: 'member', instrument: 'Electric Guitar', status: 'active' },
    // Kalye Sound
    { teamId: kalyeSound._id, musicianId: rico._id, role: 'manager', instrument: 'Drum Kit', status: 'active' },
    { teamId: kalyeSound._id, musicianId: nico._id, role: 'member', instrument: 'Keyboard / Keys', status: 'active' },
    { teamId: kalyeSound._id, musicianId: bea._id, role: 'member', instrument: 'Lead Vocals', status: 'active' },
  ]);

  await TeamConversation.insertMany([
    { teamId: manilaCollective._id, teamName: manilaCollective.name, lastMessage: 'Soundcheck 5:30 sharp for the Blackbird gig!', lastMessageAt: new Date('2026-07-01') },
    { teamId: kalyeSound._id, teamName: kalyeSound.name, lastMessage: 'Setlist locked — 14 tracks, sending PDF now.', lastMessageAt: new Date('2026-06-28') },
  ]);

  console.log(`🎤 Created ${2} bands with full rosters`);
  console.log('\n🌱 Seed complete! 🇵🇭');
  console.log(`\nMock user IDs for Phase 1 hardcoded auth:`);
  console.log(`  Organizer (Maria Santos):  ${maria._id}`);
  console.log(`  Musician  (Carlo Reyes):   ${carlo._id}`);
  console.log(`  Organizer (Diego Fernandez, ★ Premium): ${diego._id}`);
  console.log(`  Musician  (Pat Mendoza, ★ Premium):      ${pat._id}`);

  return { maria, carlo, bea, jomar, diego, pat, miguel, angela, rico, nico, vanessa, manilaCollective, kalyeSound };
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
