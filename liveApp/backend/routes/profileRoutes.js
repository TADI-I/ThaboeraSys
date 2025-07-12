const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// GET /api/profile - fetch profile of authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - update or create profile for authenticated user
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone_number, picture_url } = req.body;

    let profile = await Profile.findOne({ where: { userId } });

    if (profile) {
      // Update existing profile
      await profile.update({ full_name, phone_number, picture_url });
    } else {
      // Create new profile
      profile = await Profile.create({ full_name, phone_number, picture_url, userId });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
