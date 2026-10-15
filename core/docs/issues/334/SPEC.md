# shop: e-commerce specification

> **Status:** Current planning checklist; no release candidate exists. The product
> both builders implement in issue #334. It specifies the store only; how a builder
> works on LayerFS is in [README.md](README.md#builder-instructions).

## 1. Overview

`shop` is a small online store: a product catalog, carts, checkout with stock control,
orders, discount codes, a small admin API and a browser frontend. It is one Node.js
project with an HTTP server, JSON-file storage and an automated test suite.

## 2. Technical constraints

| Area | Requirement |
| --- | --- |
| Runtime | Node.js 22, ES modules (`"type": "module"`) |
| Server | Express 4 |
| Frontend build | `esbuild` (dev dependency), bundling `src/web/` into `dist/` |
| Tests | `node:test` and `node:assert`; no other test framework |
| Storage | JSON files under `data/`; no database server; no dependency that compiles native code |
| Money | Integer cents everywhere; never floating-point amounts |
| Port | `PORT` environment variable, default `3000` |
| Scripts | `npm start` (server), `npm test` (all tests), `npm run build` (frontend bundle) |

## 3. Project layout

```
shop/
  package.json
  package-lock.json
  .gitignore              node_modules/, dist/, coverage/, *.log
  .lww                    %include .gitignore
  README.md
  data/
    products.json         seed catalog (committed)
    discounts.json        discount codes (committed)
    orders.json           created at runtime when absent
  src/
    server.js             builds the Express app; exports createApp({ dataDir })
    main.js               starts the server on PORT
    catalog.js
    cart.js
    checkout.js
    orders.js
    admin.js
    store.js              JSON-file reads and atomic writes
    web/                  frontend sources
  test/                   *.test.js, one file per area
  dist/                   build output (not committed to Git; LayerFS stores it)
```

`createApp({ dataDir })` lets each test run against its own temporary copy of `data/`.

## 4. Data model

**Product**

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Unique, URL-safe, such as `"mug-classic"` |
| `name` | string | 1–100 characters |
| `description` | string | Up to 2,000 characters |
| `priceCents` | integer | ≥ 1 |
| `category` | string | One of the catalog's categories |
| `stock` | integer | ≥ 0 |
| `imageUrl` | string | Any URL |

The seed catalog has **30 products in at least 4 categories**, including at least one
product with `stock: 0` and one with `stock: 1`.

**Cart:** `{ id, items: [{ productId, quantity }], discountCode | null, createdAt }`.
Carts live in server memory; they don't survive a restart.

**Order:** `{ id, cartId, items: [{ productId, name, priceCents, quantity }],
subtotalCents, discountCents, taxCents, totalCents, discountCode | null, createdAt }`.
Orders are appended to `data/orders.json`. An order copies each product's name and
price at checkout time.

**Discount code:** `{ code, percentOff | null, amountOffCents | null, minSubtotalCents,
active }`. Exactly one of `percentOff` (1–100) and `amountOffCents` (≥ 1) is set.

## 5. HTTP API

All bodies are JSON. Every error has the shape
`{ "error": { "code": "<CODE>", "message": "<text>" } }`.

| Status | `code` | When |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | A field is missing, has the wrong type, or is out of range |
| 401 | `UNAUTHORIZED` | An admin call without the right token |
| 404 | `NOT_FOUND` | Unknown product, cart, order or route |
| 409 | `OUT_OF_STOCK` | Checkout asks for more than is in stock |
| 409 | `EMPTY_CART` | Checkout of a cart with no items |
| 422 | `INVALID_DISCOUNT` | Unknown, inactive or not-yet-applicable discount code |

### Health

| Method and path | Response |
| --- | --- |
| `GET /health` | `200 { "status": "ok" }` |

### Catalog

| Method and path | Behaviour |
| --- | --- |
| `GET /api/products` | Query: `category`, `q`, `page` (default 1), `pageSize` (default 12, max 50). `q` matches name or description, case-insensitive. Returns `{ items, page, pageSize, total }`, sorted by name |
| `GET /api/products/:id` | The product, or 404 |
| `GET /api/categories` | `{ items: [{ name, count }] }`, sorted by name |

### Cart

| Method and path | Behaviour |
| --- | --- |
| `POST /api/carts` | Creates an empty cart. `201` with the cart view |
| `GET /api/carts/:id` | The cart view |
| `POST /api/carts/:id/items` | Body `{ productId, quantity }`, quantity 1–99. Adds to an existing line instead of duplicating it. Quantity may not exceed current stock (409 `OUT_OF_STOCK`) |
| `PATCH /api/carts/:id/items/:productId` | Body `{ quantity }`, 0–99; 0 removes the line |
| `DELETE /api/carts/:id/items/:productId` | Removes the line; 404 if absent |
| `POST /api/carts/:id/discount` | Body `{ code }`; validates and attaches it (422 `INVALID_DISCOUNT`) |
| `DELETE /api/carts/:id/discount` | Removes the code |

The **cart view** is `{ id, items: [{ productId, name, priceCents, quantity,
lineTotalCents }], subtotalCents, discountCents, taxCents, totalCents, discountCode }`.

### Checkout and orders

| Method and path | Behaviour |
| --- | --- |
| `POST /api/checkout` | Body `{ cartId, email }`; `email` must contain `@`. On success: stock reduced, order saved, cart emptied, `201` with the order |
| `GET /api/orders/:id` | The order, or 404 |

### Admin

Every admin call needs the header `x-admin-token` equal to the `ADMIN_TOKEN`
environment variable; without `ADMIN_TOKEN` set, admin calls always return 401.

| Method and path | Behaviour |
| --- | --- |
| `POST /api/admin/products` | Creates a product (all fields validated; `id` unique, 400 if taken). `201` |
| `PATCH /api/admin/products/:id` | Updates any field except `id` |
| `GET /api/admin/orders` | All orders, newest first |

## 6. Business rules

1. **Totals,** all in integer cents, in this order:
   - `subtotal` = Σ `priceCents × quantity`, using current prices;
   - `discount` = `floor(subtotal × percentOff / 100)`, or `min(amountOffCents,
     subtotal)`; 0 when there's no code;
   - `tax` = `round((subtotal − discount) × 0.08)`, rounding half up;
   - `total` = `subtotal − discount + tax`.
2. **Discounts:** one code per cart. It applies only while `active` and when
   `subtotal ≥ minSubtotalCents`; checkout re-checks it and returns 422 if it no longer
   applies.
3. **Stock:** adding to a cart checks stock but doesn't reserve it. Checkout checks
   every line and either reduces all of them or none. When it fails it names each short
   product in `message`.
4. **Concurrent checkouts:** two checkouts racing for the last unit must give exactly
   one order and one 409; stock never goes below 0. Serialize checkout writes within
   the process.
5. **Writes are atomic:** `data/*.json` is written to a temporary file and renamed into
   place, so a crash never leaves a half-written file.
6. **Ids:** carts and orders get random ids (`crypto.randomUUID()`).

## 7. Frontend

Served by Express from `dist/` at `/`. Plain JavaScript, no framework.

| Page | Path | Shows |
| --- | --- | --- |
| Catalog | `/` | Category filter, search box, product grid with paging |
| Product | `/product.html?id=<id>` | Details, quantity selector, "Add to cart" |
| Cart | `/cart.html` | Lines with quantity edit and remove, discount field, totals |
| Checkout | `/checkout.html` | Email field, order summary, "Place order", then the order id |

The cart id is kept in `localStorage`. `npm run build` bundles `src/web/*.js` and
copies the HTML and CSS into `dist/`.

## 8. Tests

`npm test` runs every `test/*.test.js` file and must pass. Each area has its own file:

| File | Covers at least |
| --- | --- |
| `health.test.js` | `/health` |
| `catalog.test.js` | Category filter, search, paging bounds, sorting, 404, categories |
| `cart.test.js` | Create, add, merge lines, change quantity, remove, stock limit, invalid input, totals and tax rounding |
| `discount.test.js` | Percent and amount codes, minimum subtotal, inactive and unknown codes, the cap at subtotal |
| `checkout.test.js` | Success, out of stock with no partial reduction, empty cart, invalid email, the race for the last unit, an order saved to `orders.json` |
| `admin.test.js` | 401 without a token, create, duplicate id, update, list orders |
| `web.test.js` | After a build: each page and the bundle are served with status 200 |

Tests start the app on a random port with a temporary data folder, and never touch
the committed `data/`.

## 9. Delivery order

Build in this order and publish each milestone when its tests pass:

| # | Milestone | Spec sections |
| --- | --- | --- |
| M1 | Skeleton: layout, scripts, `/health`, `.gitignore`, `.lww`, README | 2, 3, 5 (health), 8 (health) |
| M2 | Catalog with the seed data | 4 (product), 5 (catalog), 8 (catalog) |
| M3 | Cart and totals | 4 (cart), 5 (cart), 6.1, 8 (cart) |
| M4 | Checkout, orders and discounts | 4, 5, 6, 8 (discount, checkout) |
| M5 | Frontend | 7, 8 (web) |
| M6 | Admin and README | 5 (admin), 8 (admin), 10 |

## 10. Acceptance

The store is done when, from a clean checkout of the final project:

- `npm install --no-audit --no-fund`, `npm test` and `npm run build` all succeed;
- a smoke test passes in one command: start the server, `GET /health`, create a cart,
  add a product, check out, read the order back, stop the server;
- `README.md` says how to install, run, test, build, and use the admin token.
