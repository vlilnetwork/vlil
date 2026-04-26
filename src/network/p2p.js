const WebSocket = require('ws');

const MESSAGE_TYPES = {
  CHAIN: 'CHAIN',
  NEW_BLOCK: 'NEW_BLOCK',
  NEW_TRANSACTION: 'NEW_TRANSACTION',
  REQUEST_CHAIN: 'REQUEST_CHAIN',
};

class P2PNetwork {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.peers = [];
  }

  listen(port) {
    const server = new WebSocket.Server({ port });
    server.on('connection', (socket) => {
      this.handleConnection(socket);
    });
    console.log(`🌐 P2P Network listening on port ${port}`);
  }

  connectToPeer(address) {
    const socket = new WebSocket(address);
    socket.on('open', () => {
      this.handleConnection(socket);
      console.log(`🔗 Connected to peer: ${address}`);
    });
    socket.on('error', (err) => {
      console.log(`❌ Peer connection failed: ${address}`);
    });
  }

  handleConnection(socket) {
    this.peers.push(socket);
    console.log(`👥 Total peers: ${this.peers.length}`);

    // Send our chain to new peer
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.CHAIN,
      data: this.blockchain.chain
    }));

    socket.on('message', (msg) => {
      const message = JSON.parse(msg);
      this.handleMessage(message, socket);
    });

    socket.on('close', () => {
      this.peers = this.peers.filter(p => p !== socket);
      console.log(`👋 Peer disconnected. Total peers: ${this.peers.length}`);
    });
  }

  handleMessage(message, socket) {
    switch (message.type) {
      case MESSAGE_TYPES.CHAIN:
        this.handleChainReceived(message.data);
        break;
      case MESSAGE_TYPES.NEW_BLOCK:
        console.log('📦 New block received from peer');
        this.handleChainReceived([...this.blockchain.chain, message.data]);
        break;
      case MESSAGE_TYPES.NEW_TRANSACTION:
        console.log('📨 New transaction received from peer');
        this.blockchain.pendingTransactions.push(message.data);
        break;
      case MESSAGE_TYPES.REQUEST_CHAIN:
        socket.send(JSON.stringify({
          type: MESSAGE_TYPES.CHAIN,
          data: this.blockchain.chain
        }));
        break;
    }
  }

  handleChainReceived(newChain) {
    if (newChain.length > this.blockchain.chain.length) {
      console.log('🔄 Replacing chain with longer chain from peer...');
      this.blockchain.chain = newChain;
    }
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    this.peers.forEach(peer => {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(message);
      }
    });
    console.log(`📡 Broadcasted: ${type} to ${this.peers.length} peers`);
  }
}

module.exports = { P2PNetwork, MESSAGE_TYPES };