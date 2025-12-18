import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { productsRouter } from "../src/routes/products.js";
import { ordersRouter } from "../src/routes/orders.js";
import { openapi } from "../src/swagger.js";
import { authRouter } from "../src/routes/auth.js";
import { errorMiddleware } from "../src/middlewares/error.js";
import { profilesRouter } from "../src/routes/profiles.js";
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  console.log("[health] ok");
  res.json({ ok: true });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/auth", authRouter);
app.use("/profiles", profilesRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use(errorMiddleware);

export default app;
