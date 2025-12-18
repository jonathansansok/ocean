//app\backend\src\index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { openapi } from "./swagger.js";
import { authRouter } from "./routes/auth.js";
import { errorMiddleware } from "./middlewares/error.js";
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  console.log("[health] ok");
  res.json({ ok: true });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/auth", authRouter);

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use(errorMiddleware);
const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log("[server] listening", { port }));
