import { Router } from 'express';
import blockchain from '../services/blockchainSimulator.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const chain = blockchain.getChain();
  res.json({ success: true, data: chain, stats: blockchain.getStats() });
});

router.post('/', auth, (req, res) => {
  try {
    const { type, studentName, studentRollNo, details } = req.body;
    let block;
    switch (type) {
      case 'academic_record':
        block = blockchain.addAcademicRecord(studentName, studentRollNo, details);
        break;
      case 'fee_payment':
        block = blockchain.addFeePayment(studentName, studentRollNo, details.amount, details.semester);
        break;
      case 'certificate':
        block = blockchain.addCertificate(studentName, studentRollNo, details.certificateType);
        break;
      default:
        block = blockchain.addBlock({ type: type || 'generic', studentName, studentRollNo, details });
    }
    res.json({
      success: true,
      data: { blockIndex: block.index, hash: block.hash, previousHash: block.previousHash, timestamp: block.timestamp, data: block.data, nonce: block.nonce, verified: true },
      chainValid: blockchain.isChainValid()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/validate', auth, (req, res) => {
  res.json({ success: true, valid: blockchain.isChainValid(), stats: blockchain.getStats() });
});

export default router;
