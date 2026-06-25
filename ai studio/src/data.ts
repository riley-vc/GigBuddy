import { Gig, Application, MusicianProfile, MoaContract } from './types';

export const INITIAL_GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Modern Jazz Trio - Double Bassist Needed',
    venueName: 'The Blue Note Lounge (Speakeasy)',
    date: '2026-07-04',
    soundcheckTime: '18:00',
    setTime: '20:30',
    endTime: '23:00',
    budget: 650,
    genres: ['Jazz', 'Hard Bop', 'Swing'],
    instruments: ['Double Bass', 'Upright Bass'],
    backlineProvided: ['Acoustic Grand Piano', 'Yamaha Maple Custom Drum Kit', 'Gallien-Krueger Bass Amp'],
    description: 'Looking for a seasoned double bassist with strong improvisational skills and a pristine acoustic tone. We will be performing three 45-minute sets of standard repertoire and contemporary jazz-fusion arrangements. Dress code is semi-formal (dark suits). Free meal and beverages provided by the venue.',
    status: 'open',
    organizerId: 'org-1',
    createdAt: '2026-06-20'
  },
  {
    id: 'gig-2',
    title: 'Rock Cover Band - Lead Guitarist for Summer Festival',
    venueName: 'The Foundry Outdoor Stage',
    date: '2026-07-11',
    soundcheckTime: '15:30',
    setTime: '19:00',
    endTime: '21:00',
    budget: 850,
    genres: ['Rock', 'Hard Rock', 'Pop-Punk'],
    instruments: ['Electric Guitar (Lead)', 'Backing Vocals'],
    backlineProvided: ['Marshall JCM800 Half-Stack', 'Orange PPC412 Cabinet', 'Monaural Monitor Mixes'],
    description: 'Urgent call for a versatile lead guitarist who can tackle 80s rock classics, modern alternative anthems, and perform backup harmony vocals. Must be energetic on stage. We have full professional PA and sound engineering support. 15-track setlist will be provided upon MoA signing.',
    status: 'open',
    organizerId: 'org-1',
    createdAt: '2026-06-22'
  },
  {
    id: 'gig-3',
    title: 'Acoustic Duo with Violinist for Premium Wedding',
    venueName: 'Vineyard & Oak Estate Cellars',
    date: '2026-07-18',
    soundcheckTime: '13:00',
    setTime: '15:30',
    endTime: '17:30',
    budget: 1200,
    genres: ['Classical-Crossover', 'Acoustic', 'Folk'],
    instruments: ['Violin', 'Acoustic Violin'],
    backlineProvided: ['Shure SM137 Instrument Mic', 'Direct Box (DI)', 'Bose L1 Compact PA System'],
    description: 'Upscale wedding ceremony and cocktail hour. We need an elegant, precise violinist to collaborate with our resident acoustic guitarist. Must be able to play modern popular songs rearranged for classical strings, plus Pachelbel\'s Canon in D. Neat attire (formal tux/gown) is strictly required.',
    status: 'open',
    organizerId: 'org-2',
    createdAt: '2026-06-23'
  },
  {
    id: 'gig-4',
    title: 'Synthwave Keyboardist for Indie EP Release',
    venueName: 'The Neon Grid Underground',
    date: '2026-07-25',
    soundcheckTime: '17:00',
    setTime: '21:30',
    endTime: '22:45',
    budget: 500,
    genres: ['Synthwave', 'Indie Pop', 'Electronic'],
    instruments: ['Synthesizer', 'MIDI Keyboard Controller'],
    backlineProvided: ['Heavy-Duty Keyboard Stand', 'Stereo Radial DI Boxes', 'Vocal Microphone Shure Beta 58A'],
    description: 'Underground Electronic/Retro band looking for a live synth player to handle pads, lead solos, and manual arpeggios for our 8-track EP release party. High preference for players with their own portable performance synthesizers (e.g. Sequential Prophet, Korg Minilogue). Cyberpunk visual aesthetic.',
    status: 'open',
    organizerId: 'org-1',
    createdAt: '2026-06-24'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    gigId: 'gig-1',
    musicianId: 'musician-2',
    musicianName: 'Clara Sterling',
    musicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    instrument: 'Double Bass',
    skills: ['Sight-reading', 'Be-bop walking lines', 'Acoustic bow (arco)'],
    sampleVideoUrl: 'https://www.youtube.com/watch?v=demo1',
    coverNote: 'Hello! I am a classically trained bassist with 8 years of live jazz club experience. I love swing and hard bop, and I can lock in seamlessly with any rhythm section. I have my own high-end carbon-fiber flight case and Realist pickup setup. Looking forward to making music together!',
    status: 'pending',
    appliedAt: '2026-06-22'
  },
  {
    id: 'app-2',
    gigId: 'gig-2',
    musicianId: 'musician-3',
    musicianName: 'Marcus "Shred" Vance',
    musicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    instrument: 'Electric Guitar (Lead)',
    skills: ['Improvisational solos', 'High-range backing vocals', 'Stage acrobatics'],
    sampleVideoUrl: 'https://www.youtube.com/watch?v=demo2',
    coverNote: 'Hey guys! This is Marcus. I’ve toured with cover acts all over the West Coast and have a massive repertoire of 80s hair metal and 90s alt-rock. I use a Kemper Profiler for instant perfect tones directly to FOH. I have solid backing vocal range (up to high B). Let\'s rock!',
    status: 'pending',
    appliedAt: '2026-06-23'
  }
];

export const DEFAULT_MUSICIAN_PROFILE: MusicianProfile = {
  id: 'musician-user',
  name: 'Leo Mercer',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  primaryInstrument: 'Electric Bass & Synthesizer',
  skills: ['Groove pocket', 'Fretless bass', 'Sight-reading charts', 'MIDI routing', 'Stage presence'],
  bio: 'Professional multi-instrumentalist based in Chicago. Specializes in providing thick bass grooves, synth bass layers, and rhythmic syncopation for funk, jazz-fusion, and premium corporate cover bands. Armed with 5-string active basses, Moog Sub Phatty synthesizer, and absolute reliability.',
  videoUrl: 'https://www.youtube.com/watch?v=sample-bass-reel',
  availability: {
    'Monday': 'available',
    'Tuesday': 'busy',
    'Wednesday': 'available',
    'Thursday': 'tentative',
    'Friday': 'available',
    'Saturday': 'available',
    'Sunday': 'busy'
  },
  bands: ['The Chicago Groove Syndicate', 'Velvet Slate Duo', 'RetroWave Orchestra']
};

export const INITIAL_CONTRACTS: MoaContract[] = [
  {
    id: 'contract-archive-1',
    gigId: 'gig-99',
    gigTitle: 'Summer Lounge Session - Rhythm Section Pack',
    venueName: 'The Skylight Rooftop Bar',
    date: '2026-06-15',
    compensation: 450,
    organizerSignature: 'Sarah Jenkins (Skylight Lounge)',
    musicianSignature: 'Leo Mercer',
    signedAt: '2026-06-10',
    status: 'completed'
  }
];
