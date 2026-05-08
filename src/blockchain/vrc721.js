const crypto = require('crypto');

class VRC721Token {
  constructor(tokenId, name, description, imageURI, owner) {
    this.tokenId = tokenId;
    this.name = name;
    this.description = description;
    this.imageURI = imageURI;
    this.owner = owner;
    this.createdAt = Date.now();
    this.history = [{ from: null, to: owner, timestamp: Date.now() }];
  }
}

class VRC721Collection {
  constructor(name, symbol, owner) {
    this.address = '0xn' + crypto
      .createHash('sha256')
      .update(name + symbol + Date.now())
      .digest('hex').slice(-38);
    this.name = name;
    this.symbol = symbol;
    this.owner = owner;
    this.tokens = {};
    this.nextTokenId = 1;
    this.createdAt = Date.now();
    console.log(`🖼️  NFT Collection Created: ${name} (${symbol})`);
    console.log(`📬 Collection Address: ${this.address}`);
  }

  // Mint new NFT
  mint(to, name, description, imageURI) {
    const tokenId = this.nextTokenId++;
    const token = new VRC721Token(tokenId, name, description, imageURI, to);
    this.tokens[tokenId] = token;
    console.log(`🎨 NFT Minted: #${tokenId} "${name}" → ${to.slice(0,10)}...`);
    return token;
  }

  // Transfer NFT
  transfer(from, to, tokenId) {
    const token = this.tokens[tokenId];
    if (!token) throw new Error('❌ Token not found');
    if (token.owner !== from) throw new Error('❌ Not token owner');
    token.owner = to;
    token.history.push({ from, to, timestamp: Date.now() });
    console.log(`🔄 NFT #${tokenId} transferred: ${from.slice(0,10)} → ${to.slice(0,10)}`);
    return token;
  }

  // Get tokens by owner
  getTokensByOwner(address) {
    return Object.values(this.tokens).filter(t => t.owner === address);
  }

  // Get collection info
  getInfo() {
    return {
      address: this.address,
      name: this.name,
      symbol: this.symbol,
      owner: this.owner,
      totalSupply: Object.keys(this.tokens).length,
      createdAt: this.createdAt
    };
  }
}

class VRC721Registry {
  constructor() {
    this.collections = {};
  }

  create(name, symbol, owner) {
    const collection = new VRC721Collection(name, symbol, owner);
    this.collections[collection.address] = collection;
    return collection;
  }

  getCollection(address) {
    return this.collections[address] || null;
  }

  getAllCollections() {
    return Object.values(this.collections).map(c => c.getInfo());
  }
}

module.exports = { VRC721Token, VRC721Collection, VRC721Registry };