export const parseHDFC = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  let amount = null;
  let merchant = 'Unknown Merchant';
  let date = null;
  let type = 'debit';
  let referenceNumber = null;
  let success = false;

  // 1. UPI transaction: "Alert: You have done a UPI transaction of Rs. 200.00 from HDFC Bank A/c ... to MERCHANT on 06-07-26. Ref No: 123456789012"
  const upiTx = /UPI\s+transaction\s+of\s+(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+from.*to\s+(.+?)\s+on\s+([\w\d-]+)(?:\.|\s+Ref)/i.exec(cleanText);
  if (upiTx) {
    amount = parseFloat(upiTx[1].replace(/,/g, ''));
    merchant = upiTx[2].trim();
    date = new Date(upiTx[3]);
    type = 'debit';
    success = true;
  }

  // 2. Debited Account Alert: "Rs 1500.00 was debited from A/c XXXXXX1234 on 06-Jul-26 by info/ref MERCHANT"
  if (!success) {
    const acDebit = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+was\s+debited\s+from\s+A\/c\s+\S+\s+on\s+([\w\d-]+)\s+(?:by|to)\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acDebit) {
      amount = parseFloat(acDebit[1].replace(/,/g, ''));
      date = new Date(acDebit[2]);
      merchant = acDebit[3].trim();
      type = 'debit';
      success = true;
    }
  }

  // 3. Credit Card Spent: "INR 350.00 spent on HDFC Bank Credit Card ending 1234 at MERCHANT on 06-Jul-26"
  if (!success) {
    const cardSpent = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+spent\s+on\s+HDFC\s+Bank\s+Credit\s+Card.*at\s+(.+?)\s+on\s+([\w\d-]+)/i.exec(cleanText);
    if (cardSpent) {
      amount = parseFloat(cardSpent[1].replace(/,/g, ''));
      merchant = cardSpent[2].trim();
      date = new Date(cardSpent[3]);
      type = 'debit';
      success = true;
    }
  }

  // 4. Credited Account Alert: "Rs 1000.00 has been credited to A/c XXXXXX1234 on 06-Jul-26 by info/ref MERCHANT"
  if (!success) {
    const acCredit = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+(?:has\s+been\s+)?credited\s+(?:to|in)\s+A\/c\s+\S+\s+on\s+([\w\d-]+)\s+(?:by|from)\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acCredit) {
      amount = parseFloat(acCredit[1].replace(/,/g, ''));
      date = new Date(acCredit[2]);
      merchant = acCredit[3].trim();
      type = 'credit';
      success = true;
    }
  }

  // Ref number extraction
  if (success) {
    const refMatch = /(?:Ref\s*(?:No|id|number)?|txn)[:\s-]*(\d{6,15})/i.exec(cleanText);
    if (refMatch) {
      referenceNumber = refMatch[1];
    }
  }

  if (success) {
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateHeader);
    }
    // Clean up HDFC merchant string
    let cleanMerchant = merchant
      .replace(/ref\s+no.*$/i, '')
      .replace(/Ref\s*\d+.*$/i, '')
      .replace(/^info\/ref\s+/i, '')
      .replace(/^info\s+/i, '')
      .replace(/^ref\s+/i, '')
      .trim();

    return {
      success: true,
      amount,
      merchant: cleanMerchant || 'Unknown Merchant',
      date,
      type,
      bankName: 'HDFC',
      referenceNumber: referenceNumber || `HDFC_${Date.parse(date)}_${Math.round(amount)}`
    };
  }

  return { success: false };
};
