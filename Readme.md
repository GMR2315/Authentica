# Authentica – Blockchain-Based Product Authentication System

Authentica is an academic blockchain-based product authentication platform. It helps prevent counterfeit products by issuing a unique, blockchain-backed NFT passport for each registered item. Consumers can verify authenticity via QR scan and see a read-only lifecycle; administrators manage the full product lifecycle from registration through minting and tag issuance.

---

## 1. Architecture Overview

- **Frontend (React)** – Public homepage, scan/verify flows, and protected admin dashboard. Built with React, React Router, and Vite. Sends API requests to the backend and does not talk to the blockchain or IPFS directly.

- **Backend (Node.js + Express + Prisma)** – REST API for admin actions (products, assets, provenance, mint) and for public verification. Uses Prisma to connect to PostgreSQL (Neon). Calls the Hardhat local chain for minting and hash storage, and Pinata (IPFS) for metadata pinning, with a dev fallback if IPFS fails.

- **Blockchain (Hardhat local network)** – Local Ethereum node (chainId 31337). Runs on `http://127.0.0.1:8545`. The backend deploys and interacts with a single Solidity contract.

- **Smart Contract (NFTPassport)** – Solidity contract that stores a metadata hash per token. Minting records the hash on-chain; verification compares stored hash with recomputed hash from DB and IPFS.

- **IPFS** – Product metadata (JSON) is pinned via Pinata. If the pin request fails (e.g. timeout), the backend uses a deterministic fallback CID so minting can still complete in development.

```
+------------------+     HTTP      +------------------+     RPC      +------------------+
|                  | ------------->|                  | -----------> |                  |
|  React Frontend  |               |  Node + Express   |              |  Hardhat (local) |
|  (Vite)          | <-------------|  + Prisma         | <----------- |  NFTPassport     |
|                  |               |                  |              |                  |
+------------------+               +------------------+              +------------------+
                                           |                                  ^
                                           | Prisma                           |
                                           v                                  |
                                   +------------------+                       |
                                   |  PostgreSQL      |                       |
                                   |  (Neon)          |                       |
                                   +------------------+                       |
                                           ^                                  |
                                           | Pin / Fetch                      |
                                   +------------------+                       |
                                   |  IPFS (Pinata)   | ----------------------+
                                   |  metadata JSON  |   (hash stored on-chain)
                                   +------------------+
```

---

## 2. Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| Frontend    | React, React Router, Vite, Axios, Tailwind CSS |
| Backend     | Node.js, Express, Prisma ORM |
| Database    | PostgreSQL (Neon) |
| Blockchain  | Hardhat, Solidity, Ethers.js |
| Storage     | IPFS (Pinata) for metadata |
| Auth        | JWT (single-admin, username + password) |

---

## 3. Folder Structure

```
Authentica/
├── contracts/          # Hardhat project: Solidity contract and deploy script
│   ├── contracts/      # NFTPassport.sol
│   ├── scripts/        # deploy.js
│   ├── hardhat.config.js
│   └── package.json
├── backend/            # Node.js API and services
│   ├── prisma/         # schema.prisma, migrations, seed
│   ├── src/
│   │   ├── config/     # Prisma, IPFS config
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── services/   # mint, verification, blockchain, IPFS, metadata
│   ├── .env
│   └── package.json
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/   # API client (axios)
│   │   └── App.jsx
│   └── package.json
└── README.md
```

- **contracts** – Smart contract source, Hardhat config, and `deploy.js`. Run `npx hardhat node` and `npx hardhat run scripts/deploy.js --network localhost` from here.

- **backend** – Express app, Prisma, and all business logic (products, assets, provenance, mint, verify). Serves `/api/admin/*` (protected) and `/api/verify/:tag_id` (public).

