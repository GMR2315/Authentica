# Frontend–Backend Integration Report (Analysis Only)

**Date:** 2025-01-30  
**Scope:** Backend (v1-backend-stable) + Frontend under `/frontend`  
**Rules:** No file modifications, no installs, no refactors. Analysis only. Await approval before changes.

---

## 1. Backend API Surface Summary

### Base path and mounting

- Health: `/health` → `healthRouter`
- Admin: `/api/admin` → `adminRouter`
- Verify: `/api/verify` → `verifyRouter`

So full URLs are: `/health`, `/api/admin/...`, `/api/verify/...`.

### Endpoints

| Method | Route | Request body / params | Response structure | Status codes | Headers |
|--------|--------|------------------------|---------------------|--------------|---------|
| **GET** | `/health` | — | `{ status: 'ok', service, timestamp, uptime }` | 200 | — |
| **POST** | `/api/admin/products` | **Body:** `name` (string, required), `model` (string, required), `serial_number` (string, required), `description` (string, optional) | Full Prisma `Product` (e.g. `product_id`, `name`, `model`, `serial_number`, `description`, `created_at`, `updated_at`; optional UI fields not set by this endpoint) | 201 success; 400 validation; 409 duplicate `serial_number` (P2002) | `Content-Type: application/json` |
| **POST** | `/api/admin/products/:product_id/provenance` | **Params:** `product_id`. **Body:** `event_type` (string, required), `event_description` (string, optional), `event_time` (ISO 8601 string, required) | Created `ProvenanceEvent` (e.g. `event_id`, `product_id`, `event_type`, `event_description`, `event_time`, `created_at`) | 201; 400 validation / invalid date; 404 product not found | JSON |
| **POST** | `/api/admin/products/:product_id/assets` | **Params:** `product_id`. **Body:** `multipart/form-data`, field name **`files`** (array of files; max 10, 10 MB each). Allowed: JPG, PNG, GIF, PDF, DOC, DOCX | `{ message, uploads: [{ originalName, mimeType, size, assetType, cid, url }], product: { product_id, name, image_cids, document_cids } }` | 200; 400 no files; 404 product not found | Do **not** set `Content-Type` manually for multipart (browser/axios sets it with boundary) |
| **POST** | `/api/admin/products/:product_id/mint` | **Params:** `product_id`. **Body (optional):** `tag_type`: `"QR"` \| `"NFC"` \| `"RFID"` \| `"PUF"` (default `"QR"`) | `{ nftPassport: { ...nftPassport, token_id: string }, tag: Tag, metadata: { cid, url, hash } }` | 201; 400 invalid tag_type; 404 product not found; 409 e.g. already minted | JSON |
| **GET** | `/api/verify/:tag_id` | **Params:** `tag_id` | See “Verify response” below | 200 for all outcomes (status in body) | — |

### Verify response structure (backend)

- `tag_id` (string)
- `status`: `"AUTHENTIC"` \| `"TAMPERED"` \| `"FAKE"`
- `reason` (string, human-readable)
- `verified_at` (ISO 8601 string)
- `product`: `null` or `{ product_id, name, model, serial_number, brand }`
- `details`: `{ tag_type, minted_at, contract_address, token_id, ipfs_verified, chain_verified }` (when applicable; no raw hashes)

### CORS, auth, middleware

- **CORS:** Yes. `app.use(cors())` with no options (all origins allowed).
- **Authentication:** None. No auth middleware; no `Authorization` or session checks.
- **Middleware:**  
  - `helmet`, `morgan`, `express.json()`, `express.urlencoded({ extended: true })`.  
  - Admin assets: `uploadFiles` (multer) on `/api/admin/products/:product_id/assets` only — expects `files` field, memory storage, 10 files, 10 MB each, MIME allowlist as above.

### Backend endpoints not present

- No GET list products.
- No GET product by id.
- No PUT/PATCH product.
- No DELETE product.
- No dashboard (stats, recent products).
- No provenance “timeline” or “events” list API (only add single event).
- No verify history API.
- No “get passport by tag id” API (verify returns what’s needed for the result page).

---

## 2. Frontend API Usage Analysis

### API service (`src/services/api.js`)

- **Base URL:** Hardcoded `API_BASE_URL = 'https://api.authentica.com'` (no env; wrong path for local backend).
- **Client:** Single `axios` instance; no raw `fetch` in this file.
- **Interceptors:**  
  - Request: adds `Authorization: Bearer ${localStorage.getItem('authToken')}` if present.  
  - Response: on 401 clears `authToken` and redirects to `/login` (login page does not exist).
