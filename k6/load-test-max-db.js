import http from "k6/http";
import { sleep, check, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ─── Custom Metrics ────────────────────────────────────────────────────────────
const errorRate       = new Rate("error_rate");
const dbWriteLatency  = new Trend("db_write_latency_ms");
const dbReadLatency   = new Trend("db_read_latency_ms");
const orderCreated    = new Counter("orders_created_total");
const userCreated     = new Counter("users_created_total");
const productCreated  = new Counter("products_created_total");

// ─── Load Profile ──────────────────────────────────────────────────────────────
// Stages simulate: ramp-up → sustained medium → spike → sustained high → ramp-down
export const options = {
  stages: [
    { duration: "30s",  target: 10  },   // warm-up
    { duration: "1m",   target: 50  },   // normal load
    { duration: "30s",  target: 150 },   // ramp to high load
    { duration: "2m",   target: 150 },   // sustained high (stress)
    { duration: "30s",  target: 300 },   // spike
    { duration: "1m",   target: 300 },   // sustained spike (breaking point)
    { duration: "30s",  target: 0   },   // ramp-down / recovery
  ],

  // ─── Performance Thresholds ─────────────────────────────────────────────────
  thresholds: {
    // 95th percentile must be under 500ms, 99th under 1500ms
    http_req_duration:        ["p(95)<500", "p(99)<1500"],
    // Error rate must stay under 5%
    error_rate:               ["rate<0.05"],
    // DB write (POST) 95th percentile under 800ms
    db_write_latency_ms:      ["p(95)<800"],
    // DB read (GET) 95th percentile must be snappy
    db_read_latency_ms:       ["p(95)<300"],
    // Ensure at least 1 order was created
    orders_created_total:     ["count>0"],
  },
};

const BASE = "http://localhost:3000";
const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };

