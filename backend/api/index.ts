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

app.get("/openapi.json", (_req, res) => {
  console.log("[openapi] hit");
  res.json(openapi);
});

const docsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin:0; background:#0b1220; }
    #swagger-ui { background:#0b1220; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      console.log("[docs] init");
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

app.get("/docs", (_req, res) => {
  console.log("[docs] hit");
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(docsHtml);
});

app.get("/docs/", (_req, res) => {
  console.log("[docs/] hit");
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(docsHtml);
});

app.use("/auth", authRouter);
app.use("/profiles", profilesRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use(errorMiddleware);

export default app;
