import { parseSBI } from './sbiParser.js';
import { parseHDFC } from './hdfcParser.js';
import { parseICICI } from './iciciParser.js';
import { parseAxis } from './axisParser.js';
import { parseKotak } from './kotakParser.js';

// Configurable Category Rules mapping merchant keywords to categories
const CATEGORY_RULES = {
  Food: [/zomato/i, /swiggy/i, /food/i, /restaurant/i, /cafe/i, /starbucks/i, /dominos/i, /pizza/i, /dine/i, /mcdonald/i, /burger/i],
  Travel: [/uber/i, /ola/i, /metro/i, /taxi/i, /train/i, /irctc/i, /flight/i, /travel/i, /fuel/i, /petrol/i, /shell/i, /hpcl/i, /bpcl/i, /iocl/i, /rapido/i, /makemytrip/i],
  Entertainment: [/netflix/i, /spotify/i, /amazon\s*prime/i, /disney/i, /hotstar/i, /youtube/i, /google\s*play/i, /steam/i, /sony/i, /bookmyshow/i, /game/i],
  Shopping: [/amazon/i, /flipkart/i, /myntra/i, /shopping/i, /retail/i, /decathlon/i, /supermarket/i, /store/i, /mart/i, /grocer/i, /bigbasket/i, /blinkit/i, /zepto/i, /dmart/i, /reliance/i],
  Utilities: [/airtel/i, /jio/i, /vodafone/i, /idea/i, /act\s*fiber/i, /electricity/i, /power/i, /water/i, /gas/i, /bill/i, /recharge/i],
  Healthcare: [/doctor/i, /hospital/i, /pharmacy/i, /medicine/i, /health/i, /clinic/i, /lab/i, /apollo/i, /pharmeasy/i],
  'Personal Care': [/gym/i, /fitness/i, /salon/i, /spa/i, /parlour/i],
  Rent: [/rent/i, /maintenance/i, /broker/i, /housing/i]
};

export const categorizeMerchant = (merchant) => {
  if (!merchant || merchant === 'Unknown Merchant') return 'Uncategorized';
  
  for (const [category, patterns] of Object.entries(CATEGORY_RULES)) {
    for (const pattern of patterns) {
      if (pattern.test(merchant)) {
        return category;
      }
    }
  }
  return 'Uncategorized';
};

// Generic parser for fallback
export const parseGeneric = (text, dateHeader) => {
  const cleanText = text.replace(/\s+/g, ' ');
  
  // Extract amount
  const amtMatch = /(?:Rs\.?|INR|₹)\s*([\d,]+\.\d{2})/i.exec(cleanText);
  if (!amtMatch) return { success: false };

  const amount = parseFloat(amtMatch[1].replace(/,/g, ''));
  
  // Extract type
  let type = 'debit';
  if (/credited|received|deposit|credit|added/i.test(cleanText)) {
    type = 'credit';
  }

  // Extract bank
  let bankName = 'Unknown';
  if (/sbi/i.test(cleanText)) bankName = 'SBI';
  else if (/hdfc/i.test(cleanText)) bankName = 'HDFC';
  else if (/icici/i.test(cleanText)) bankName = 'ICICI';
  else if (/axis/i.test(cleanText)) bankName = 'Axis';
  else if (/kotak/i.test(cleanText)) bankName = 'Kotak';

  // Extract merchant (look for text following "at", "to", "in", "by")
  let merchant = 'Unknown Merchant';
  const merchMatch = /(?:at|to|in|by)\s+([A-Za-z0-9\s&'-]{3,25})/i.exec(cleanText);
  if (merchMatch) {
    const candidate = merchMatch[1].trim();
    if (!/your|our|the|some|a\s+bank/i.test(candidate)) {
      merchant = candidate;
    }
  }

  // Reference number
  let referenceNumber = null;
  const refMatch = /(?:Ref|UPI|txn|transaction|Ref\s*no)[:\s-]*(\d{6,15})/i.exec(cleanText);
  if (refMatch) {
    referenceNumber = refMatch[1];
  }

  let date = new Date(dateHeader);
  
  return {
    success: true,
    amount,
    merchant: merchant.replace(/ref\s+no.*$/i, '').replace(/on\s+\d+.*$/i, '').trim(),
    date,
    type,
    bankName,
    referenceNumber: referenceNumber || `GENERIC_${Date.parse(date)}_${Math.round(amount)}`
  };
};

export const parseEmail = (subject, body, dateHeader, fromHeader = '') => {
  const parseText = `${subject} ${body}`;
  const routingText = `${subject} ${body} ${fromHeader}`;
  
  let result = { success: false };

  // Route based on sender header or body contents
  if (/sbi/i.test(fromHeader) || /sbi/i.test(routingText)) {
    result = parseSBI(parseText, dateHeader);
  }
  
  if (!result.success && (/hdfc/i.test(fromHeader) || /hdfc/i.test(routingText))) {
    result = parseHDFC(parseText, dateHeader);
  }

  if (!result.success && (/icici/i.test(fromHeader) || /icici/i.test(routingText))) {
    result = parseICICI(parseText, dateHeader);
  }

  if (!result.success && (/axis/i.test(fromHeader) || /axis/i.test(routingText))) {
    result = parseAxis(parseText, dateHeader);
  }

  if (!result.success && (/kotak/i.test(fromHeader) || /kotak/i.test(routingText))) {
    result = parseKotak(parseText, dateHeader);
  }

  // Fallback to generic parser if bank specific parsers fail but transaction words are present
  if (!result.success && /(?:debit|credit|spent|alert|upi|transact)/i.test(routingText)) {
    result = parseGeneric(parseText, dateHeader);
  }

  if (result.success) {
    result.category = categorizeMerchant(result.merchant);
  }

  return result;
};
