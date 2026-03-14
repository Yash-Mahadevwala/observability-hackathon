import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 }
  ]
};

const BASE_URL = "http://localhost:3000";

export default function () {

  let users = http.get(`${BASE_URL}/users`);
  check(users, { "users ok": (r) => r.status === 200 });

  let products = http.get(`${BASE_URL}/products`);
  check(products, { "products ok": (r) => r.status === 200 });

  let order = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify({
      user_id: 1,
      items: [
        { product_id: 1, quantity: 1 }
      ]
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  check(order, { "order created": (r) => r.status === 200 });

  sleep(1);
}