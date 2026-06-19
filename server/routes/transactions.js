import { Router } from 'express';
import blockchain from '../services/blockchainSimulator.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const chain = blockchain.getChain();
  res.json({ success: true, data: chain, stats: blockchain.getStats() });
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, studentName, studentRollNo, details } = req.body;
    let block;
    switch (type) {
      case 'academic_record':
        block = await blockchain.addAcademicRecord(studentName, studentRollNo, details);
        break;
      case 'fee_payment':
        block = await blockchain.addFeePayment(studentName, studentRollNo, details.amount, details.semester);
        break;
      case 'certificate':
        block = await blockchain.addCertificate(studentName, studentRollNo, details.certificateType);
        break;
      default:
        block = await blockchain.addBlock({ type: type || 'generic', studentName, studentRollNo, details });
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

router.post('/tamper', auth, authorize('admin'), async (req, res) => {
  try {
    const { blockIndex, data } = req.body;
    const block = await blockchain.tamperBlock(blockIndex, data);
    res.json({ success: true, message: `Block #${blockIndex} successfully tampered for simulation.`, data: block, stats: blockchain.getStats() });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/repair', auth, authorize('admin'), async (req, res) => {
  try {
    const report = await blockchain.repairChain();
    res.json({ success: true, message: "Blockchain ledger successfully repaired and synchronized.", stats: blockchain.getStats() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/verify-student/:rollNo', auth, async (req, res) => {
  try {
    const { rollNo } = req.params;
    const Student = (await import('../models/Student.js')).default;
    const student = await Student.findOne({ rollNo }).lean();
    
    if (!student) {
      return res.status(404).json({ success: false, error: `Student with roll number ${rollNo} not found.` });
    }

    const report = blockchain.validateChain();
    const blocks = blockchain.getChain().filter(b => b.data && b.data.studentRollNo === rollNo);

    let mismatch = false;
    const discrepancies = [];

    const academicBlocks = blocks.filter(b => b.data.type === 'academic_record');
    if (academicBlocks.length > 0) {
      academicBlocks.sort((a, b) => b.blockIndex - a.blockIndex);
      const latestAcademic = academicBlocks[0];
      const ledgerGpa = latestAcademic.data.details.gpa || latestAcademic.data.details.cgpa;
      if (ledgerGpa !== undefined && Math.abs(ledgerGpa - student.cgpa) > 0.01) {
        mismatch = true;
        discrepancies.push(`CGPA mismatch: Database has ${student.cgpa} but Blockchain Ledger has ${ledgerGpa}.`);
      }
    }

    const feeBlocks = blocks.filter(b => b.data.type === 'fee_payment');
    if (student.feesPaid) {
      if (feeBlocks.length === 0) {
        mismatch = true;
        discrepancies.push(`Fee status mismatch: Database says fees are paid, but no fee payment transaction exists on the blockchain.`);
      }
    } else {
      if (feeBlocks.length > 0) {
        mismatch = true;
        discrepancies.push(`Fee status mismatch: Database says fees are unpaid, but fee payment transaction(s) exist on the blockchain.`);
      }
    }

    res.json({
      success: true,
      rollNo,
      studentName: student.name,
      chainValid: report.isValid,
      mismatch,
      discrepancies,
      blocksCount: blocks.length,
      status: !report.isValid ? 'ledger_compromised' : mismatch ? 'integrity_mismatch' : 'secured',
      blocks: blocks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
