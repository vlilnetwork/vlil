class StakingPool {
    constructor(rewardRate = 0.1) {
      this.stakes = {};
      this.rewardRate = rewardRate; // 10% APY
      this.totalStaked = 0;
      this.createdAt = Date.now();
      console.log(`🥩 Staking Pool Initialized! APY: ${rewardRate * 100}%`);
    }
  
    // Stake VLIL
    stake(address, amount) {
      if (amount <= 0) throw new Error('❌ Amount must be greater than 0');
      if (!this.stakes[address]) {
        this.stakes[address] = {
          amount: 0,
          stakedAt: Date.now(),
          lastClaim: Date.now(),
          totalRewards: 0
        };
      }
      // Claim pending rewards first
      this._claimRewards(address);
      this.stakes[address].amount += amount;
      this.totalStaked += amount;
      console.log(`🥩 Staked: ${amount} VLIL by ${address.slice(0,10)}...`);
      return this.getStakeInfo(address);
    }
  
    // Unstake VLIL
    unstake(address, amount) {
      const stake = this.stakes[address];
      if (!stake) throw new Error('❌ No stake found');
      if (stake.amount < amount) throw new Error('❌ Insufficient staked amount');
      // Claim rewards before unstaking
      const rewards = this._claimRewards(address);
      stake.amount -= amount;
      this.totalStaked -= amount;
      console.log(`📤 Unstaked: ${amount} VLIL by ${address.slice(0,10)}...`);
      return { unstaked: amount, rewards, remaining: stake.amount };
    }
  
    // Calculate pending rewards
    calculateRewards(address) {
      const stake = this.stakes[address];
      if (!stake || stake.amount === 0) return 0;
      const timeElapsed = (Date.now() - stake.lastClaim) / 1000; // seconds
      const secondsPerYear = 365 * 24 * 60 * 60;
      const rewards = stake.amount * this.rewardRate * (timeElapsed / secondsPerYear);
      return rewards;
    }
  
    // Claim rewards
    _claimRewards(address) {
      const rewards = this.calculateRewards(address);
      if (rewards > 0) {
        this.stakes[address].totalRewards += rewards;
        this.stakes[address].lastClaim = Date.now();
        console.log(`🎁 Rewards: ${rewards.toFixed(6)} VLIL → ${address.slice(0,10)}...`);
      }
      return rewards;
    }
  
    // Claim rewards manually
    claimRewards(address) {
      const stake = this.stakes[address];
      if (!stake) throw new Error('❌ No stake found');
      const rewards = this._claimRewards(address);
      return { claimed: rewards, totalRewards: stake.totalRewards };
    }
  
    // Get stake info
    getStakeInfo(address) {
      const stake = this.stakes[address];
      if (!stake) return { address, staked: 0, pendingRewards: 0, totalRewards: 0 };
      return {
        address,
        staked: stake.amount,
        pendingRewards: this.calculateRewards(address),
        totalRewards: stake.totalRewards,
        stakedAt: stake.stakedAt,
        apy: `${this.rewardRate * 100}%`
      };
    }
  
    // Get pool info
    getPoolInfo() {
      return {
        totalStaked: this.totalStaked,
        rewardRate: `${this.rewardRate * 100}% APY`,
        totalStakers: Object.keys(this.stakes).filter(a => this.stakes[a].amount > 0).length,
        createdAt: this.createdAt
      };
    }
  }
  
  module.exports = { StakingPool };