export const openapi = {
  openapi: "3.0.0",
  info: { title: "Oceans API", version: "1.0.0" },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" }
    }
  },
  paths: {
    "/products": {
      get: { summary: "List products", security: [{ bearerAuth: [] }] },
      post: { summary: "Create product (admin)", security: [{ bearerAuth: [] }] }
    },
    "/orders": {
      get: { summary: "List orders", security: [{ bearerAuth: [] }] },
      post: { summary: "Create/close order (admin)", security: [{ bearerAuth: [] }] }
    }
  }
}