// ─── Shared state (seeded IDs pulled per VU iteration) ─────────────────────────
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Main Test Function ────────────────────────────────────────────────────────
export default function () {

  // ── 1. Health & Metrics Endpoints (infrastructure level) ────────────────────
  group("Health & Observability", () => {
    const health = http.get(`${BASE}/`);
    check(health, { "health: status 200": (r) => r.status === 200 });
    errorRate.add(health.status !== 200);

    const metrics = http.get(`${BASE}/metrics`);
    check(metrics, { "metrics: status 200": (r) => r.status === 200 });
    errorRate.add(metrics.status !== 200);
  });

  sleep(0.2);

  // ── 2. User Reads (DB SELECT load) ──────────────────────────────────────────
  let userIds = [];
  group("Users - Read", () => {
    const start = Date.now();
    const res = http.get(`${BASE}/users`);
    dbReadLatency.add(Date.now() - start);

    const ok = check(res, {
      "get users: status 200": (r) => r.status === 200,
      "get users: is array":  (r) => Array.isArray(r.json()),
    });
    errorRate.add(!ok);

    if (res.status === 200) {
      const users = res.json();
      userIds = users.map((u) => u.id);
    }
  });

  sleep(0.1);

  // ── 3. Product Reads (DB SELECT load) ───────────────────────────────────────
  let productIds = [];
  group("Products - Read", () => {
    const start = Date.now();
    const res = http.get(`${BASE}/products`);
    dbReadLatency.add(Date.now() - start);

    const ok = check(res, {
      "get products: status 200": (r) => r.status === 200,
      "get products: is array":   (r) => Array.isArray(r.json()),
    });
    errorRate.add(!ok);

    if (res.status === 200) {
      const products = res.json();
      productIds = products.map((p) => p.id);
    }
  });

  sleep(0.1);

  // ── 4. Order Reads (DB SELECT load) ─────────────────────────────────────────
  group("Orders - Read", () => {
    const start = Date.now();
    const res = http.get(`${BASE}/orders`);
    dbReadLatency.add(Date.now() - start);

    const ok = check(res, {
      "get orders: status 200": (r) => r.status === 200,
      "get orders: is array":   (r) => Array.isArray(r.json()),
    });
    errorRate.add(!ok);
  });

  sleep(0.2);

  // ── 5. User Creation (DB INSERT stress) ─────────────────────────────────────
  group("Users - Write", () => {
    const payload = JSON.stringify({
      name:     `User_${__VU}_${__ITER}`,
      email:    `user_${__VU}_${__ITER}@loadtest.com`,
      password: "LoadTest@123",
    });

    const start = Date.now();
    const res = http.post(`${BASE}/users`, payload, JSON_HEADERS);
    dbWriteLatency.add(Date.now() - start);

    const ok = check(res, {
      "create user: status 200 or 201": (r) => r.status === 200 || r.status === 201,
      "create user: has id":            (r) => r.json("id") !== undefined,
    });
    errorRate.add(!ok);

    if (ok) {
      userCreated.add(1);
      // Push new user ID into local list for order creation below
      if (res.json("id")) userIds.push(res.json("id"));
    }
  });

  sleep(0.2);

  // ── 6. Product Creation (DB INSERT stress) ──────────────────────────────────
  group("Products - Write", () => {
    const payload = JSON.stringify({
      name:  `Product_${__VU}_${__ITER}`,
      price: Math.round(Math.random() * 500 * 100) / 100 + 1,
      stock: Math.floor(Math.random() * 200) + 1,
    });

    const start = Date.now();
    const res = http.post(`${BASE}/products`, payload, JSON_HEADERS);
    dbWriteLatency.add(Date.now() - start);

    const ok = check(res, {
      "create product: status 200 or 201": (r) => r.status === 200 || r.status === 201,
      "create product: has id":            (r) => r.json("id") !== undefined,
    });
    errorRate.add(!ok);

    if (ok) {
      productCreated.add(1);
      if (res.json("id")) productIds.push(res.json("id"));
    }
  });

  sleep(0.2);

  // ── 7. Order Creation (multi-table DB INSERT + FK stress) ───────────────────
  // Only create an order if we have valid user + product IDs
  if (userIds.length > 0 && productIds.length > 0) {
    group("Orders - Write", () => {
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const items = Array.from({ length: itemCount }, () => ({
        product_id: pickRandom(productIds),
        quantity:   Math.floor(Math.random() * 5) + 1,
      }));

      const payload = JSON.stringify({
        user_id: pickRandom(userIds),
        items,
      });

      const start = Date.now();
      const res = http.post(`${BASE}/orders`, payload, JSON_HEADERS);
      dbWriteLatency.add(Date.now() - start);

      const ok = check(res, {
        "create order: status 200 or 201": (r) => r.status === 200 || r.status === 201,
        "create order: has id":            (r) => r.json("id") !== undefined,
      });
      errorRate.add(!ok);

      if (ok) {
        orderCreated.add(1);

        // ── 8. Delete the created order (DB DELETE stress + FK cascade) ─────
        const orderId = res.json("id");
        if (orderId && Math.random() < 0.3) { // delete ~30% of orders to avoid unbounded growth
          const delRes = http.del(`${BASE}/orders/${orderId}`);
          check(delRes, { "delete order: status 200": (r) => r.status === 200 });
          errorRate.add(delRes.status !== 200);
        }
      }
    });
  }

  // ── 9. Validate error handling (backend validation + DB not involved) ────────
  group("Validation - Error Paths", () => {
    // Missing required fields → expect 400
    const badUser = http.post(
      `${BASE}/users`,
      JSON.stringify({ name: "" }),
      JSON_HEADERS
    );
    check(badUser, { "invalid user: status 400": (r) => r.status === 400 });

    const badProduct = http.post(
      `${BASE}/products`,
      JSON.stringify({ name: "X", price: -5 }),
      JSON_HEADERS
    );
    check(badProduct, { "invalid product: status 400": (r) => r.status === 400 });

    const badOrder = http.post(
      `${BASE}/orders`,
      JSON.stringify({ user_id: 99999, items: [] }),
      JSON_HEADERS
    );
    check(badOrder, { "invalid order: status 400": (r) => r.status === 400 });
  });

  sleep(Math.random() * 1 + 0.5); // random think time 0.5-1.5s
}