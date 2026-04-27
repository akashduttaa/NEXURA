import crypto from 'crypto';

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class BlockchainSimulator {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock() {
    const g = new Block(0, new Date().toISOString(), { type: 'genesis', details: { message: 'NEXURA Blockchain Initialized' } }, '0');
    g.mineBlock(2);
    return g;
  }

  getLatestBlock() { return this.chain[this.chain.length - 1]; }

  addBlock(data) {
    const prev = this.getLatestBlock();
    const b = new Block(this.chain.length, new Date().toISOString(), data, prev.hash);
    b.mineBlock(this.difficulty);
    this.chain.push(b);
    return b;
  }

  addAcademicRecord(studentName, studentRollNo, details) {
    return this.addBlock({ type: 'academic_record', studentName, studentRollNo, details });
  }

  addFeePayment(studentName, studentRollNo, amount, semester) {
    return this.addBlock({ type: 'fee_payment', studentName, studentRollNo, details: { amount, semester, paymentDate: new Date().toISOString() } });
  }

  addCertificate(studentName, studentRollNo, certificateType) {
    return this.addBlock({ type: 'certificate', studentName, studentRollNo, details: { certificateType, issuedDate: new Date().toISOString() } });
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const c = this.chain[i], p = this.chain[i - 1];
      const recalc = crypto.createHash('sha256').update(c.index + c.timestamp + JSON.stringify(c.data) + c.previousHash + c.nonce).digest('hex');
      if (c.hash !== recalc || c.previousHash !== p.hash) return false;
    }
    return true;
  }

  getChain() {
    return this.chain.map(b => ({ blockIndex: b.index, timestamp: b.timestamp, data: b.data, hash: b.hash, previousHash: b.previousHash, nonce: b.nonce, verified: true }));
  }

  getStats() {
    const types = {};
    this.chain.forEach(b => { const t = b.data.type || 'unknown'; types[t] = (types[t] || 0) + 1; });
    return { totalBlocks: this.chain.length, isValid: this.isChainValid(), blockTypes: types, latestHash: this.getLatestBlock().hash, difficulty: this.difficulty };
  }
}

const blockchain = new BlockchainSimulator();
export default blockchain;
export { BlockchainSimulator };
