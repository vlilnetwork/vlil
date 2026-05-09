const cors = require('cors');
const express = require('express');
const { MESSAGE_TYPES } = require('../network/p2p');
const Transaction = require('../blockchain/transaction');
const Wallet = require('../wallet/wallet');

function createRPC(blockchain, p2p) {
  const app = express();
  app.use(express.json());app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

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
  // CMC Supply API
app.get('/supply/total', (req, res) => res.send('999999500'));
app.get('/supply/circulating', (req, res) => res.send('999999500'));
app.get('/supply/max', (req, res) => res.send('1000000000'));
// ═══════════════════════════════════════
  // 🖼️  VRC-721 NFT ROUTES
  // ═══════════════════════════════════════

  // Create NFT Collection
  app.post('/nft/create', (req, res) => {
    try {
      const { name, symbol, owner } = req.body;
      if (!name || !symbol || !owner) {
        return res.status(400).json({ error: '❌ Missing name, symbol or owner' });
      }
      const collection = blockchain.vrc721Registry.create(name, symbol, owner);
      res.json({ message: '✅ NFT Collection created!', collection: collection.getInfo() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mint NFT
  app.post('/nft/:address/mint', (req, res) => {
    try {
      const collection = blockchain.vrc721Registry.getCollection(req.params.address);
      if (!collection) return res.status(404).json({ error: '❌ Collection not found' });
      const { to, name, description, imageURI } = req.body;
      const token = collection.mint(to, name, description, imageURI || '');
      res.json({ message: '✅ NFT Minted!', token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Transfer NFT
  app.post('/nft/:address/transfer', (req, res) => {
    try {
      const collection = blockchain.vrc721Registry.getCollection(req.params.address);
      if (!collection) return res.status(404).json({ error: '❌ Collection not found' });
      const { from, to, tokenId } = req.body;
      const token = collection.transfer(from, to, tokenId);
      res.json({ message: '✅ NFT Transferred!', token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get all NFTs by owner
  app.get('/nft/:address/owner/:wallet', (req, res) => {
    const collection = blockchain.vrc721Registry.getCollection(req.params.address);
    if (!collection) return res.status(404).json({ error: '❌ Collection not found' });
    const tokens = collection.getTokensByOwner(req.params.wallet);
    res.json({ tokens, count: tokens.length });
  });

  // Get all collections
  app.get('/nft/collections', (req, res) => {
    res.json(blockchain.vrc721Registry.getAllCollections());
  });

  // Get collection info
  app.get('/nft/:address', (req, res) => {
    const collection = blockchain.vrc721Registry.getCollection(req.params.address);
    if (!collection) return res.status(404).json({ error: '❌ Collection not found' });
    res.json(collection.getInfo());
  });
  // ═══════════════════════════════════════
  // 🏦 DEX ROUTES
  // ═══════════════════════════════════════

  app.post('/dex/pool/create', (req, res) => {
    try {
      const { tokenA, tokenB } = req.body;
      if (!tokenA || !tokenB) return res.status(400).json({ error: '❌ Missing tokenA or tokenB' });
      const pool = blockchain.dex.createPool(tokenA, tokenB);
      res.json({ message: '✅ Pool created!', pool: pool.getInfo() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/dex/pool/:address/add', (req, res) => {
    try {
      const pool = blockchain.dex.getPool(req.params.address);
      if (!pool) return res.status(404).json({ error: '❌ Pool not found' });
      const { provider, amountA, amountB } = req.body;
      const result = pool.addLiquidity(provider, parseFloat(amountA), parseFloat(amountB));
      res.json({ message: '✅ Liquidity added!', result, pool: pool.getInfo() });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/dex/pool/:address/swapAB', (req, res) => {
    try {
      const pool = blockchain.dex.getPool(req.params.address);
      if (!pool) return res.status(404).json({ error: '❌ Pool not found' });
      const { amountIn } = req.body;
      const result = pool.swapAforB(parseFloat(amountIn));
      res.json({ message: '✅ Swap successful!', result, pool: pool.getInfo() });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/dex/pool/:address/swapBA', (req, res) => {
    try {
      const pool = blockchain.dex.getPool(req.params.address);
      if (!pool) return res.status(404).json({ error: '❌ Pool not found' });
      const { amountIn } = req.body;
      const result = pool.swapBforA(parseFloat(amountIn));
      res.json({ message: '✅ Swap successful!', result, pool: pool.getInfo() });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/dex/pools', (req, res) => {
    res.json(blockchain.dex.getAllPools());
  });

  app.get('/dex/pool/:address', (req, res) => {
    const pool = blockchain.dex.getPool(req.params.address);
    if (!pool) return res.status(404).json({ error: '❌ Pool not found' });
    res.json(pool.getInfo());
  });
  return app;
}

module.exports = createRPC;