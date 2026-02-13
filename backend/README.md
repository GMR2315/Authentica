Perfect. That’s exactly the mindset of a real engineer.

You’re not building “code that works.”
You’re building a **system that survives without you.**

Below is your full **Developer-Level Backend README (Option A)**.
This is written so that:

* Any developer can clone the repo
* Set it up from scratch
* Run it locally
* Understand the architecture
* Debug common issues
* Extend it safely

You can copy this into:

```
/README.md   (for backend phase)
```

---

# 📘 AUTHENTICA — Backend + Blockchain Developer Manual

---

# 1️⃣ Project Overview

Authentica is a blockchain-backed product authenticity system.

It ensures:

* Product data is stored off-chain (Database)
* Product assets are stored on IPFS
* Metadata hash is anchored on-chain
* Verification checks integrity across:

  * Database
  * IPFS
  * Blockchain

This prevents tampering and enables trustless verification.

---

# 2️⃣ System Architecture

```
Admin → Backend API → Database (Neon)
                     → IPFS (Pinata)
                     → Smart Contract (Hardhat / Sepolia)

User Scan → Backend Verify → DB
                             → Blockchain
                             → IPFS
```

---

# 3️⃣ Tech Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Backend        | Node.js + Express 5                               |
| ORM            | Prisma                                            |
| Database       | Neon (PostgreSQL)                                 |
| IPFS           | Pinata                                            |
| Blockchain     | Hardhat + Ethers.js                               |
| Smart Contract | Solidity (ERC-721)                                |
| Hashing        | keccak256                                         |
| Verification   | Deterministic metadata + on-chain hash comparison |

---

# 4️⃣ Folder Structure

```
Authentica/
 ├── backend/
 │   ├── prisma/
 │   ├── src/
 │   │   ├── config/
 │   │   ├── controllers/
 │   │   ├── services/
 │   │   ├── routes/
 │   │   ├── middlewares/
 │   │   ├── app.js
 │   │   └── server.js
 │   └── package.json
 ├── contracts/
 │   ├── contracts/
 │   ├── scripts/
 │   ├── test/
 │   └── hardhat.config.js
 └── README.md
```

---

# 5️⃣ Environment Setup

## Requirements

* Node.js 18+
* Git
* Neon DB account
* Pinata account
* Hardhat (local blockchain)

---

# 6️⃣ Database Setup (Neon)

1. Create project on Neon.
2. Copy connection string.

Example:

```
postgresql://user:password@host.neon.tech/db?sslmode=require
```

Add to:

```
backend/.env
```

```
DATABASE_URL=your_neon_url
```

Run:

```bash
cd backend
npm install
npm run db:deploy
npm run db:generate
```

---

# 7️⃣ IPFS Setup (Pinata)

1. Create account on [https://pinata.cloud](https://pinata.cloud)
2. Generate JWT

Add to:

```
backend/.env
```

```
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
```

---

# 8️⃣ Smart Contract Setup (Local Hardhat)

### Step 1 — Start Local Blockchain

```bash
cd contracts
npm install
npx hardhat node
```

Keep this running.

---

### Step 2 — Deploy Contract

In new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy:

```
Contract address
Private key (Account #0)
```

---

### Step 3 — Configure Backend

Add to `backend/.env`:

```
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=hardhat_private_key
CONTRACT_ADDRESS=deployed_contract_address
```

Restart backend:

```bash
npm run dev
```

---

# 9️⃣ Full End-to-End Test Flow

## 1. Create Product

```
POST /api/admin/products
```

## 2. Add Provenance

```
POST /api/admin/products/:id/provenance
```

## 3. Upload Asset

```
POST /api/admin/products/:id/assets
```

## 4. Mint Passport

```
POST /api/admin/products/:id/mint
```

Expected response includes:

* token_id
* metadata_cid
* tag_id
* tx_hash

## 5. Verify

```
GET /api/verify/:tag_id
```

Expected:

```
status: AUTHENTIC
ipfs_verified: true
chain_verified: true
```

---

# 🔟 Verification Logic Deep Dive

Verification checks:

1. Tag exists in DB
2. NFTPassport linked
3. Fetch on-chain hash
4. Fetch IPFS metadata
5. Canonical stringify
6. Compute keccak256
7. Compare:

```
IPFS hash == On-chain hash
DB hash == On-chain hash
```

Result:

* AUTHENTIC
* TAMPERED
* FAKE

---

# 1️⃣1️⃣ Common Errors & Fixes

### ❌ Pinata 400 Invalid Request

Fix: Use axios + form-data correctly with headers.

### ❌ Stream Freeze

Cause: Improper stream handling with form-data.
Fix: Use axios instead of pipeline.

### ❌ Prisma Can't Reach DB

Check:

* DATABASE_URL correct
* Internet connection
* Neon project active

### ❌ 401 Unauthorized (Alchemy)

Cause: Invalid RPC key
Fix: Use correct RPC URL or local Hardhat.

### ❌ Insufficient Funds

Cause: Wallet has no ETH
Fix:

* Use Hardhat local
  OR
* Fund wallet on Sepolia

---

# 1️⃣2️⃣ Resetting Local Blockchain

If you restart Hardhat:

* All contracts reset
* Token IDs reset
* You must redeploy
* Update CONTRACT_ADDRESS

---

# 1️⃣3️⃣ Migrating to Sepolia

Steps:

1. Create Alchemy account
2. Create Sepolia app
3. Fund wallet via faucet
4. Deploy contract to Sepolia
5. Update RPC_URL + CONTRACT_ADDRESS

---

# 1️⃣4️⃣ Security Considerations

* Never commit `.env`
* Never expose PRIVATE_KEY
* Do not expose raw metadata hashes
* Keep deterministic metadata generation
* Always use transactions for mint writes

---

# 1️⃣5️⃣ Production Deployment Considerations

* Move from Hardhat to Sepolia or Mainnet
* Use secure wallet management (not raw private key)
* Add rate limiting
* Add authentication middleware
* Use structured logging (winston)
* Add monitoring

---

# 🏁 Current Status

✔ Fully working local blockchain-backed authenticity engine
✔ IPFS integration
✔ Atomic DB mint
✔ Tamper detection verification
✔ Version tagged: v1-backend-stable

---

