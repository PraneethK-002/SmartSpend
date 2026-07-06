import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emailId: {
    type: String,
    default: null
  },
  referenceNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  merchant: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  bankName: {
    type: String,
    enum: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Unknown'],
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  rawEmailSnippet: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate transaction entries per user using compound indexes
transactionSchema.index({ userId: 1, referenceNumber: 1 }, { unique: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
