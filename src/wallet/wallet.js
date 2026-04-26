const EC = require('elliptic').ec;
const crypto = require('crypto');
const ec = new EC('secp256k1'); // Same curve as Bitcoin & Ethereum

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.privateKey = this.keyPair.getPrivate('hex');
    this.publicKey = this.keyPair.getPublic('hex');
    this.address = this.generateAddress();
    console.log('👛 New Wallet Created!');
    console.log('📬 Address:', this.address);
  }

  generateAddress() {
    // Hash public key → address (like Ethereum style)
    return '0x' + crypto
      .createHash('sha256')
      .update(this.publicKey)
      .digest('hex')
      .slice(-40); // Last 40 chars = 20 bytes
  }

  sign(dataHash) {
    const signature = this.keyPair.sign(dataHash);
    return signature.toDER('hex');
  }

  static verify(publicKey, dataHash, signature) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(dataHash, signature);
  }

  getInfo() {
    return {
      address: this.address,
      publicKey: this.publicKey,
      privateKey: this.privateKey, // ⚠️ Never share this!
    };
  }
}

module.exports = Wallet;