- **Defined APIs (all under base URL, paths as below):**

| API | Method | Path | Body / usage | Backend equivalent |
|-----|--------|------|--------------|---------------------|
| productAPI.getAll | GET | `/products` | — | ❌ None |
| productAPI.getById | GET | `/products/${id}` | — | ❌ None |
| productAPI.create | POST | `/products` | `data` | ✅ POST `/api/admin/products` (path/prefix differ) |
| productAPI.update | PUT | `/products/${id}` | `data` | ❌ None |
| productAPI.delete | DELETE | `/products/${id}` | — | ❌ None |
| assetAPI.upload | POST | `/assets/upload` | `formData`, `Content-Type: multipart/form-data` | ⚠️ POST `/api/admin/products/:product_id/assets` (path and need for `product_id` differ) |
| assetAPI.delete | DELETE | `/assets/${id}` | — | ❌ None |
| passportAPI.mint | POST | `/passports/mint` | `{ productId }` | ⚠️ POST `/api/admin/products/:product_id/mint` (path, product in URL not body) |
| passportAPI.getByTagId | GET | `/passports/${tagId}` | — | ❌ None (verify gives result) |
| passportAPI.verify | POST | `/verify` | `{ tagId }` | ⚠️ GET `/api/verify/:tag_id` (method and param location differ) |
| verificationAPI.verify | POST | `/verify` | `{ tagId, method }` | Same as above |
| verificationAPI.getHistory | GET | `/verify/${tagId}/history` | — | ❌ None |
| provenanceAPI.getTimeline | GET | `/provenance/${productId}/timeline` | — | ❌ None |
| provenanceAPI.addEvent | POST | `/provenance/${productId}/events` | `event` | ⚠️ POST `/api/admin/products/:product_id/provenance` (path and body shape differ) |
| dashboardAPI.getStats | GET | `/dashboard/stats` | — | ❌ None |
| dashboardAPI.getRecentProducts | GET | `/dashboard/recent-products` | — | ❌ None |

None of the pages currently call these API helpers; they use mock data and timeouts instead.

### Frontend pages and API usage

- **ProductRegistration.jsx**  
  - No API call. Submits with `setTimeout(..., 2000)` and `console.log('Product registered:', formData)`.  
  - Needs: create product (with field mapping and backend path).

- **ProvenanceTimeline.jsx**  
  - Mock products list and mock timeline. No `api.js` or `fetch`.  
  - Needs: list products (backend doesn’t exist — will need new endpoint or reuse from elsewhere), timeline for a product (backend has no timeline endpoint; only “add event”).

- **AssetsUpload.jsx**  
  - Mock upload with `setTimeout(..., 2000)`. No product selection; no `api.js`.  
  - Needs: product selection (so list products or equivalent), upload to `/api/admin/products/:product_id/assets` with `files` in form.

- **MintPassport.jsx**  
  - Mock products and mock mint with `setTimeout(..., 2000)`; builds fake passport and QR URL.  
  - Needs: list products (or source of product ids), call mint with `product_id`, map backend response (e.g. `tag.tag_id`, `nftPassport.token_id`) to UI (tagId, nftId, etc.).

- **ScanPage.jsx**  
  - Manual: mock delay then `navigate('/verify', { state: { tagId, scanMethod } })`. File/camera: mock tag ids then same navigate.  
  - Needs: call verify API with `tag_id` and pass real result to VerificationResult (or pass tagId and let VerificationResult call verify).

- **VerificationResult.jsx**  
  - Uses `location.state.tagId` and mock `performVerification(tagId)` (setTimeout + hardcoded mock by tagId).  
  - Expects: `status` (lowercase), `tagId`, `verifiedAt`, `product` (name, brand, model, serialNumber, manufacturingDate, manufacturingLocation), `passport` (nftId, mintedAt, transactionHash), `verification` (method, confidence, verifiedBy, issues?), `history` array, optional `alert`.  
  - Needs: call GET `/api/verify/:tag_id`, then map backend response to this shape (snake_case → camelCase, status uppercase → lowercase, add/map optional fields).

- **AdminDashboard.jsx**  
  - Mock stats and recent products via `setTimeout(..., 1000)`. No API.  
  - Needs: either new backend dashboard endpoints or client-side aggregation from existing data (e.g. if list products and verify logs are added later).

