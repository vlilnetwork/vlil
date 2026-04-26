const Blockchain = require('./src/blockchain/blockchain');
const { P2PNetwork } = require('./src/network/p2p');
const createRPC = require('./src/api/rpc');
const genesis = require('./genesis.json');

console.log('');
console.log('██╗   ██╗██╗     ██╗██╗     ');
console.log('██║   ██║██║     ██║██║     ');
console.log('██║   ██║██║     ██║██║     ');
console.log('╚██╗ ██╔╝██║     ██║██║     ');
console.log(' ╚████╔╝ ███████╗██║███████╗');
console.log('  ╚═══╝  ╚══════╝╚═╝╚══════╝');
console.log('');
console.log(`🚀 ${genesis.name} | Symbol: ${genesis.symbol} | Chain ID: ${genesis.chainId}`);

// ═══════════════════════════════════════
// 🔗 Initialize Blockchain
// ═══════════════════════════════════════
const blockchain = new Blockchain();
blockchain.difficulty = genesis.difficulty;
blockchain.miningReward = genesis.miningReward;
blockchain.totalSupply = genesis.totalSupply;

// ═══════════════════════════════════════
// 🌐 Initialize P2P Network
// ═══════════════════════════════════════
const p2p = new P2PNetwork(blockchain);
p2p.listen(genesis.p2pPort);

// Connect to peer if provided via CLI
// Example: node index.js ws://192.168.1.1:6001
if (process.argv[2]) {
  p2p.connectToPeer(process.argv[2]);
}

// ═══════════════════════════════════════
// 🖥️  Initialize RPC API
// ═══════════════════════════════════════
const app = createRPC(blockchain, p2p);
app.listen(genesis.rpcPort, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ VLIL TRON Node is LIVE!`);
  console.log(`🖥️  RPC API  → http://localhost:${genesis.rpcPort}`);
  console.log(`🌐 P2P Net  → ws://localhost:${genesis.p2pPort}`);
  console.log(`📊 Status   → http://localhost:${genesis.rpcPort}/status`);
  console.log(`⛏️  Mine     → POST http://localhost:${genesis.rpcPort}/mine`);
  console.log('═══════════════════════════════════════════');
  console.log('');
});