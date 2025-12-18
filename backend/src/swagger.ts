//app\backend\src\swagger.ts
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
      post: { summary: "Create order (mesero self / admin optional assign)", security: [{ bearerAuth: [] }] }
    },
    "/orders/{id}/assign": {
      patch: { summary: "Assign order to mesero (admin)", security: [{ bearerAuth: [] }] }
    },
    "/orders/{id}/status": {
      patch: { summary: "Update order status saved/closed (admin or assigned mesero)", security: [{ bearerAuth: [] }] }
    },
    "/profiles": {
      get: { summary: "List profiles (admin) optional role filter", security: [{ bearerAuth: [] }] }
    }
  }
};
