import { getGmailClient } from '../config/google.js';
import { parseEmail } from '../parsers/index.js';
import Transaction from '../models/Transaction.js';

// Recursive function to decode base64 body of Google emails
export const getMessageBody = (payload) => {
  if (!payload) return '';
  
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }
  
  if (payload.parts) {
    let body = '';
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        // Extract HTML body and strip simple HTML tags for raw matching
        const html = Buffer.from(part.body.data, 'base64url').toString('utf-8');
        body += html.replace(/<[^>]*>/g, ' ');
      } else if (part.parts) {
        body += getMessageBody(part);
      }
    }
    return body;
  }
  
  return '';
};

export const syncUserTransactions = async (user) => {
  if (!user.gmailRefreshToken) {
    throw new Error('Gmail account not connected. Please connect your Gmail first.');
  }

  // Retrieve client initialized with user tokens
  const gmail = getGmailClient(null, user.gmailRefreshToken);
  
  // Refined search query to pull alerts related to payments, credits, debits
  const query = 'subject:(debit OR credit OR transaction OR upi OR spent OR alert) OR "debited" OR "credited" OR "spent"';
  
  // List messages
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50
  });
  
  const messages = response.data.messages || [];
  let syncedCount = 0;
  let skippedCount = 0;
  
  for (const msg of messages) {
    // 1. Uniqueness check by Gmail Message ID (fast lookup)
    const exists = await Transaction.findOne({ userId: user._id, emailId: msg.id });
    if (exists) {
      skippedCount++;
      continue;
    }
    
    try {
      // 2. Fetch full message body
      const msgDetail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id
      });
      
      const headers = msgDetail.data.payload.headers;
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const dateStr = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
      const body = getMessageBody(msgDetail.data.payload);
      
      // 3. Process with parser engine
      const parsed = parseEmail(subject, body, dateStr, from);
      
      if (parsed.success) {
        // 4. Save into Database (guaranteed unique by compound key: userId + referenceNumber)
        await Transaction.create({
          userId: user._id,
          emailId: msg.id,
          referenceNumber: parsed.referenceNumber,
          amount: parsed.amount,
          merchant: parsed.merchant,
          date: parsed.date,
          type: parsed.type,
          bankName: parsed.bankName,
          category: parsed.category,
          rawEmailSnippet: msgDetail.data.snippet || ''
        });
        syncedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      if (err.code === 11000) {
        // Unique index collision on referenceNumber -> transaction already parsed from another sync
        skippedCount++;
      } else {
        console.error(`Error processing email message ${msg.id}:`, err.message);
        skippedCount++;
      }
    }
  }

  // Update last synced date
  user.lastSyncedAt = new Date();
  await user.save();

  return { syncedCount, skippedCount };
};
