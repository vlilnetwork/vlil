const express = require('express');
const { MESSAGE_TYPES } = require('../network/p2p');
const Transaction = require('../blockchain/transaction');
const Wallet = require('../wallet/wallet');

function createRPC(blockchain, p2p) {
  const app = express();
  app.use(express.json());

  // ═══════════════════════════════════════
  // 🏠 ROOT ROUTE
  // ═══════════════════════════════════════
  app.get('/', (req, res) => {
    res.json({
      name: '🔥 VLIL TRON Blockchain',
      symbol: 'VLIL',
      chainId: 1999,
      version: '1.0.0',
      status: '🟢 Online',
      endpoints: {
        status:      'GET  /status',
        chain:       'GET  /chain',
        block:       'GET  /block/:index',
        balance:     'GET  /balance/:address',
        mine:        'POST /mine',
        transaction: 'POST /transaction',
        newWallet:   'POST /wallet/new',
      }
    });
  });

  // ═══════════════════════════════════════
  // 🔗 BLOCKCHAIN ROUTES
  // ═══════════════════════════════════════

  app.get('/chain', (req, res) => {
    res.json({
      chain: blockchain.chain,
      length: blockchain.chain.length,
      isValid: blockchain.isChainValid()
    });
  });

  app.get('/block/:index', (req, res) => {
    const block = blockchain.chain[req.params.index];
    if (!block) return res.status(404).json({ error: '❌ Block not found' });
    res.json(block);
  });

  app.get('/block/latest', (req, res) => {
    res.json(blockchain.getLatestBlock());
  });

  // ═══════════════════════════════════════
  // 💸 TRANSACTION ROUTES
  // ═══════════════════════════════════════

  app.post('/transaction', (req, res) => {
    try {
      const { from, to, amount } = req.body;
      if (!from || !to || !amount) {
        return res.status(400).json({ error: '❌ Missing from, to, or amount' });
      }
      const tx = new Transaction(from, to, parseFloat(amount));
      blockchain.addTransaction(tx);
      p2p.broadcast(MESSAGE_TYPES.NEW_TRANSACTION, tx);
      res.json({ message: '✅ Transaction added!', transaction: tx });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/transactions/pending', (req, res) => {
    res.json({
      count: blockchain.pendingTransactions.length,
      transactions: blockchain.pendingTransactions
    });
  });

  // ═══════════════════════════════════════
  // ⛏️  MINING ROUTES
  // ═══════════════════════════════════════

  app.post('/mine', (req, res) => {
    try {
      const { minerAddress } = req.body;
      if (!minerAddress) {
        return res.status(400).json({ error: '❌ Miner address required' });
      }
      const block = blockchain.mineBlock(minerAddress);
      p2p.broadcast(MESSAGE_TYPES.NEW_BLOCK, block);
      res.json({ message: '✅ Block mined!', block });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════
  // 👛 WALLET ROUTES
  // ═══════════════════════════════════════

  app.post('/wallet/new', (req, res) => {
    const wallet = new Wallet();
    res.json(wallet.getInfo());
  });

  app.get('/balance/:address', (req, res) => {
    const balance = blockchain.getBalanceOf(req.params.address);
    res.json({ address: req.params.address, balance, symbol: 'VLIL' });
  });

  // ═══════════════════════════════════════
  // 🌐 NODE ROUTES
  // ═══════════════════════════════════════

  app.get('/status', (req, res) => {
    res.json({
      status: '🟢 Online',
      chain: blockchain.chain.length,
      peers: p2p.peers.length,
      pending: blockchain.pendingTransactions.length,
      difficulty: blockchain.difficulty,
      symbol: 'VLIL',
      totalSupply: blockchain.totalSupply
    });
  });

  // ═══════════════════════════════════════
  // 📜 SMART CONTRACT ROUTES
  // ═══════════════════════════════════════

  // Deploy contract
  app.post('/contract/deploy', (req, res) => {
    try {
      const { code, owner, value } = req.body;
      if (!code || !owner) {
        return res.status(400).json({ error: '❌ Missing code or owner' });
      }
      const contract = blockchain.contractEngine.deploy(code, owner, value || 0);
      res.json({
        message: '✅ Contract deployed!',
        address: contract.address,
        owner: contract.owner,
        balance: contract.balance,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Call contract
  app.post('/contract/call', (req, res) => {
    try {
      const { address, method, args, sender, value } = req.body;
      const result = blockchain.contractEngine.call(
        address, method, args || [], sender, value || 0
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get contract
  app.get('/contract/:address', (req, res) => {
    const contract = blockchain.contractEngine.getContract(req.params.address);
    if (!contract) return res.status(404).json({ error: '❌ Contract not found' });
    res.json({
      address: contract.address,
      owner: contract.owner,
      balance: contract.balance,
      storage: contract.storage,
      createdAt: contract.createdAt,
    });
  });

  // Get all contracts
  app.get('/contracts', (req, res) => {
    res.json(blockchain.contractEngine.getAllContracts());
  });
  app.post('/peer/connect', (req, res) => {
    const { address } = req.body;
    p2p.connectToPeer(address);
    res.json({ message: `🔗 Connecting to ${address}` });
  });
// ═══════════════════════════════════════
  // 🪙 VRC-20 TOKEN ROUTES
  // ═══════════════════════════════════════

  // Create new token
  app.post('/token/create', (req, res) => {
    try {
      const { name, symbol, totalSupply, owner } = req.body;
      if (!name || !symbol || !totalSupply || !owner) {
        return res.status(400).json({ error: '❌ Missing name, symbol, totalSupply or owner' });
      }
      const token = blockchain.vrc20Registry.create(name, symbol, totalSupply, owner);
      res.json({ message: '✅ Token created!', token: token.getInfo() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all tokens
  app.get('/tokens', (req, res) => {
    res.json(blockchain.vrc20Registry.getAllTokens());
  });

  // Get token info
  app.get('/token/:address', (req, res) => {
    const token = blockchain.vrc20Registry.getToken(req.params.address);
    if (!token) return res.status(404).json({ error: '❌ Token not found' });
    res.json(token.getInfo());
  });

  // Get token balance
  app.get('/token/:address/balance/:wallet', (req, res) => {
    const token = blockchain.vrc20Registry.getToken(req.params.address);
    if (!token) return res.status(404).json({ error: '❌ Token not found' });
    const balance = token.balanceOf(req.params.wallet);
    res.json({ balance, symbol: token.symbol, wallet: req.params.wallet });
  });

  // Transfer token
  app.post('/token/:address/transfer', (req, res) => {
    try {
      const token = blockchain.vrc20Registry.getToken(req.params.address);
      if (!token) return res.status(404).json({ error: '❌ Token not found' });
      const { from, to, amount } = req.body;
      const result = token.transfer(from, to, amount);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Mint token
  app.post('/token/:address/mint', (req, res) => {
    try {
      const token = blockchain.vrc20Registry.getToken(req.params.address);
      if (!token) return res.status(404).json({ error: '❌ Token not found' });
      const { caller, to, amount } = req.body;
      const result = token.mint(caller, to, amount);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Burn token
  app.post('/token/:address/burn', (req, res) => {
    try {
      const token = blockchain.vrc20Registry.getToken(req.params.address);
      if (!token) return res.status(404).json({ error: '❌ Token not found' });
      const { from, amount } = req.body;
      const result = token.burn(from, amount);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  return app;
}

module.exports = createRPC;