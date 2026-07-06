import jwt from 'jsonwebtoken';
import { getGoogleAuthClient } from '../config/google.js';
import User from '../models/User.js';
import { google } from 'googleapis';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_fallback_secret', {
    expiresIn: '30d',
  });
};

export const getGoogleUrl = (req, res) => {
  const oauth2Client = getGoogleAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
  });
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
  }

  try {
    const oauth2Client = getGoogleAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const { id: googleId, email, name, picture: avatar } = userInfo.data;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.name = name;
        user.avatar = avatar;
        await user.save();
      } else {
        user = await User.create({
          googleId,
          email,
          name,
          avatar
        });
      }
    }

    const token = generateToken(user._id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
  }
};

export const getMe = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
