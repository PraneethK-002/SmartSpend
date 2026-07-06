export const parseKotak = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  let amount = null;
  let merchant = 'Unknown Merchant';
  let date = null;
  let type = 'debit';
  let referenceNumber = null;
  let success = false;

  // 1. Account Debited with Ref: "Dear Customer, Rs. 450.00 has been debited from your Kotak Bank Account XX1234 on 06-Jul-26. Ref no. 123456789012 to SMARTRETAIL."
  const acDebitRef = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+(?:has\s+been\s+)?debited\s+from\s+your\s+Kotak.*on\s+([\w\d-]+)\.\s*Ref\s*(?:no\.?|id)?\s*(\d+)\s+to\s+(.+?)(?:\.|$)/i.exec(cleanText);
  if (acDebitRef) {
    amount = parseFloat(acDebitRef[1].replace(/,/g, ''));
    date = new Date(acDebitRef[2]);
    referenceNumber = acDebitRef[3];
    merchant = acDebitRef[4].trim();
    type = 'debit';
    success = true;
  }

  // 2. Account Debited at merchant: "Rs. 100.00 debited from Kotak Bank A/c XX1234 on 06-Jul-26 at MERCHANT."
  if (!success) {
    const acDebitMerch = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+debited\s+from\s+Kotak\s+Bank\s+A\/c\s+\S+\s+on\s+([\w\d-]+)\s+at\s+(.+?)(?:\.|$)/i.exec(cleanText);
    if (acDebitMerch) {
      amount = parseFloat(acDebitMerch[1].replace(/,/g, ''));
      date = new Date(acDebitMerch[2]);
      merchant = acDebitMerch[3].trim();
      type = 'debit';
      success = true;
    }
  }

  // 3. Account Credited: "Dear Customer, Rs. 1,000.00 has been credited to Kotak Bank Account XX1234 on 06-Jul-26 by Ref..."
  if (!success) {
    const acCredit = /(?:Rs\.?|INR)?\s*([\d,]+\.\d{2})\s+(?:has\s+been\s+)?credited\s+to\s+Kotak\s+Bank\s+Account\s+\S+\s+on\s+([\w\d-]+)\s+by\s+(.+?)(?:\.|$)/i.exec(cleanText);
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
    return {
      success: true,
      amount,
      merchant: merchant.replace(/ref\s+no.*$/i, '').trim(),
      date,
      type,
      bankName: 'Kotak',
      referenceNumber: referenceNumber || `KOTAK_${Date.parse(date)}_${Math.round(amount)}`
    };
  }

  return { success: false };
};
