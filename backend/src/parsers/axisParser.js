export const parseAxis = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  let amount = null;
  let merchant = 'Unknown Merchant';
  let date = null;
  let type = 'debit';
  let referenceNumber = null;
  let success = false;

  // 1. UPI Specific Debit: "Dear Customer, your Axis Bank Acct XX1234 has been debited for INR 300.00 on 06-07-26 by UPI Ref 112233445566. Info: JIO RECHARGE."
  const axisUPI = /Axis\s+Bank\s+Acct\s+\S+\s+has\s+been\s+debited\s+for\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+([\w\d-/]+)\s+by\s+UPI\s+Ref\s*(\d+)\.?\s*Info:\s*(.+?)(?:\.|$)/i.exec(cleanText);
  if (axisUPI) {
    amount = parseFloat(axisUPI[1].replace(/,/g, ''));
    date = new Date(axisUPI[2]);
    referenceNumber = axisUPI[3];
    merchant = axisUPI[4].trim();
    type = 'debit';
    success = true;
  }

  // 2. Account Debited: "Dear Customer, your Axis Bank Acct XX1234 has been debited for INR 300.00 on 06-07-26 by Ref..."
  if (!success) {
    const acDebit = /Axis\s+Bank\s+Acct\s+\S+\s+has\s+been\s+debited\s+for\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+([\w\d-/]+)\s+by\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acDebit) {
      amount = parseFloat(acDebit[1].replace(/,/g, ''));
      date = new Date(acDebit[2]);
      const info = acDebit[3];
      type = 'debit';
      success = true;

      const merchMatch = /Info:\s*(.+?)(?:\.|$)/i.exec(info);
      if (merchMatch) {
        merchant = merchMatch[1].trim();
      } else {
        merchant = info.trim();
      }
    }
  }

  // 3. Card Spent: "Axis Bank Card XX1234 debited for INR 250.00 at MERCHANT on 06/07/26."
  if (!success) {
    const cardSpent = /Axis\s+Bank\s+Card\s+\S+\s+debited\s+for\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+at\s+(.+?)\s+on\s+([\w\d-/]+)/i.exec(cleanText);
    if (cardSpent) {
      amount = parseFloat(cardSpent[1].replace(/,/g, ''));
      merchant = cardSpent[2].trim();
      date = new Date(cardSpent[3]);
      type = 'debit';
      success = true;
    }
  }

  // 4. Account Credited: "Dear Customer, your Axis Bank Acct XX1234 has been credited for INR 1,200.00 on 06-07-26 by Ref..."
  if (!success) {
    const acCredit = /Axis\s+Bank\s+Acct\s+\S+\s+has\s+been\s+credited\s+for\s+(?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+([\w\d-/]+)\s+by\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acCredit) {
      amount = parseFloat(acCredit[1].replace(/,/g, ''));
      date = new Date(acCredit[2]);
      merchant = acCredit[3].trim();
      type = 'credit';
      success = true;
    }
  }

  // Ref extraction fallback
  if (success && !referenceNumber) {
    const refMatch = /(?:Ref|UPI\s*Ref|txn|transaction|Ref\s*no)[:\s-]*(\d{6,15})/i.exec(cleanText);
    if (refMatch) {
      referenceNumber = refMatch[1];
    }
  }

  if (success) {
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateHeader);
    }
    let cleanMerchant = merchant
      .replace(/ref\s+no.*$/i, '')
      .replace(/Ref\s*\d+.*$/i, '')
      .replace(/Info:\s*/i, '')
      .trim();

    return {
      success: true,
      amount,
      merchant: cleanMerchant || 'Unknown Merchant',
      date,
      type,
      bankName: 'Axis',
      referenceNumber: referenceNumber || `AXIS_${Date.parse(date)}_${Math.round(amount)}`
    };
  }

  return { success: false };
};
