import { Router } from 'express';
import blockchain from '../services/blockchainSimulator.js';
import { auth, authorize } from '../middleware/auth.js';
// Import our global response utility format handler
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

// Get full transaction/blockchain history data
router.get('/', auth, (req, res) => {
  const chain = blockchain.getChain();
  
  const responseData = {
    chain,
    stats: blockchain.getStats()
  };

  // Standardized Response
  return res.status(200).json(
    new ApiResponse(200, responseData, 'Transaction data and history statistics retrieved successfully')
  );
});

// Create and log a new transaction block to the ledger
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

    const responseData = {
      block: { 
        blockIndex: block.index, 
        hash: block.hash, 
        previousHash: block.previousHash, 
        timestamp: block.timestamp, 
        data: block.data, 
        nonce: block.nonce, 
        verified: true 
      },
      chainValid: blockchain.isChainValid()
    };

    // Standardized Response
    return res.status(200).json(
      new ApiResponse(200, responseData, 'Transaction logged and block appended successfully')
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate block integrity status
router.get('/validate', auth, (req, res) => {
  const responseData = {
    valid: blockchain.isChainValid(),
    stats: blockchain.getStats()
  };

  // Standardized Response
  return res.status(200).json(
    new ApiResponse(200, responseData, 'Transaction ledger validation check completed')
  );
});

export default router;