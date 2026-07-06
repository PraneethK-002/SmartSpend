export const parseICICI = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  let amount = null;
  let merchant = 'Unknown Merchant';
  let date = null;
  let type = 'debit';
  let referenceNumber = null;
  let success = false;

  // 1. Account Debited: "Dear Customer, A/c XXXXX123 has been debited with INR 2,500.00 on 06-Jul-26. Info: UPI/Ref: 123456789012/MerchantName"
  const acDebit = /A\/c\s+\S+\s+(?:has\s+been\s+)?debited\s+(?:with|by)\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+([\w\d-]+)\.\s*Info:\s*(.+?)(?:\.|$)/i.exec(cleanText);
  if (acDebit) {
    amount = parseFloat(acDebit[1].replace(/,/g, ''));
    date = new Date(acDebit[2]);
    const info = acDebit[3];
    type = 'debit';
    success = true;
    
    // Parse info string "UPI/Ref: 123456789012/MerchantName" or "UPI/MerchantName"
    const infoParts = info.split('/');
    if (infoParts.length > 2) {
      referenceNumber = infoParts[1].replace(/ref[:\s]*/i, '').trim();
      merchant = infoParts[2].trim();
    } else if (infoParts.length > 1) {
      merchant = infoParts[1].trim();
    } else {
      merchant = info.trim();
    }
  }

  // 2. Credit Card Spent: "Dear Customer, transaction of Rs 850.00 has been made on ICICI Bank Credit Card ending 1234 at NETFLIX on 06-Jul-26. Ref: 123456."
  if (!success) {
    const cardSpent = /transaction\s+of\s+(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+has\s+been\s+made\s+on\s+ICICI\s+Bank\s+Credit\s+Card.*at\s+(.+?)\s+on\s+([\w\d-]+)/i.exec(cleanText);
    if (cardSpent) {
      amount = parseFloat(cardSpent[1].replace(/,/g, ''));
      merchant = cardSpent[2].trim();
      date = new Date(cardSpent[3]);
      type = 'debit';
      success = true;
    }
  }

  // 3. Account Credited: "Dear Customer, A/c XXXXX123 has been credited with INR 2,500.00 on 06-Jul-26. Info: UPI/Ref: 123456789012/SenderName"
  if (!success) {
    const acCredit = /A\/c\s+\S+\s+(?:has\s+been\s+)?credited\s+(?:with|by)\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+([\w\d-]+)\.\s*Info:\s*(.+?)(?:\.|$)/i.exec(cleanText);
    if (acCredit) {
      amount = parseFloat(acCredit[1].replace(/,/g, ''));
      date = new Date(acCredit[2]);
      const info = acCredit[3];
      type = 'credit';
      success = true;
      
      const infoParts = info.split('/');
      if (infoParts.length > 2) {
        referenceNumber = infoParts[1].replace(/ref[:\s]*/i, '').trim();
        merchant = infoParts[2].trim();
      } else if (infoParts.length > 1) {
        merchant = infoParts[1].trim();
      } else {
        merchant = info.trim();
      }
    }
  }

  // Ref extraction if not captured yet
  if (success && !referenceNumber) {
    const refMatch = /(?:Ref|UPI|txn|transaction|Ref\s*no)[:\s-]*(\d{6,15})/i.exec(cleanText);
    if (refMatch) {
      referenceNumber = refMatch[1];
    }
  }

  if (success) {
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateHeader);
    }
    return {
      success: true,
      amount,
      merchant: merchant.replace(/ref\s+no.*$/i, '').trim(),
      date,
      type,
      bankName: 'ICICI',
      referenceNumber: referenceNumber || `ICICI_${Date.parse(date)}_${Math.round(amount)}`
    };
  }

  return { success: false };
};
