const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class Keystore {
  constructor(dir = './keystore') {
    this.dir = dir;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  }

  // Save encrypted wallet to disk
  save(wallet, password) {
    const cipher = crypto.createCipher('aes-256-cbc', password);
    let encrypted = cipher.update(wallet.privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const filename = `${wallet.address}.json`;
    const filepath = path.join(this.dir, filename);

    fs.writeFileSync(filepath, JSON.stringify({
      address: wallet.address,
      publicKey: wallet.publicKey,
      encryptedPrivateKey: encrypted,
      createdAt: Date.now()
    }));

    console.log(`🔐 Wallet saved: ${filepath}`);
    return filepath;
  }

  // Load wallet from disk
  load(address, password) {
    const filepath = path.join(this.dir, `${address}.json`);
    if (!fs.existsSync(filepath)) throw new Error('❌ Wallet not found');

    const data = JSON.parse(fs.readFileSync(filepath));
    const decipher = crypto.createDecipher('aes-256-cbc', password);
    let decrypted = decipher.update(data.encryptedPrivateKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { ...data, privateKey: decrypted };
  }
}

module.exports = Keystore;