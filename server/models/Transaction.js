import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  blockIndex: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  data: {
    type: { type: String, enum: ['academic_record', 'fee_payment', 'certificate', 'attendance'], required: true },
    studentName: String,
    studentRollNo: String,
    details: mongoose.Schema.Types.Mixed
  },
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
  verified: { type: Boolean, default: true }
});

export default mongoose.model('Transaction', transactionSchema);
