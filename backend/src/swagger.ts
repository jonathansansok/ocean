export const openapi = {
  openapi: "3.0.0",
  info: { title: "Oceans API", version: "1.0.0" },
  paths: {
    "/products": {
      get: { summary: "List products" },
      post: { summary: "Create product (admin)" }
    },
    "/orders": {
      get: { summary: "List orders" },
      post: { summary: "Create/close order (admin)" }
    }
  }
};
