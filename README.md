cat > README.md << 'EOF'
# VLIL Blockchain ⚡

> Real Blockchain & Mainnet — Built from scratch

![VLIL](https://img.shields.io/badge/VLIL-Mainnet-red?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v24-green?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-vlilnetwork-black?style=for-the-badge)

---

## 🌍 Live Network

| Service | URL |
|---------|-----|
| 🖥️ API | https://vlil-production.up.railway.app |
| 📊 Status | https://vlil-production.up.railway.app/status |
| 🔗 Chain | https://vlil-production.up.railway.app/chain |
| 💻 GitHub | https://github.com/vlilnetwork/vlil |

---

## 🔥 What is VLIL?

VLIL is a real blockchain network built from scratch using Node.js.
It features a fully functional Proof-of-Work consensus mechanism,
P2P networking, wallet system, and REST API.

---

## ⚡ Features

- ✅ Real Proof-of-Work Mining
- ✅ P2P Network (WebSocket)
- ✅ Wallet System (secp256k1)
- ✅ REST API (JSON-RPC)
- ✅ Block Explorer UI
- ✅ Transaction System
- ✅ 1,000,000,000 VLIL Total Supply
- ✅ 50 VLIL Mining Reward per Block

---

## 📊 Network Info

| Property | Value |
|----------|-------|
| Symbol | VLIL |
| Chain ID | 1999 |
| Total Supply | 1,000,000,000 VLIL |
| Mining Reward | 50 VLIL |
| Difficulty | 4 |
| Algorithm | SHA-256 PoW |
| P2P Port | 6001 |
| RPC Port | 3000 |

---

## 🚀 Run Your Own Node

### Requirements
- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/vlilnetwork/vlil.git
cd vlil
npm install
node index.js
```

### Connect to Mainnet

```bash
node index.js ws://vlil-production.up.railway.app:6001
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Node info |
| GET | /status | Node status |
| GET | /chain | Full blockchain |
| GET | /block/:index | Get block |
| GET | /balance/:address | Get balance |
| POST | /mine | Mine a block |
| POST | /transaction | Send VLIL |
| POST | /wallet/new | Create wallet |

---

## 💸 Example Usage

### Create Wallet
```bash
curl -X POST https://vlil-production.up.railway.app/wallet/new
```

### Check Balance
```bash
curl https://vlil-production.up.railway.app/balance/0xYOUR_ADDRESS
```

### Mine Block
```bash
curl -X POST https://vlil-production.up.railway.app/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "0xYOUR_ADDRESS"}'
```

### Send Transaction
```bash
curl -X POST https://vlil-production.up.railway.app/transaction \
  -H "Content-Type: application/json" \
  -d '{"from": "0xFROM", "to": "0xTO", "amount": 10}'
```

---

## 🏗️ Architecture

---

## 👨‍💻 Founder

Built by **VLI Network**
- GitHub: [@vlilnetwork](https://github.com/vlilnetwork)

---

## 📄 License

MIT License — Free to use and modify!

EOF