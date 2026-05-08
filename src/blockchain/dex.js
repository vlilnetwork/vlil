cat > "/Users/lilchen/Desktop/CURSOR /VLIL TRON/src/blockchain/dex.js" << 'EOF'
const crypto = require('crypto');

class LiquidityPool {
  constructor(tokenA, tokenB) {
    this.address = '0xd' + crypto.createHash('sha256').update(tokenA + tokenB + Date.now()).digest('hex').slice(-38);
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.reserveA = 0;
    this.reserveB = 0;
    this.totalShares = 0;
    this.shares = {};
    this.fee = 0.003;
    this.createdAt = Date.now();
    console.log(`💧 Pool Created: ${tokenA}/${tokenB}`);
  }

  addLiquidity(provider, amountA, amountB) {
    let shares;
    if (this.totalShares === 0) {
      shares = Math.sqrt(amountA * amountB);
    } else {
      shares = Math.min(
        (amountA / this.reserveA) * this.totalShares,
        (amountB / this.reserveB) * this.totalShares
      );
    }
    this.reserveA += amountA;
    this.reserveB += amountB;
    this.totalShares += shares;
    this.shares[provider] = (this.shares[provider] || 0) + shares;
    console.log(`💧 Liquidity Added: ${amountA} ${this.tokenA} + ${amountB} ${this.tokenB}`);
    return { shares, provider };
  }

  removeLiquidity(provider, shares) {
    const providerShares = this.shares[provider] || 0;
    if (providerShares < shares) throw new Error('❌ Insufficient shares');
    const amountA = (shares / this.totalShares) * this.reserveA;
    const amountB = (shares / this.totalShares) * this.reserveB;
    this.reserveA -= amountA;
    this.reserveB -= amountB;
    this.totalShares -= shares;
    this.shares[provider] -= shares;
    return { amountA, amountB };
  }

  swapAforB(amountIn) {
    if (this.reserveA === 0 || this.reserveB === 0) throw new Error('❌ Pool is empty');
    const amountInWithFee = amountIn * (1 - this.fee);
    const amountOut = (amountInWithFee * this.reserveB) / (this.reserveA + amountInWithFee);
    this.reserveA += amountIn;
    this.reserveB -= amountOut;
    console.log(`🔄 Swap: ${amountIn} ${this.tokenA} → ${amountOut.toFixed(6)} ${this.tokenB}`);
    return { amountOut, price: this.getPrice() };
  }

  swapBforA(amountIn) {
    if (this.reserveA === 0 || this.reserveB === 0) throw new Error('❌ Pool is empty');
    const amountInWithFee = amountIn * (1 - this.fee);
    const amountOut = (amountInWithFee * this.reserveA) / (this.reserveB + amountInWithFee);
    this.reserveB += amountIn;
    this.reserveA -= amountOut;
    console.log(`🔄 Swap: ${amountIn} ${this.tokenB} → ${amountOut.toFixed(6)} ${this.tokenA}`);
    return { amountOut, price: this.getPrice() };
  }

  getPrice() {
    if (this.reserveA === 0) return 0;
    return this.reserveB / this.reserveA;
  }

  getInfo() {
    return {
      address: this.address,
      pair: `${this.tokenA}/${this.tokenB}`,
      reserveA: this.reserveA,
      reserveB: this.reserveB,
      price: this.getPrice(),
      totalShares: this.totalShares,
      fee: `${this.fee * 100}%`,
      createdAt: this.createdAt
    };
  }
}

class DEX {
  constructor() {
    this.pools = {};
    console.log('🏦 VLIL DEX Initialized!');
  }

  createPool(tokenA, tokenB) {
    const key = `${tokenA}-${tokenB}`;
    if (this.pools[key]) return this.pools[key];
    const pool = new LiquidityPool(tokenA, tokenB);
    this.pools[key] = pool;
    this.pools[pool.address] = pool;
    return pool;
  }

  getPool(tokenAorAddress, tokenB) {
    const key = tokenB ? `${tokenAorAddress}-${tokenB}` : tokenAorAddress;
    return this.pools[key] || null;
  }

  getAllPools() {
    const seen = new Set();
    return Object.values(this.pools).filter(p => {
      if (seen.has(p.address)) return false;
      seen.add(p.address);
      return true;
    }).map(p => p.getInfo());
  }
}

module.exports = { DEX, LiquidityPool };
EOF 