### Summary: where frontend expects backend

- **ProductRegistration:** Create product — backend exists; path and body shape must be aligned.
- **ProvenanceTimeline:** List products + timeline — backend has add provenance only; no list products, no timeline GET.
- **AssetsUpload:** List products (or product id source) + upload — backend has upload only; no list.
- **MintPassport:** List products + mint — backend has mint; no list products.
- **ScanPage / VerificationResult:** Verify by tag_id — backend has GET verify; response shape and status casing differ.
- **AdminDashboard:** Stats + recent products — no backend support today.

### Hardcoded / mock data

- `api.js`: `API_BASE_URL = 'https://api.authentica.com'`.
- ProductRegistration: 2s delay, no real request.
- ProvenanceTimeline: mock products array, mock timeline array (rich event shape with type, title, location, actor, metadata).
- AssetsUpload: 2s delay, no product_id, no real upload.
- MintPassport: mock products, mock mint, mock passport (tagId, nftId, transactionHash, etc.), QR URL from external API.
- ScanPage: mock delays, mock tag ids for file/camera.
- VerificationResult: full mock payloads per tagId (authentic/tampered/fake), different shapes.
- AdminDashboard: mock stats and recent products.

### Expected vs backend response shape (high level)

- **Create product:** Frontend sends camelCase and many extra fields; backend expects snake_case and only `name`, `model`, `serial_number`, `description`. Backend returns full Product (snake_case).
- **Verify:** Backend returns snake_case, UPPERCASE status, `reason`, `details` (no `passport`, `verification`, `history`). Frontend expects camelCase, lowercase status, `passport`, `verification`, `history`, etc. Significant mapping required.

---

## 3. Schema Alignment Check

### Backend Product model (Prisma)

- **Create product handler** only accepts and persists: `name`, `model`, `serial_number`, `description`.
- **Schema** also has (optional, not set by create): `category`, `brand`, `manufacturing_date`, `manufacturing_location`, `materials`, `weight_grams`, `dimensions`, `color`, `special_features`, `retail_price`, `warranty_period`, `tags`, `sku`, `quantity`, `batch_id`, `quality_score`, `image_cids`, `document_cids`.

### Frontend ProductRegistration form fields

| Form field (camelCase) | Backend create accepts? | In Prisma schema? | Notes |
|------------------------|-------------------------|-------------------|--------|
| name | ✅ | ✅ | |
| category | ❌ | ✅ optional | Not in create handler |
| brand | ❌ | ✅ optional | Not in create handler |
| model | ✅ | ✅ | |
| serialNumber | ✅ (as serial_number) | ✅ | Name mismatch |
| description | ✅ | ✅ | |
| manufacturingDate | ❌ | ✅ manufacturing_date | Type: date string → DateTime |
| manufacturingLocation | ❌ | ✅ manufacturing_location | Not in create handler |
| materials | ❌ | ✅ materials | Not in create handler |
| weight | ❌ | ✅ weight_grams | Int; frontend string/number |
| dimensions | ❌ | ✅ dimensions | Not in create handler |
| color | ❌ | ✅ color | Not in create handler |
| specialFeatures | ❌ | ✅ special_features | Not in create handler |
| retailPrice | ❌ | ✅ retail_price | Decimal; frontend number string |
| warrantyPeriod | ❌ | ✅ warranty_period | Not in create handler |
| tags | ❌ | ✅ tags | Not in create handler |

### Fields in backend Product not used in frontend form

- `sku`, `quantity`, `batch_id`, `quality_score` — in schema, not in registration form.
- `image_cids`, `document_cids` — set by asset upload, not registration form.

### Provenance

- **Backend:** `event_type`, `event_description`, `event_time` (DateTime).
- **Frontend (ProvenanceTimeline mock):** Rich event with `type`, `title`, `description`, `location`, `actor`, `timestamp`, `metadata` — backend has no `location`, `actor`, `title`, or `metadata`; only event_type, event_description, event_time. “Add event” UI not present in current pages; timeline only displays mock. So for “add event” the frontend would need to send `event_type`, `event_description`, `event_time` and optionally map `title` → `event_type` or similar.

### Type / required mismatches

- **serial_number:** Backend required; frontend has `serialNumber` (required in UI). OK if name mapped.
- **manufacturing_date:** Backend create doesn’t accept it; schema has `manufacturing_date DateTime?`. If we add it to create, frontend sends date string (e.g. `YYYY-MM-DD`); backend must parse to DateTime.
- **weight_grams:** Schema Int; frontend sends string/number from input — ensure integer.
- **retail_price:** Schema Decimal(12,2); frontend number string — ensure valid decimal.

