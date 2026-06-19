import crypto from 'crypto';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

class Block {
  constructor(index, timestamp, data, previousHash = '', nonce = 0, hash = null, signature = null) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = hash || this.calculateHash();
    this.signature = signature || this.calculateSignature();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
      .digest('hex');
  }

  calculateSignature(hashToSign) {
    const secret = process.env.BLOCKCHAIN_SECRET || 'nexura_super_secret_integrity_key_2026';
    return crypto
      .createHmac('sha256', secret)
      .update(hashToSign || this.hash)
      .digest('hex');
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    this.signature = this.calculateSignature();
  }
}

class BlockchainSimulator {
  constructor() {
    this.chain = [];
    this.pristineChain = [];
    this.difficulty = 2;
  }

  async init() {
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const dbBlocks = await Transaction.find().sort({ blockIndex: 1 });
        if (dbBlocks.length > 0) {
          this.chain = dbBlocks.map(dbBlock => {
            return new Block(
              dbBlock.blockIndex,
              new Date(dbBlock.timestamp).toISOString(),
              dbBlock.data,
              dbBlock.previousHash,
              dbBlock.nonce,
              dbBlock.hash,
              dbBlock.signature
            );
          });
          this.pristineChain = this.chain.map(b => ({
            index: b.index,
            timestamp: b.timestamp,
            data: JSON.parse(JSON.stringify(b.data)),
            previousHash: b.previousHash,
            nonce: b.nonce,
            hash: b.hash,
            signature: b.signature
          }));
          console.log(`⛓️  Blockchain loaded ${this.chain.length} blocks from MongoDB`);
          return;
        }
      }
    } catch (error) {
      console.error("⚠️ Failed to load blockchain from MongoDB, running in memory-only mode:", error.message);
    }

    // fallback/initial genesis creation
    const g = this.createGenesisBlock();
    this.chain = [g];
    this.pristineChain = [{
      index: g.index,
      timestamp: g.timestamp,
      data: JSON.parse(JSON.stringify(g.data)),
      previousHash: g.previousHash,
      nonce: g.nonce,
      hash: g.hash,
      signature: g.signature
    }];

    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await Transaction.create({
          blockIndex: g.index,
          timestamp: g.timestamp,
          data: g.data,
          hash: g.hash,
          previousHash: g.previousHash,
          nonce: g.nonce,
          signature: g.signature,
          verified: true
        });
      }
    } catch (e) {
      // ignore db errors on fallback
    }
  }

  createGenesisBlock() {
    const g = new Block(0, new Date().toISOString(), { type: 'genesis', details: { message: 'NEXURA Blockchain Initialized' } }, '0');
    g.mineBlock(2);
    return g;
  }

  getLatestBlock() {
    if (this.chain.length === 0) return null;
    return this.chain[this.chain.length - 1];
  }

  async addBlock(data) {
    const prev = this.getLatestBlock();
    const prevHash = prev ? prev.hash : '0';
    const b = new Block(this.chain.length, new Date().toISOString(), data, prevHash);
    b.mineBlock(this.difficulty);
    this.chain.push(b);
    
    // Save to backup as plain object
    this.pristineChain.push({
      index: b.index,
      timestamp: b.timestamp,
      data: JSON.parse(JSON.stringify(b.data)),
      previousHash: b.previousHash,
      nonce: b.nonce,
      hash: b.hash,
      signature: b.signature
    });

    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await Transaction.create({
          blockIndex: b.index,
          timestamp: b.timestamp,
          data: b.data,
          hash: b.hash,
          previousHash: b.previousHash,
          nonce: b.nonce,
          signature: b.signature,
          verified: true
        });
      }
    } catch (error) {
      console.error("Failed to persist block to MongoDB:", error.message);
    }
    return b;
  }

  async addAcademicRecord(studentName, studentRollNo, details) {
    return this.addBlock({ type: 'academic_record', studentName, studentRollNo, details });
  }

  async addFeePayment(studentName, studentRollNo, amount, semester) {
    return this.addBlock({ type: 'fee_payment', studentName, studentRollNo, details: { amount, semester, paymentDate: new Date().toISOString() } });
  }

  async addCertificate(studentName, studentRollNo, certificateType) {
    return this.addBlock({ type: 'certificate', studentName, studentRollNo, details: { certificateType, issuedDate: new Date().toISOString() } });
  }

  validateChain() {
    const report = {
      isValid: true,
      errors: [],
      totalBlocks: this.chain.length
    };

    if (this.chain.length === 0) return report;

    // Validate genesis
    const genesis = this.chain[0];
    const genesisRecalcHash = genesis.calculateHash();
    if (genesis.hash !== genesisRecalcHash) {
      report.isValid = false;
      report.errors.push({ blockIndex: 0, type: 'HASH_MISMATCH', message: 'Genesis block data has been tampered with.' });
    }
    if (genesis.signature !== genesis.calculateSignature(genesisRecalcHash)) {
      report.isValid = false;
      report.errors.push({ blockIndex: 0, type: 'SIGNATURE_MISMATCH', message: 'Genesis cryptographic signature is invalid.' });
    }

    // Validate rest of chain
    for (let i = 1; i < this.chain.length; i++) {
      const c = this.chain[i];
      const p = this.chain[i - 1];

      const recalcHash = c.calculateHash();
      if (c.hash !== recalcHash) {
        report.isValid = false;
        report.errors.push({ blockIndex: c.index, type: 'HASH_MISMATCH', message: `Block #${c.index} hash mismatch. Data has been modified.` });
      }

      if (c.previousHash !== p.hash) {
        report.isValid = false;
        report.errors.push({ blockIndex: c.index, type: 'LINK_BROKEN', message: `Block #${c.index} link broken. Points to ${c.previousHash.slice(0, 8)} instead of ${p.hash.slice(0, 8)}.` });
      }

      if (c.signature !== c.calculateSignature(recalcHash)) {
        report.isValid = false;
        report.errors.push({ blockIndex: c.index, type: 'SIGNATURE_MISMATCH', message: `Block #${c.index} cryptographic signature check failed.` });
      }
    }
    return report;
  }

  isChainValid() {
    return this.validateChain().isValid;
  }

  async tamperBlock(index, tamperedData) {
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= this.chain.length) {
      throw new Error(`Invalid block index: ${index}`);
    }

    // Update in memory
    this.chain[idx].data = { ...this.chain[idx].data, ...tamperedData };

    // Update in database directly without changing signature or hash to trigger mismatch
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await Transaction.updateOne({ blockIndex: idx }, { $set: { data: this.chain[idx].data } });
      }
    } catch (e) {
      console.error("Failed to tamper block in database:", e.message);
    }
    return this.chain[idx];
  }

  async repairChain() {
    this.chain = this.pristineChain.map(b => new Block(
      b.index,
      b.timestamp,
      JSON.parse(JSON.stringify(b.data)),
      b.previousHash,
      b.nonce,
      b.hash,
      b.signature
    ));
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        for (const block of this.chain) {
          await Transaction.updateOne(
            { blockIndex: block.index },
            {
              $set: {
                data: block.data,
                hash: block.hash,
                previousHash: block.previousHash,
                nonce: block.nonce,
                signature: block.signature
              }
            }
          );
        }
      }
    } catch (e) {
      console.error("Failed to repair database blocks:", e.message);
    }
    return this.validateChain();
  }

  getChain() {
    const report = this.validateChain();
    return this.chain.map(b => {
      const hasError = report.errors.some(err => err.blockIndex === b.index);
      return {
        blockIndex: b.index,
        timestamp: b.timestamp,
        data: b.data,
        hash: b.hash,
        previousHash: b.previousHash,
        nonce: b.nonce,
        signature: b.signature,
        verified: !hasError
      };
    });
  }

  getStats() {
    const types = {};
    this.chain.forEach(b => {
      const t = b.data.type || 'unknown';
      types[t] = (types[t] || 0) + 1;
    });
    const report = this.validateChain();
    return {
      totalBlocks: this.chain.length,
      isValid: report.isValid,
      errors: report.errors,
      blockTypes: types,
      latestHash: this.getLatestBlock() ? this.getLatestBlock().hash : '0',
      difficulty: this.difficulty
    };
  }
}

const blockchain = new BlockchainSimulator();
export default blockchain;
export { BlockchainSimulator };
