export interface Gig {
  id: string;
  title: string;
  venueName: string;
  date: string;
  soundcheckTime: string;
  setTime: string;
  endTime: string;
  budget: number;
  genres: string[];
  instruments: string[];
  backlineProvided: string[];
  description: string;
  status: 'open' | 'filled' | 'cancelled';
  organizerId: string;
  createdAt: string;
}

export interface Application {
  id: string;
  gigId: string;
  musicianId: string;
  musicianName: string;
  musicianAvatar: string;
  instrument: string;
  skills: string[];
  sampleVideoUrl: string;
  coverNote: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface MusicianProfile {
  id: string;
  name: string;
  avatar: string;
  primaryInstrument: string;
  skills: string[];
  bio: string;
  videoUrl: string;
  availability: { [day: string]: 'available' | 'busy' | 'tentative' };
  bands: string[];
}

export interface MoaContract {
  id: string;
  gigId: string;
  gigTitle: string;
  venueName: string;
  date: string;
  compensation: number;
  organizerSignature: string;
  musicianSignature: string;
  signedAt: string;
  status: 'pending_signatures' | 'fully_signed' | 'completed';
}