---

## 4. Integration Risk Assessment

1. **Base URL / environment**  
   Frontend uses `https://api.authentica.com`. Local backend is typically `http://localhost:PORT`. Need configurable base URL (e.g. env) and correct path prefix (`/api/admin`, `/api/verify`).

2. **Create product: body shape**  
   Frontend sends many camelCase fields; backend accepts only four snake_case fields. Sending full form as-is will not persist category, brand, dates, etc. Risk: silent data loss or 400 if backend is later strict. Mitigation: either extend backend create to accept optional UI fields and map camelCase → snake_case, or frontend sends only the four fields and drops the rest until backend is extended.

3. **Create product: response**  
   Backend returns full Product (snake_case). Frontend currently doesn’t use response (navigates to `/admin`). If UI later needs `product_id` (e.g. for “upload assets” or “mint”), frontend must read `product_id` from response.

4. **List products missing**  
   ProvenanceTimeline, AssetsUpload, MintPassport, and AdminDashboard need a product list. Backend has no GET products. Risk: cannot wire these flows without a new endpoint or another source of product ids (e.g. from create product redirect with stored id). High impact.

5. **Assets upload: path and product_id**  
   Frontend `assetAPI.upload` is POST `/assets/upload` with formData; backend is POST `/api/admin/products/:product_id/assets` with field `files`. Risks: wrong path, missing `product_id`, and frontend currently has no product selector. Must add product selection and use correct URL and field name.

6. **Assets upload: Content-Type**  
   Frontend sets `Content-Type: multipart/form-data` manually. For multipart, the client must not set Content-Type so the browser/axios can add the boundary. Risk: backend may fail to parse multipart. Mitigation: omit Content-Type for that request and let axios set it when sending FormData.

7. **Mint: path and body**  
   Frontend expects POST `/passports/mint` with `{ productId }`. Backend expects POST `/api/admin/products/:product_id/mint` with optional `{ tag_type }`. Path and parameter location differ; response shape differs (tag_id, token_id, no “nftId” or “transactionHash” in same shape). Mapping required.

8. **Verify: method and param**  
   Frontend uses POST `/verify` with body `{ tagId }`. Backend is GET `/api/verify/:tag_id`. Method and param location differ. Frontend must call GET with tag_id in path.

9. **Verify: response shape**  
   Backend: snake_case, `status` UPPERCASE, `reason`, `product` (limited fields), `details` (tag_type, minted_at, contract_address, token_id, ipfs_verified, chain_verified). No `passport`, `verification`, `history`, or `alert`. Frontend expects camelCase, lowercase status, `product` (with manufacturingDate, manufacturingLocation), `passport` (nftId, mintedAt, transactionHash), `verification` (method, confidence, verifiedBy), `history` array. Risk: VerificationResult will break or show empty unless response is mapped and optional sections hidden when absent.

10. **Status casing**  
    Backend: `AUTHENTIC` / `TAMPERED` / `FAKE`. Frontend: `authentic` / `tampered` / `fake`. StatusBadge and getStatusIcon expect lowercase. Simple map in frontend.

11. **Date formatting**  
    Backend uses ISO strings and Date objects; frontend uses `toLocaleDateString()` / `toLocaleString()`. Generally fine; ensure verified_at and minted_at are passed as strings from backend.

12. **Auth interceptor**  
    Frontend adds Bearer token and redirects to `/login` on 401. Backend has no auth; no 401. Risk: if backend later adds auth, 401 handling is in place; `/login` is missing. Low for current integration.

13. **Provenance “add event”**  
    Backend body: `event_type`, `event_description`, `event_time`. Frontend api.js `addEvent` posts `event` object; shape not defined in UI (no add-event form in timeline page). When wiring, body must match backend. Timeline display currently expects a different event shape (title, location, actor, metadata); backend doesn’t return those. Either backend extends provenance response or frontend maps event_type/event_description/event_time to a simpler timeline item.

14. **Dashboard**  
    No backend stats or recent-products. Dashboard will stay mock or require new backend endpoints (or client-side aggregation if list/verify endpoints exist later).

15. **File upload size/type**  
    Backend: 10 MB, 10 files, specific MIME types. Frontend accept="image/*,.pdf,.doc,.docx". Align limits and error messages so users see clear feedback.

