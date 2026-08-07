import express from 'express';
import Application from '../models/Application.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/applications — list applications (filter by gigId or musicianId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId)      filter.gigId      = req.query.gigId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;

    const applications = await Application.find(filter)
      .populate('gigId', 'title venueName date budget status')
      .populate('musicianId', 'name email avatar')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/applications — musician applies OR organizer invites
// Automatically spawns a Conversation + seeds the opening message (coverNote)
router.post('/', async (req, res) => {
  try {
    const {
      gigId,
      musicianId,
      musicianName,
      musicianAvatar,
      instrument,
      skills,
      sampleVideoUrl,
      coverNote,
      initiatedBy = 'musician',
      teamId, // set when musicianId is applying as the point-of-contact for a band
      // For conversation seeding — passed from the frontend
      organizerId,
      organizerName,
    } = req.body;

    // Check for duplicate application/invitation on the same gig+musician pair
    const existing = await Application.findOne({ gigId, musicianId });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Already applied to this gig' });
    }

    const application = new Application({
      gigId,
      musicianId,
      musicianName,
      musicianAvatar,
      instrument,
      skills,
      sampleVideoUrl,
      coverNote,
      initiatedBy,
      teamId,
    });

    await application.save();

    // ── Auto-spawn a Conversation for this application ─────────────────────────
    try {
      const [gig, musician] = await Promise.all([
        Gig.findById(gigId).select('title venueName budget organizerId'),
        User.findById(musicianId).select('name'),
      ]);

      // Resolve organizer info — prefer passed values, fall back to gig.organizerId lookup
      let resolvedOrganizerId = organizerId || gig?.organizerId?.toString();
      let resolvedOrganizerName = organizerName || 'Event Planner';

      if (!organizerName && resolvedOrganizerId) {
        const organizer = await User.findById(resolvedOrganizerId).select('name');
        if (organizer) resolvedOrganizerName = organizer.name;
      }

      const convoData = {
        applicationId:  application._id,
        gigId,
        organizerId:    resolvedOrganizerId,
        musicianId,
        gigTitle:       gig?.title       || '',
        venueName:      gig?.venueName   || '',
        musicianName:   musician?.name   || musicianName || '',
        organizerName:  resolvedOrganizerName,
        gigBudget:      gig?.budget      || 0,
      };

      const convo = new Conversation(convoData);
      await convo.save();

      // Seed opening message from the coverNote if present
      if (coverNote && coverNote.trim()) {
        const senderRole = initiatedBy === 'organizer' ? 'organizer' : 'musician';
        const senderName = initiatedBy === 'organizer'
          ? resolvedOrganizerName
          : (musician?.name || musicianName || '');

        const openingMsg = new Message({
          conversationId: convo._id,
          senderId:       initiatedBy === 'organizer' ? resolvedOrganizerId : musicianId,
          senderRole,
          senderName,
          content: coverNote.trim(),
        });
        await openingMsg.save();

        // Update conversation preview
        await Conversation.findByIdAndUpdate(convo._id, {
          lastMessage:   coverNote.trim(),
          lastMessageAt: openingMsg.sentAt,
          // Recipient gets the unread bump
          ...(initiatedBy === 'organizer'
            ? { unreadMusician: 1 }
            : { unreadOrganizer: 1 }),
        });
      }

      // Return application + conversationId together so client can open chat immediately
      return res.status(201).json({
        success: true,
        data: { ...application.toObject(), conversationId: convo._id },
      });
    } catch (convoErr) {
      // Conversation creation failure is non-fatal — application still saved
      console.warn('⚠️  Could not auto-create conversation:', convoErr.message);
      return res.status(201).json({ success: true, data: application });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/applications/:id/status — organizer approves or rejects
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
