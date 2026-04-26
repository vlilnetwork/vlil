const crypto = require('crypto');

class VRC20Token {
  constructor(name, symbol, totalSupply, owner) {
    this.name = name;
    this.symbol = symbol;
    this.totalSupply = totalSupply;
    this.owner = owner;
    this.decimals = 18;
    this.address = this.generateAddress();
    this.balances = { [owner]: totalSupply };
    this.allowances = {};
    this.createdAt = Date.now();
    console.log(`🪙 VRC-20 Token Created: ${name} (${symbol})`);
    console.log(`📬 Token Address: ${this.address}`);
  }

  generateAddress() {
    return '0xt' + crypto
      .createHash('sha256')
      .update(this.name + this.symbol + Date.now())
      .digest('hex')
      .slice(-38);
  }

  // Get balance
  balanceOf(address) {
    return this.balances[address] || 0;
  }

  // Transfer tokens
  transfer(from, to, amount) {
    if (!this.balances[from] || this.balances[from] < amount) {
      throw new Error(`❌ Insufficient ${this.symbol} balance`);
    }
    if (amount <= 0) throw new Error('❌ Amount must be greater than 0');

    this.balances[from] -= amount;
    this.balances[to] = (this.balances[to] || 0) + amount;

    console.log(`💸 ${amount} ${this.symbol}: ${from.slice(0,10)}... → ${to.slice(0,10)}...`);
    return {
      success: true,
      from, to, amount,
      symbol: this.symbol,
      timestamp: Date.now()
    };
  }

  // Approve spender
  approve(owner, spender, amount) {
    if (!this.allowances[owner]) this.allowances[owner] = {};
    this.allowances[owner][spender] = amount;
    console.log(`✅ Approved: ${spender.slice(0,10)}... to spend ${amount} ${this.symbol}`);
    return true;
  }

  // Check allowance
  allowance(owner, spender) {
    return (this.allowances[owner] && this.allowances[owner][spender]) || 0;
  }

  // Transfer from (delegated)
  transferFrom(spender, from, to, amount) {
    const allowed = this.allowance(from, spender);
    if (allowed < amount) throw new Error('❌ Allowance exceeded');
    this.allowances[from][spender] -= amount;
    return this.transfer(from, to, amount);
  }

  // Mint new tokens (owner only)
  mint(caller, to, amount) {
    if (caller !== this.owner) throw new Error('❌ Only owner can mint');
    this.balances[to] = (this.balances[to] || 0) + amount;
    this.totalSupply += amount;
    console.log(`🏭 Minted ${amount} ${this.symbol} → ${to.slice(0,10)}...`);
    return { success: true, minted: amount, to, totalSupply: this.totalSupply };
  }

  // Burn tokens
  burn(from, amount) {
    if (!this.balances[from] || this.balances[from] < amount) {
      throw new Error(`❌ Insufficient ${this.symbol} to burn`);
    }
    this.balances[from] -= amount;
    this.totalSupply -= amount;
    console.log(`🔥 Burned ${amount} ${this.symbol} from ${from.slice(0,10)}...`);
    return { success: true, burned: amount, totalSupply: this.totalSupply };
  }

  // Get token info
  getInfo() {
    return {
      address: this.address,
      name: this.name,
      symbol: this.symbol,
      totalSupply: this.totalSupply,
      decimals: this.decimals,
      owner: this.owner,
      createdAt: this.createdAt,
      holders: Object.keys(this.balances).length
    };
  }
}

class VRC20Registry {
  constructor() {
    this.tokens = {};
  }

  // Create new token
  create(name, symbol, totalSupply, owner) {
    const token = new VRC20Token(name, symbol, totalSupply, owner);
    this.tokens[token.address] = token;
    return token;
  }

  // Get token by address
  getToken(address) {
    return this.tokens[address] || null;
  }

  // Get all tokens
  getAllTokens() {
    return Object.values(this.tokens).map(t => t.getInfo());
  }
}

module.exports = { VRC20Token, VRC20Registry };