16. **CORS**  
    Backend uses `cors()` with no origin restriction. Low risk for same-machine dev; ensure production origin is allowed if CORS is tightened later.

---

## 5. Proposed Integration Plan (No Code Yet)

Order is chosen to unblock flows with minimal backend change and to reuse created product id for assets and mint.

1. **Configure API base URL**  
   Add env (e.g. `VITE_API_BASE_URL`) and use it in `api.js` so frontend points to backend (e.g. `http://localhost:3000`). Ensure paths include `/api/admin` and `/api/verify` (either in base URL or per-call).

2. **Wire Create Product**  
   In ProductRegistration, replace mock with real call:  
   - Map form to backend body: at minimum `name`, `model`, `serial_number`, `description` (and optionally extend backend to accept other Product fields with camelCase → snake_case).  
   - Use POST `/api/admin/products` (with chosen base URL).  
   - On 201, read `product_id` from response; store or pass it (e.g. redirect to upload assets with product_id, or show success with id).  
   - Handle 400/409 and show errors in UI.

3. **Map Create Product response**  
   If frontend needs product in camelCase, add a small mapper (product_id → productId, etc.); otherwise use `product_id` for next steps.

4. **Add List Products (backend or workaround)**  
   Option A: Add GET `/api/admin/products` (list) in backend.  
   Option B: Temporarily use only product_id from step 2 (e.g. redirect to upload assets with that id).  
   For full UX (Provenance, Assets, Mint, Dashboard), Option A is needed. Implement list when backend is allowed to change; otherwise document as gap and keep mocks for list-dependent screens.

5. **Wire Upload Assets**  
   In AssetsUpload:  
   - Require product selection (from list or from create-product redirect).  
   - Build FormData with field name `files` (not `file`).  
   - POST `/api/admin/products/:product_id/assets`; do not set Content-Type header (let axios set multipart + boundary).  
   - Map 200 response (e.g. show uploads, update local state).  
   - Handle 400/404.

6. **Wire Add Provenance (when UI exists)**  
   When “add event” is implemented: POST `/api/admin/products/:product_id/provenance` with body `event_type`, `event_description`, `event_time` (map from UI). For timeline display, either backend adds a timeline endpoint or frontend builds a simple list from events (if we add GET events for a product later).

7. **Wire Mint Passport**  
   In MintPassport:  
   - Get product list (from step 4) or at least selected product_id.  
   - POST `/api/admin/products/:product_id/mint` with optional `{ tag_type: 'QR' }`.  
   - Map response: `tag.tag_id` → tagId, `nftPassport.token_id` → nftId; use metadata.hash or similar if “transaction hash” is needed (backend may not expose tx hash in response — confirm and hide or fetch separately if needed).  
   - Build QR URL from `tag.tag_id`.  
   - Handle 404/409.

8. **Wire Verify (Scan + Result)**  
   In ScanPage (manual input): call GET `/api/verify/:tag_id` with user-entered tag_id; pass result to VerificationResult via state or fetch in VerificationResult by tagId.  
   In VerificationResult: if only tagId is in state, call GET `/api/verify/:tag_id`; map response: snake_case → camelCase, status to lowercase, `product` and `details` to the shape expected by UI (product.name, .brand, .model, .serial_number → serialNumber; details.token_id → passport.nftId; details.minted_at → passport.mintedAt; no transactionHash/details if not provided). Omit or simplify `verification` and `history` if backend doesn’t provide them.  
   In ScanPage (camera/file): when real QR decoding is implemented, extract tag_id and call verify as above; until then, keep mock or use manual flow.

9. **Error and loading states**  
   Replace all mock timeouts with real API calls; keep loading spinners and disable buttons during requests. Show backend error messages (e.g. `error` in JSON) in UI for create, upload, mint, verify.

10. **Dashboard**  
    Leave mock until backend has stats/recent-products or another source; or implement client-side stats from list products + verify logs if those endpoints are added later.

11. **Optional: Extend backend create product**  
    If product registration should persist category, brand, manufacturing_date, etc., extend POST `/api/admin/products` to accept and validate these optional fields (with camelCase → snake_case) and persist them in Product. Then extend frontend create payload in step 2 to send them.

12. **Optional: Remove or relax auth interceptor**  
    Until backend has auth, either leave as-is (no token sent, no 401) or remove redirect to `/login` to avoid sending users to a non-existent page on 401.

---

**End of report. No files were modified. Awaiting approval before any implementation.**
