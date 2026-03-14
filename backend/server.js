const express = require("express");
const cors = require("cors");
require("./config/otel");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorHandler = require("./middleware/errorHandler");
const { register } = require("./metrics/metrics")
const metricsMiddleware = require("./middleware/metricsMiddleware")
const requestLogger = require("./middleware/requestLogger")

const app = express();

app.use(cors());
app.use(metricsMiddleware);
app.use(requestLogger);
app.use(express.json());

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

app.get("/", (req, res) => {
  res.send("Hackathon API running");
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});