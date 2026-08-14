# Real-Time High-Traffic Inventory System

A "Limited Edition Sneaker Drop" platform — users see live stock counts, reserve an item for a 60-second checkout window, and complete (or lose) that reservation, all synced instantly across every open browser tab via WebSockets.

## Stack

| | |
|---|---|
| Frontend | React (Vite) + Redux Toolkit, Tailwind CSS, Socket.io client |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma 7 (driver-adapter based) |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |

## How to run the app

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://DB_USERNAME:DB_PASSWORD@localhost:5432/DB_NAME"
CLIENT_URL="http://localhost:5173"
JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="7d"
```

Set up the database schema (Prisma migrations — no manual SQL needed):

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed     # optional — 10 sample sneaker drops
npm run dev
```

Backend runs on `http://localhost:5000`, with Socket.io attached to the same HTTP server.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`. Open it in two browser tabs side by side to see real-time stock sync.

## SQL Schema

Managed entirely through Prisma migrations (`npx prisma migrate dev` above creates these). Four tables:

```
User                        Drop
 id (uuid, pk)                id (uuid, pk)
 username (unique)            name
 password (hashed)            price
 createdAt / updatedAt        totalStock
                               availableStock
                               startsAt
                               createdAt / updatedAt

Reservation                  Purchase
 id (uuid, pk)                 id (uuid, pk)
 status (ACTIVE /              price
   EXPIRED / COMPLETED)        purchasedAt
 expiresAt                     dropId → Drop
 dropId → Drop                  userId → User
 userId → User                  reservationId → Reservation (1:1, unique)
 createdAt / updatedAt
```

`availableStock` is the live counter — decremented on reserve, restored on expiry, permanently reduced on purchase. `totalStock` is fixed at creation and never changes.

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ username, password }` → `{ user, token }` |
| POST | `/api/auth/login` | — | `{ username, password }` → `{ user, token }` |
| POST | `/api/drops` | — | `{ name, price, totalStock, startsAt? }` → creates a drop |
| GET | `/api/drops` | — | Lists all drops, each with nested `recentPurchasers` (top 3, latest first) |
| POST | `/api/reservations` | Bearer token | `{ dropId }` → reserves 1 unit for 60s |
| POST | `/api/reservations/:id/purchase` | Bearer token | Completes the purchase for that reservation |

Error shape: `{ success: false, message, details? }`. Status codes: `400` validation, `401` auth, `403` not your reservation, `404` not found, `409` conflict (out of stock, drop hasn't started, reservation expired/already completed).

### WebSocket events

| Event | Payload | Fires when |
|---|---|---|
| `stock:updated` | `{ dropId, availableStock }` | A reservation is made or expires |
| `reservation:expired` | `{ reservationId, dropId }` | A reservation's 60s window passes unused |
| `purchase:new` | `{ dropId, username, purchasedAt }` | A purchase completes (drives the activity feed) |

## Architecture Choice: how the 60-second expiration is handled

Two layers work together, not one:

1. **A `setTimeout` per reservation** ([`reservations.service.js`](backend/src/modules/reservations/reservations.service.js)) — scheduled the instant a reservation is created, fires exactly 60s later for precise, real-time expiry.
2. **A background sweep** ([`jobs/reservationSweep.job.js`](backend/src/jobs/reservationSweep.job.js)) — polls every 5 seconds for any `ACTIVE` reservation whose `expiresAt` has already passed.

The `setTimeout` alone isn't reliable on its own: it's in-memory, so a server restart loses every pending timer and stock stays locked up forever. The sweep is a restart-safe correctness guarantee that catches anything the timer missed. The `setTimeout` still matters on top of the sweep — it's what keeps expiry feeling instant instead of "up to 5 seconds late."

Both paths call the same `expireReservation()` function, guarded by a conditional update so they can never double-process the same reservation:

```js
const { count } = await tx.reservation.updateMany({
  where: { id: reservationId, status: "ACTIVE" },
  data: { status: "EXPIRED" },
});
if (count === 0) return; // the other layer already handled it
```

Whichever layer reaches the row first flips its status; the other sees `count === 0` and does nothing — stock is only ever restored once, and `stock:updated` / `reservation:expired` only ever broadcast once per reservation.

## Concurrency: how overselling is prevented

The reserve endpoint uses a single **conditional atomic `UPDATE`**, not a read-then-write pattern or an application-level lock:

```js
const { count } = await tx.drop.updateMany({
  where: { id: dropId, availableStock: { gt: 0 } },
  data: { availableStock: { decrement: 1 } },
});
if (count === 0) throw new ApiError(409, "This item is out of stock");
```

PostgreSQL takes a row-level lock for the duration of an `UPDATE`, so when many requests hit the same row at once, they're serialized by the database engine itself — each one re-evaluates `availableStock > 0` against the latest committed value, never a value read earlier in JS. The moment stock hits 0, every subsequent request's `WHERE` clause stops matching, `count` comes back `0`, and that request is rejected with `409`. No `SELECT ... FOR UPDATE`, no mutex, no retry loop.

Verified with a real concurrency test: 5 simultaneous reserve requests against a drop with `totalStock: 1` — exactly 1 succeeded (`201`), the other 4 got `409`.

The same conditional-`updateMany` pattern is reused for reservation expiry and purchase completion, so those are race-safe too (e.g. a reservation can't be purchased and expired at the same moment).