- **frontend** – React app with public routes (/, /scan, /verify) and protected admin routes (/admin/*). Consumes the backend API only.

---

## 4. Environment Setup

**Prerequisites**

- Node.js 18 or later
- npm
- A PostgreSQL database (e.g. Neon: https://neon.tech)

**Backend environment**

Create `backend/.env` with:

```env
# Database (Neon or any PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# Server
PORT=3000
NODE_ENV=development

# JWT for admin (single admin, no registration)
JWT_SECRET="your-long-random-secret-at-least-32-characters"

# Blockchain (Hardhat local – update after deploy)
RPC_URL="http://127.0.0.1:8545"
PRIVATE_KEY="0x..."   # Hardhat Account #0 private key
CONTRACT_ADDRESS="0x..."   # From deploy script output

# IPFS (Pinata) – optional if using fallback
PINATA_JWT="..."
PINATA_API_KEY="..."
PINATA_SECRET_KEY="..."
PINATA_GATEWAY="https://gateway.pinata.cloud/ipfs"
```

Do not commit real secrets. Use placeholders in the README and set values locally or in CI.

**Frontend**

- Optional: `frontend/.env` or `.env.local` with `VITE_API_BASE_URL=http://localhost:3000` if the API is not on the same host.

---

## 5. How To Run The Project

Follow this order exactly.

**Step 1 – Start Hardhat local blockchain**

```bash
cd contracts
npx hardhat node
```

Leave this terminal running. Default RPC: `http://127.0.0.1:8545`, chainId 31337.

**Step 2 – Deploy the smart contract**

Open a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address. Then in `backend/.env` set:

```env
CONTRACT_ADDRESS=0x...   # Paste deployed address
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=<Hardhat Account #0 private key from the "Hardhat Node" terminal>
```

**Step 3 – Start the backend**

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend runs at `http://localhost:3000`. Create the first admin (see Admin Setup below) or run `npx prisma db seed` if a seed exists.

**Step 4 – Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Use the homepage to scan or verify; use **Admin Login** to access the dashboard.

---

## 6. Admin Setup

Authentica uses a **single admin** account. There is no registration endpoint; the admin is created manually.

1. Ensure backend and DB are running and migrations are applied.
2. Open Prisma Studio: from `backend`, run `npx prisma studio`.
3. Open the `Admin` model and add a row:
   - `username` – e.g. `admin` (unique).
   - `password` – must be a **bcrypt-hashed** value (e.g. use an online bcrypt generator or a small script with `bcrypt.hash('YourPassword', 10)`).
4. Optional: if a seed is configured (`db:seed`), you can run `npx prisma db seed` to create a default admin (e.g. username `admin`, password as in the seed).

Admin login is at **/admin/login**. On success, the frontend stores the JWT in `localStorage` as `authToken` and redirects to `/admin/dashboard`. All `/api/admin/*` routes (except `/api/admin/login`) require the `Authorization: Bearer <token>` header.

---

## 7. How Minting Works

1. **Product created** – Admin registers a product (name, model, serial number, etc.) via the backend; stored in PostgreSQL.
2. **Assets uploaded** – Optional: admin uploads images/documents; they are pinned to IPFS and CIDs stored on the product.
3. **Metadata generated** – Backend builds a canonical JSON from product + provenance (sorted keys for deterministic hash).
4. **Metadata pinned** – JSON is pinned to IPFS via Pinata. If the request fails (e.g. timeout), a **fallback CID** is used so minting continues (see Important Notes).
5. **Hash computed** – Keccak256 hash of the canonical metadata JSON is computed (same as used on-chain).
6. **NFT minted on blockchain** – Backend calls the NFTPassport contract to mint with the metadata hash; contract stores the hash.
7. **Token stored in DB** – NFTPassport and Tag records are created in a single Prisma transaction (token_id, metadata_cid, metadata_hash, etc.).
8. **QR tag generated** – A unique `tag_id` is generated and linked to the passport; this is what users scan.
9. **Provenance** – If the product has no provenance events, the system can auto-create initial events (e.g. MANUFACTURED, MINTED, TAG_ISSUED).

No business logic was changed for this README; the above describes the intended flow.

---

## 8. Public Verification Flow

1. **User scans QR** – The scanned value is the `tag_id` (e.g. `TAG-XXXXXX-XXXX`).
2. **System fetches tag** – Backend looks up the Tag by `tag_id`, with NFTPassport and Product (and provenance if needed).
3. **On-chain hash** – Backend reads the metadata hash stored on the contract for that token.
4. **IPFS metadata** – Backend fetches the metadata JSON from IPFS (using `metadata_cid`).
5. **Recompute hash** – Canonical JSON from IPFS is hashed with the same algorithm as at mint time.
6. **Compare** – On-chain hash, DB hash, and recomputed hash are compared.
7. **Result** – Returns **AUTHENTIC** (all match), **TAMPERED** (mismatch or fetch failure), or **FAKE** (tag not found or no passport). The public verification endpoint does not require authentication.

---

## 9. Important Notes

**Hardhat resets on restart**

- When you stop and restart `npx hardhat node`, the chain state is reset. All deployed contracts and transactions are lost.

**Re-deploy after reset**

- After each Hardhat restart, run again:
  ```bash
  cd contracts
  npx hardhat run scripts/deploy.js --network localhost
  ```
- Update `backend/.env` with the **new** `CONTRACT_ADDRESS`. The backend does not auto-detect the contract address.

**IPFS fallback (development)**

- If the IPFS pin request fails (e.g. `UND_ERR_CONNECT_TIMEOUT` or 60s timeout), the backend does **not** fail the mint. It logs a warning and uses a deterministic fallback CID (`LOCAL_FAKE_CID_...`). Blockchain mint still runs; the stored `metadata_cid` and `metadata_hash` are still valid for the flow. Verification will use the fallback CID for fetching only when the CID is that fake value; in production you would replace this with reliable pinning.

**JWT authentication**

- Single admin: username + password, no registration. JWT is signed with `JWT_SECRET`, expiry 1d. Middleware protects all `/api/admin/*` routes except `POST /api/admin/login`. Frontend sends `Authorization: Bearer <token>` and redirects to `/admin/login` on 401.

---

## 10. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Mint fails or RPC errors | Hardhat node must be running (`npx hardhat node`). Confirm `RPC_URL` and `PRIVATE_KEY` in `backend/.env`. |
| Verification returns wrong result or contract error | Ensure `CONTRACT_ADDRESS` in `backend/.env` matches the **current** deployment. After every Hardhat restart, redeploy and update this. |
| IPFS timeout / connect errors | Normal in poor networks. Backend uses a 60s timeout and then fallback CID so mint still succeeds. Check logs for `[ipfsService] IPFS FAILED — Using local fallback CID`. |
| Prisma schema or DB out of sync | Run `npx prisma migrate dev` from `backend`. For a full reset (wipes DB): `npx prisma migrate reset`. |
| DB connection failed | Verify `DATABASE_URL` in `backend/.env` (Neon: correct host, user, password, SSL). Test from another tool (e.g. `psql` or Prisma Studio). |
| Admin login 401 | Ensure the admin row exists in the `Admin` table and the password is bcrypt-hashed. Use Prisma Studio to inspect. |
| Frontend cannot reach API | Confirm backend is on `http://localhost:3000`. If frontend runs elsewhere, set `VITE_API_BASE_URL` to the backend URL. |

---

## 11. Future Improvements

- Deploy the NFTPassport contract to **Sepolia** (or another testnet) and point the backend to it for a persistent demo.
- Replace the IPFS fallback with **production-grade pinning** and remove or gate the fake CID logic.
- Add **rate limiting** on the API (e.g. per IP or per admin token).
- Extend to a **role-based admin system** (e.g. viewer, operator, superadmin) with different permissions.
- Add an **analytics dashboard** (verification counts, mint volume, top products).

---

## License

ISC (or as specified in the repository).
