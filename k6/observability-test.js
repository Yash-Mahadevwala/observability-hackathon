import http from "k6/http";
import { sleep, check } from "k6";

const BASE_URL = "http://localhost:3000";

export const options = {
    stages: [
        { duration: "30s", target: 20 },   // warmup
        { duration: "1m", target: 80 },    // normal load
        { duration: "1m", target: 150 },   // spike
        { duration: "30s", target: 0 }     // cooldown
    ],

    thresholds: {
        http_req_duration: ["p(95)<800"],
        http_req_failed: ["rate<0.3"] // Adjusted to 0.3 to allow for intentional 20% failures (400/404 tests)
    }
};

export default function () {

    // ----------------------------
    // POSITIVE TESTS
    // ----------------------------

    let users = http.get(`${BASE_URL}/users`);
    check(users, { "users status 200": (r) => r.status === 200 });

    let products = http.get(`${BASE_URL}/products`);
    check(products, { "products status 200": (r) => r.status === 200 });


    let orderPayload = JSON.stringify({
        user_id: Math.floor(Math.random() * 5) + 1,
        items: [
            {
                product_id: Math.floor(Math.random() * 5) + 1,
                quantity: 1
            }
        ]
    });

    let order = http.post(`${BASE_URL}/orders`, orderPayload, {
        headers: { "Content-Type": "application/json" }
    });

    check(order, {
        "order created": (r) => r.status === 200 || r.status === 201
    });


    // ----------------------------
    // NEGATIVE TESTS
    // ----------------------------

    let badOrder = http.post(
        `${BASE_URL}/orders`,
        JSON.stringify({
            user_id: null,
            items: []
        }),
        { headers: { "Content-Type": "application/json" } }
    );

    check(badOrder, {
        "invalid order rejected": (r) => r.status === 400 || r.status === 422
    });


    // ----------------------------
    // ERROR GENERATION
    // ----------------------------

    let invalidEndpoint = http.get(`${BASE_URL}/invalid-endpoint`);

    check(invalidEndpoint, {
        "404 generated": (r) => r.status === 404
    });


    // ----------------------------
    // DATABASE STRESS
    // ----------------------------

    for (let i = 0; i < 5; i++) {
        http.get(`${BASE_URL}/products`);
    }


    // ----------------------------
    // RANDOM LATENCY SIMULATION
    // ----------------------------

    if (Math.random() < 0.1) {
        http.get(`${BASE_URL}/orders`);
    }

    sleep(1);
}