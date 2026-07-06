import { getGmailAuthClient } from '../config/google.js';
import User from '../models/User.js';
import { syncUserTransactions } from '../services/gmailService.js';
import { google } from 'googleapis';

export const connectGmail = (req, res) => {
  const userId = req.user._id.toString();
  
  const oauth2Client = getGmailAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Forces Google to provide a fresh refresh token
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state: userId // State matches callback user back to Mongo identity
  });
  
  res.json({ url });
};

export const gmailCallback = async (req, res) => {
  const { code, state: userId } = req.query;
  
  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=gmail_connection_failed`);
  }

  try {
    const oauth2Client = getGmailAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    const updateFields = {};
    if (tokens.refresh_token) {
      updateFields.gmailRefreshToken = tokens.refresh_token;
    }
    
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    updateFields.gmailEmail = userInfo.data.email;

    await User.findByIdAndUpdate(userId, updateFields);
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?gmail_connected=true`);
  } catch (error) {
    console.error('Gmail OAuth Callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=gmail_oauth_failed`);
  }
};

export const syncTransactions = async (req, res) => {
  try {
    const user = req.user;
    if (!user.gmailRefreshToken) {
      return res.status(400).json({ message: 'Gmail is not connected. Please connect Gmail first.' });
    }
    
    const result = await syncUserTransactions(user);
    res.json({
      message: 'Gmail synchronization complete.',
      ...result
    });
  } catch (error) {
    console.error('Gmail sync endpoint error:', error.message);
    res.status(500).json({ message: error.message || 'Sync failed.' });
  }
};
