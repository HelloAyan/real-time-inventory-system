# Real-Time High-Traffic Inventory System

A "Limited Edition Sneaker Drop" app — users see live stock counts, reserve an item for a 60-second checkout window, and either complete the purchase or lose the reservation. All of it stays in sync across every open tab through WebSockets.

**Stack:** React + Redux Toolkit on the frontend, Node/Express on the backend, PostgreSQL via Prisma, Socket.io for real-time, JWT for auth.

I went with Prisma instead of Sequelize (the recommended ORM) mostly because I'm faster in it and the nested-query support made the "top 3 purchasers per drop" requirement pretty painless — it's just an `include` with `orderBy` + `take: 3`, no manual joins.

## Running it locally

**Backend**

```bash
cd backend
npm install
```

Add a `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://DB_USERNAME:DB_PASSWORD@localhost:5432/DB_NAME"
CLIENT_URL="https://real-time-inventory-system-nu.vercel.app"
JWT_SECRET="anything-long-and-random"
JWT_EXPIRES_IN="7d"
```

Then:

```bash
npx prisma migrate dev   # builds the schema, no manual SQL needed
npx prisma generate
npx prisma db seed       # optional, drops 10 sample sneakers in
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
```

`.env`:

```env
VITE_API_URL=https://real-inventory-kuvy.onrender.com/api
```

```bash
npm run dev
```

Open `https://real-time-inventory-system-nu.vercel.app` in two tabs and reserve/purchase from one — the other updates live.

## Schema

Four tables, all created through Prisma migrations:

```
User                        Drop
 id                          id
 username (unique)           name
 password (hashed)           price
                              totalStock       ← fixed at creation
                              availableStock   ← live counter

Reservation                 Purchase
 id                          id
 status: ACTIVE /            price
   EXPIRED / COMPLETED       purchasedAt
 expiresAt                   dropId  → Drop
 dropId  → Drop                userId  → User
 userId  → User                reservationId → Reservation (unique, 1:1)
```

`availableStock` is what actually moves: minus 1 on reserve, plus 1 back on expiry, and it just stays down after a purchase (nothing to add back).

## API

- `POST /api/auth/signup`, `POST /api/auth/login` — `{ username, password }` → `{ user, token }`
- `POST /api/drops` — `{ name, price, totalStock, startsAt? }`
- `GET /api/drops` — list, each drop comes with `recentPurchasers` (last 3 buyers, username + timestamp)
- `POST /api/reservations` *(auth required)* — `{ dropId }`, reserves for 60s
- `POST /api/reservations/:id/purchase` *(auth required)* — completes it

Errors are `{ success: false, message, details? }`. 409 covers most of the interesting cases — out of stock, drop not started yet, reservation expired, already purchased.

### Creating a Drop through Postman

There's no admin UI on purpose (per the spec), so this is how you'd actually seed a new drop for testing:

1. **Method:** `POST`
2. **URL:** `https://real-inventory-kuvy.onrender.com/api/drops`
3. **Headers:** `Content-Type: application/json` (no auth needed for this one)
4. **Body → raw → JSON:**

```json
{
  "name": "Air Jordan 1",
  "price": 199.99,
  "totalStock": 100,
  "startsAt": "2026-08-20T10:00:00Z"
}
```

| Field | Type | Required? | Notes |
|---|---|---|---|
| `name` | string | yes | drop title, shows up on the dashboard card |
| `price` | number | yes | in the app's currency, e.g. `199.99` |
| `totalStock` | integer | yes | how many units this drop has — `availableStock` gets set to this same number automatically |
| `startsAt` | ISO date string | no | when the drop goes live. Leave it out and it defaults to right now |

Hit Send and you should get a `201` back with the full drop object, `availableStock` already equal to `totalStock`. If `startsAt` is in the future, the drop still gets created — it just shows as "not started yet" on the dashboard and can't be reserved until that time passes.

**Socket events**, same origin as the API:
- `stock:updated` — `{ dropId, availableStock }`
- `reservation:expired` — `{ reservationId, dropId }`
- `purchase:new` — `{ dropId, username, purchasedAt }`

## The 60-second expiry — how it actually works

This was the part I went back and forth on. A single `setTimeout` per reservation is the obvious first approach and it's what fires the expiry in practice — scheduled the moment someone reserves, goes off exactly 60s later. But it's in-memory, so if the server restarts with reservations still active, those timers are just gone and that stock stays reserved forever. Not acceptable for something that's supposed to self-heal.

So there's a second layer: a sweep that runs every 5 seconds and asks the DB directly for any `ACTIVE` reservation whose `expiresAt` is already in the past, and expires those too. It's the boring correctness net under the fast path.

Both routes end up calling the same `expireReservation()`, and it's written so it can't double-fire:

```js
const { count } = await tx.reservation.updateMany({
  where: { id: reservationId, status: "ACTIVE" },
  data: { status: "EXPIRED" },
});
if (count === 0) return; // someone/something already got to it
```

If the timeout and the sweep both reach the same reservation around the same time, whichever gets there first wins the status flip, the second one just no-ops. Stock only ever gets incremented back once.

## Overselling — the actual concurrency part

The requirement was: 100 people click reserve on the last item at the same millisecond, only one gets it. The fix isn't a lock or a `SELECT ... FOR UPDATE` — it's letting Postgres do what it already does for any `UPDATE`:

```js
const { count } = await tx.drop.updateMany({
  where: { id: dropId, availableStock: { gt: 0 } },
  data: { availableStock: { decrement: 1 } },
});
if (count === 0) throw new ApiError(409, "This item is out of stock");
```

Every `UPDATE` takes a row lock while it runs, so concurrent requests against the same drop just queue up behind each other at the DB level — there's no window where two requests can both read "stock: 1" and both decide they're allowed to take it, because nobody's reading-then-writing in JS. Each request's `WHERE` clause gets checked against whatever the row actually looks like at that instant. Once availableStock hits 0, everyone after that gets `count: 0` and a 409.

I actually tested this instead of just trusting the theory — fired 5 concurrent reserve requests at a drop with `totalStock: 1`, got one `201` and four `409`s.

Same trick handles the purchase step and the expiry step, since both of those are also "only let this succeed if the row is still in the state I expect."

## What I'd do with more time

- Right now `reserve` and `purchase` are separate endpoints, which is correct per the spec but means the reservation ownership check happens at purchase time rather than being baked into the URL. Fine at this scale, would probably scope it under `/users/:id/reservations` in a bigger app.
- No rate limiting on reserve — a single user spamming the endpoint isn't handled specially, just relies on the same atomic check.
- Deployment isn't done yet (was planning a small VPS instead of Vercel serverless, since Socket.io + long-lived timers don't fit well in a serverless model).
