export const parseSBI = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  let amount = null;
  let merchant = 'Unknown Merchant';
  let date = null;
  let type = 'debit';
  let referenceNumber = null;
  let success = false;

  // 1. UPI Debit: "Rs 150.00 debited from A/c ... Ref No 612345678901 to ZOMATO on 06-Jul-26"
  const upiDebit = /Rs\s*([\d,]+\.\d{2})\s*debited\s+from\s+A\/c\s+\S+\s+Ref\s*(?:No)?\s*(\d+)\s+to\s+(.+?)\s+on\s+([\w\d-]+)/i.exec(cleanText);
  if (upiDebit) {
    amount = parseFloat(upiDebit[1].replace(/,/g, ''));
    referenceNumber = upiDebit[2];
    merchant = upiDebit[3].trim();
    date = new Date(upiDebit[4]);
    type = 'debit';
    success = true;
  }
  
  // 2. Account Debit: "Your A/c XXXXX1234 has been debited by Rs 500.00 on 2026-07-06 at merchant..."
  if (!success) {
    const acDebit = /A\/c\s+\S+\s+(?:has\s+been\s+)?debited\s+(?:by|with)\s+(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+on\s+([\w\d-/]+)\s+(?:at|to|by)\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acDebit) {
      amount = parseFloat(acDebit[1].replace(/,/g, ''));
      date = new Date(acDebit[2]);
      merchant = acDebit[3].trim();
      type = 'debit';
      success = true;
    }
  }

  // 3. SBI Card spent: "Transaction of Rs. 1,200.00 spent on SBI Card ... at AMAZON on 06-Jul-26"
  if (!success) {
    const cardSpent = /spent\s+on\s+SBI\s+Card.*at\s+(.+?)\s+on\s+([\w\d-/]+)/i.exec(cleanText);
    const cardAmt = /(?:Rs\.?|INR)\s*([\d,]+\.\d{2})/i.exec(cleanText);
    if (cardSpent && cardAmt) {
      amount = parseFloat(cardAmt[1].replace(/,/g, ''));
      merchant = cardSpent[1].trim();
      date = new Date(cardSpent[2]);
      type = 'debit';
      success = true;
    }
  }

  // 4. Credited alert: "A/c XXXXX1234 credited by Rs 1,000.00 on 06-Jul-26 by UPI Ref 123456789012"
  if (!success) {
    const acCredit = /A\/c\s+\S+\s+(?:has\s+been\s+)?credited\s+(?:by|with)\s+(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+on\s+([\w\d-/]+)\s+by\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acCredit) {
      amount = parseFloat(acCredit[1].replace(/,/g, ''));
      date = new Date(acCredit[2]);
      merchant = acCredit[3].trim();
      type = 'credit';
      success = true;
    }
  }

  // Ref number fallback extraction if not captured yet
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
    // Clean merchant name from trailing reference numbers or noise
    let cleanMerchant = merchant
      .replace(/ref\s+no.*$/i, '')
      .replace(/Ref\s*\d+.*$/i, '')
      .trim();

    return {
      success: true,
      amount,
      merchant: cleanMerchant || 'Unknown Merchant',
      date,
      type,
      bankName: 'SBI',
      referenceNumber: referenceNumber || `SBI_${Date.parse(date)}_${Math.round(amount)}`
    };
  }

  return { success: false };
};
