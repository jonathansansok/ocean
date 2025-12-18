import "dotenv/config";
import app from "../api/index.js";

const port = Number(process.env.PORT || 8080);

app.listen(port, () => {
  console.log("[server] listening", { port });
});
