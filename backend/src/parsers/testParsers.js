import { parseEmail } from './index.js';

const testCases = [
  {
    name: 'SBI UPI Debit Alert',
    subject: 'Transaction Alert',
    body: 'Dear UPI User, Rs 150.00 debited from A/c XXXXXX1234 Ref No 612345678901 to ZOMATO on 06-Jul-26.',
    from: 'alerts@sbi.co.in',
    expected: {
      success: true,
      amount: 150.00,
      merchant: 'ZOMATO',
      type: 'debit',
      bankName: 'SBI',
      referenceNumber: '612345678901',
      category: 'Food'
    }
  },
  {
    name: 'SBI Card Spent',
    subject: 'SBI Card Transaction',
    body: 'Transaction of Rs. 1,200.00 spent on SBI Card ending 5678 at AMAZON on 06-Jul-26.',
    from: 'sbicard@sbicard.com',
    expected: {
      success: true,
      amount: 1200.00,
      merchant: 'AMAZON',
      type: 'debit',
      bankName: 'SBI',
      referenceNumber: 'SBI_CARD_TXN', // We will verify custom generation or specific format
      category: 'Shopping'
    }
  },
  {
    name: 'HDFC Account Debit',
    subject: 'HDFC Bank Alert',
    body: 'Rs 1500.00 was debited from A/c XXXXXX1234 on 06-Jul-26 by info/ref SWIGGY. Ref No: 987654321012',
    from: 'alerts@hdfcbank.net',
    expected: {
      success: true,
      amount: 1500.00,
      merchant: 'SWIGGY',
      type: 'debit',
      bankName: 'HDFC',
      referenceNumber: '987654321012',
      category: 'Food'
    }
  },
  {
    name: 'ICICI UPI Transaction',
    subject: 'ICICI Bank Debit Alert',
    body: 'Dear Customer, A/c XXXXX123 has been debited with INR 2,500.00 on 06-Jul-26. Info: UPI/Ref: 123456789012/UBER',
    from: 'alerts@icicibank.com',
    expected: {
      success: true,
      amount: 2500.00,
      merchant: 'UBER',
      type: 'debit',
      bankName: 'ICICI',
      referenceNumber: '123456789012',
      category: 'Travel'
    }
  },
  {
    name: 'Axis Net Banking Debit',
    subject: 'Axis Alert',
    body: 'Dear Customer, your Axis Bank Acct XX1234 has been debited for INR 300.00 on 06-07-26 by UPI Ref 112233445566. Info: JIO RECHARGE.',
    from: 'alerts@axisbank.com',
    expected: {
      success: true,
      amount: 300.00,
      merchant: 'JIO RECHARGE',
      type: 'debit',
      bankName: 'Axis',
      referenceNumber: '112233445566',
      category: 'Utilities'
    }
  },
  {
    name: 'Kotak Bank Debit',
    subject: 'Kotak Debit Notification',
    body: 'Dear Customer, Rs. 450.00 has been debited from your Kotak Bank Account XX1234 on 06-Jul-26. Ref no. 556677889900 to NETFLIX.',
    from: 'alerts@kotak.com',
    expected: {
      success: true,
      amount: 450.00,
      merchant: 'NETFLIX',
      type: 'debit',
      bankName: 'Kotak',
      referenceNumber: '556677889900',
      category: 'Entertainment'
    }
  },
  {
    name: 'Generic Fallback debit transaction',
    subject: 'Transaction Alert',
    body: 'Your Account was charged INR 99.00 on 06-Jul-26 for subscription at SPOTIFY. Ref 9988776655.',
    from: 'alerts@anotherbank.com',
    expected: {
      success: true,
      amount: 99.00,
      merchant: 'SPOTIFY',
      type: 'debit',
      referenceNumber: '9988776655',
      category: 'Entertainment'
    }
  }
];

console.log('=== Running Parser Engine Unit Tests ===\n');
let passedCount = 0;

testCases.forEach((tc, idx) => {
  const result = parseEmail(tc.subject, tc.body, new Date('2026-07-06T12:00:00Z').toISOString(), tc.from);
  
  let passed = true;
  const errors = [];

  if (result.success !== tc.expected.success) {
    passed = false;
    errors.push(`Success mismatch: got ${result.success}, expected ${tc.expected.success}`);
  }

  if (result.success) {
    if (result.amount !== tc.expected.amount) {
      passed = false;
      errors.push(`Amount mismatch: got ${result.amount}, expected ${tc.expected.amount}`);
    }
    if (result.merchant !== tc.expected.merchant) {
      passed = false;
      errors.push(`Merchant mismatch: got "${result.merchant}", expected "${tc.expected.merchant}"`);
    }
    if (result.type !== tc.expected.type) {
      passed = false;
      errors.push(`Type mismatch: got "${result.type}", expected "${tc.expected.type}"`);
    }
    if (tc.expected.bankName && result.bankName !== tc.expected.bankName) {
      passed = false;
      errors.push(`BankName mismatch: got "${result.bankName}", expected "${tc.expected.bankName}"`);
    }
    // Only verify exact ref match if specifically expected
    if (tc.expected.referenceNumber && tc.expected.referenceNumber !== 'SBI_CARD_TXN' && result.referenceNumber !== tc.expected.referenceNumber) {
      passed = false;
      errors.push(`RefNumber mismatch: got "${result.referenceNumber}", expected "${tc.expected.referenceNumber}"`);
    }
    if (result.category !== tc.expected.category) {
      passed = false;
      errors.push(`Category mismatch: got "${result.category}", expected "${tc.expected.category}"`);
    }
  }

  if (passed) {
    console.log(`[PASS] Case ${idx + 1}: ${tc.name}`);
    passedCount++;
  } else {
    console.log(`[FAIL] Case ${idx + 1}: ${tc.name}`);
    errors.forEach(err => console.log(`       - ${err}`));
  }
});

console.log(`\n=== Test Summary: ${passedCount}/${testCases.length} Passed ===`);
if (passedCount === testCases.length) {
  console.log('STATUS: ALL PARSER TESTS PASSED!');
  process.exit(0);
} else {
  console.log('STATUS: SOME TESTS FAILED.');
  process.exit(1);
}
