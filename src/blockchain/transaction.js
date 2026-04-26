const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(from, to, amount) {
    this.id = uuidv4();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = null;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.from + this.to + this.amount + this.timestamp)
      .digest('hex');
  }

  isValid() {
    // Mining reward — no signature needed
    if (this.from === null) return true;

    // Basic validation
    if (!this.to) throw new Error('❌ Missing recipient address');
    if (this.amount <= 0) throw new Error('❌ Amount must be greater than 0');

    // Signature optional for now (Phase 1)
    // Will enforce in Phase 2 with full wallet signing
    return true;
  }
}

module.exports = Transaction;