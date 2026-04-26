# VLIL Blockchain — Whitepaper
**Version 1.0 | 2026**

---

## Abstract

VLIL is an independent blockchain network built from the ground up
using Node.js. It implements a Proof-of-Work consensus mechanism,
peer-to-peer networking, a cryptographic wallet system, and a
REST API layer. VLIL aims to provide a transparent, decentralized,
and open financial network accessible to everyone.

---

## 1. Introduction

The modern financial system relies heavily on centralized institutions.
VLIL offers an alternative — a decentralized blockchain where
transactions are verified by network participants, not banks.

VLIL is:
- Open source
- Permissionless
- Decentralized
- Censorship resistant

---

## 2. Network Overview

| Property | Value |
|----------|-------|
| Name | VLIL |
| Symbol | VLIL |
| Chain ID | 1999 |
| Total Supply | 1,000,000,000 VLIL |
| Mining Reward | 50 VLIL per block |
| Algorithm | SHA-256 Proof of Work |
| Block Time | ~10 seconds |
| Difficulty | Dynamic |
| P2P Protocol | WebSocket |

---

## 3. Consensus Mechanism

VLIL uses **Proof of Work (PoW)** — the same battle-tested
algorithm used by Bitcoin.

### How it works:
1. Transactions are broadcast to the network
2. Miners collect transactions into a block
3. Miners compete to find a valid hash
4. The winning miner broadcasts the new block
5. Other nodes verify and add it to their chain
6. Miner receives 50 VLIL reward

### Hash Target:

The difficulty adjusts to maintain consistent block times
as more miners join the network.

---

## 4. Wallet System

VLIL wallets use **secp256k1 elliptic curve cryptography** —
the same standard used by Bitcoin and Ethereum.

### Key Generation:

### Address Format:

---

## 5. Transaction Model

Every VLIL transaction contains:

```json
{
  "id": "uuid-v4",
  "from": "0xSENDER_ADDRESS",
  "to": "0xRECEIVER_ADDRESS",
  "amount": 10,
  "timestamp": 1775899334745,
  "signature": null
}
```

### Transaction Lifecycle:

Transactions are considered final after being included
in a mined block and confirmed by the network.

---

## 6. Block Structure

Each block in the VLIL chain contains:

```json
{
  "index": 1,
  "previousHash": "0000abc...",
  "timestamp": 1775897417841,
  "transactions": [...],
  "nonce": 13746,
  "difficulty": 4,
  "hash": "0000xyz..."
}
```

The chain is secured by cryptographic linking —
each block references the hash of the previous block,
making tampering computationally infeasible.

---

## 7. P2P Network

VLIL nodes communicate via **WebSocket protocol**.

### Node Discovery:

### Message Types:

---

## 8. Token Economics

### Supply Distribution:

### Emission Schedule:

---

## 9. API Reference

VLIL nodes expose a REST API for interaction:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Node information |
| GET | /status | Network status |
| GET | /chain | Full blockchain |
| GET | /block/:index | Single block |
| GET | /balance/:address | Wallet balance |
| POST | /mine | Mine new block |
| POST | /transaction | Send VLIL |
| POST | /wallet/new | Create wallet |

### Live API:

---

## 10. Running a Node

Anyone can run a VLIL node and participate in the network.

### Requirements:
- Node.js v18+
- npm
- 1GB RAM minimum
- Internet connection

### Setup:
```bash
git clone https://github.com/vlilnetwork/vlil.git
cd vlil
npm install
node index.js
```

### Connect to Mainnet:
```bash
node index.js ws://vlil-production.up.railway.app:6001
```

---

## 11. Security

- SHA-256 cryptographic hashing
- secp256k1 elliptic curve signatures
- Chain validation on every block
- Longest chain rule for fork resolution
- Immutable block history

---

## 12. Roadmap

### Phase 1 — Foundation ✅
- [x] Core blockchain engine
- [x] Proof of Work consensus
- [x] Wallet system
- [x] P2P networking
- [x] REST API
- [x] Block Explorer UI
- [x] Mainnet launch

### Phase 2 — Growth 🔄
- [ ] Smart contract support
- [ ] Token standard (VRC-20)
- [ ] Mobile wallet app
- [ ] Hardware wallet support
- [ ] Chain explorer website

### Phase 3 — Ecosystem 🔮
- [ ] DEX (Decentralized Exchange)
- [ ] NFT support
- [ ] DAO governance
- [ ] Cross-chain bridge
- [ ] CoinMarketCap listing

---

## 13. Conclusion

VLIL represents a new generation of blockchain networks —
built transparently, operated openly, and accessible to all.
By combining proven cryptographic principles with modern
networking technology, VLIL provides a solid foundation
for decentralized applications and financial services.

---

## Links

- 🌐 API: https://vlil-production.up.railway.app
- 💻 GitHub: https://github.com/vlilnetwork/vlil
- 📊 Explorer: Coming soon

---

*VLIL Whitepaper v1.0 — 2026*
*Built by VLI Network*