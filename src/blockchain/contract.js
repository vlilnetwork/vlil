const { VM } = require('vm2');
const crypto = require('crypto');

class SmartContract {
  constructor(address, code, owner, balance = 0) {
    this.address = address;
    this.code = code;
    this.owner = owner;
    this.balance = balance;
    this.storage = {};
    this.createdAt = Date.now();
  }

  // รัน function ใน contract
  execute(method, args, sender, value = 0) {
    const vm = new VM({
      timeout: 1000, // 1 second max
      sandbox: {
        // Contract context
        storage: this.storage,
        balance: this.balance,
        sender: sender,
        value: value,
        address: this.address,
        // Utility functions
        log: (msg) => console.log(`📜 Contract Log: ${msg}`),
        transfer: (to, amount) => {
          if (amount > this.balance) throw new Error('❌ Insufficient contract balance');
          this.balance -= amount;
          return { to, amount };
        }
      }
    });

    try {
      const result = vm.run(`
        ${this.code}
        ${method}(${JSON.stringify(args)});
      `);
      return { success: true, result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

class ContractEngine {
  constructor() {
    this.contracts = {};
  }

  // Deploy new contract
  deploy(code, owner, value = 0) {
    const address = '0xc' + crypto
      .createHash('sha256')
      .update(code + owner + Date.now())
      .digest('hex')
      .slice(-38);

    const contract = new SmartContract(address, code, owner, value);
    this.contracts[address] = contract;

    console.log(`📜 Contract deployed: ${address}`);
    console.log(`👤 Owner: ${owner}`);
    return contract;
  }

  // Call contract method
  call(address, method, args, sender, value = 0) {
    const contract = this.contracts[address];
    if (!contract) throw new Error('❌ Contract not found');
    return contract.execute(method, args, sender, value);
  }

  // Get contract info
  getContract(address) {
    return this.contracts[address] || null;
  }

  // Get all contracts
  getAllContracts() {
    return Object.keys(this.contracts).map(addr => ({
      address: addr,
      owner: this.contracts[addr].owner,
      balance: this.contracts[addr].balance,
      createdAt: this.contracts[addr].createdAt,
      storage: this.contracts[addr].storage,
    }));
  }
}

module.exports = { SmartContract, ContractEngine };