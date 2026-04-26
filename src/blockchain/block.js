const crypto = require('crypto');

class Block {
  constructor(index, previousHash, timestamp, transactions, nonce = 0, difficulty = 4) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  hasValidHash() {
    return this.hash.startsWith('0'.repeat(this.difficulty));
  }
}

module.exports = Block;