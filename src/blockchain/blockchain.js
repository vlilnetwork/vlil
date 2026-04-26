const Block = require('./block');
const Transaction = require('./transaction');
const { ContractEngine } = require('./contract');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 50;
    this.totalSupply = 1_000_000_000;
    this.balances = {};
    this.contractEngine = new ContractEngine();
    this.rebuildBalances();
  }

  createGenesisBlock() {
    const genesis = new Block(0, '0000000000000000', Date.now(), [], 0, 4);
    genesis.hash = genesis.calculateHash();
    console.log('🌍 Genesis Block Created:', genesis.hash);
    return genesis;
  }

  rebuildBalances() {
    this.balances = {};
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from) this.balances[tx.from] = (this.balances[tx.from] || 0) - tx.amount;
        if (tx.to) this.balances[tx.to] = (this.balances[tx.to] || 0) + tx.amount;
      }
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getBalanceOf(address) {
    return this.balances[address] || 0;
  }

  addTransaction(transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error('❌ Transaction must have from and to address');
    }
    if (!transaction.isValid()) {
      throw new Error('❌ Cannot add invalid transaction');
    }
    if (transaction.from !== null) {
      const balance = this.getBalanceOf(transaction.from);
      if (balance < transaction.amount) {
        throw new Error(`❌ Insufficient balance. Have: ${balance} VLIL, Need: ${transaction.amount} VLIL`);
      }
    }
    this.pendingTransactions.push(transaction);
    console.log(`📨 TX Added: ${transaction.from} → ${transaction.to} | ${transaction.amount} VLIL`);
  }

  mineBlock(minerAddress) {
    const rewardTx = new Transaction(null, minerAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.chain.length,
      this.getLatestBlock().hash,
      Date.now(),
      this.pendingTransactions,
      0,
      this.difficulty
    );

    console.log('⛏️  Mining block...');
    while (!block.hash.startsWith('0'.repeat(this.difficulty))) {
      block.nonce++;
      block.hash = block.calculateHash();
    }

    this.chain.push(block);
    console.log(`✅ Block #${block.index} mined! Hash: ${block.hash}`);

    this.pendingTransactions.forEach(tx => {
      if (tx.from) this.balances[tx.from] = (this.balances[tx.from] || 0) - tx.amount;
      if (tx.to) this.balances[tx.to] = (this.balances[tx.to] || 0) + tx.amount;
    });

    this.pendingTransactions = [];
    return block;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

module.exports = Blockchain;