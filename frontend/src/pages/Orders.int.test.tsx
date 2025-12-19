import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Orders from "./Orders";
import { renderWithAuth, makeAuth } from "../test/renderWithAuth";
import type { Product, Order, OrderItem } from "../types/models";
import type { Profile } from "../types/auth";
import type { ApiResponse } from "../types/api";

const apiFetchMock = vi.fn();
const swalFireMock = vi.fn();
const toastOkMock = vi.fn();
const toastErrMock = vi.fn();

vi.mock("../lib/api", () => {
  return {
    apiFetch: (...args: unknown[]) => {
      console.log("[test][mock][apiFetch] call", args);
      return apiFetchMock(...args);
    },
  };
});

vi.mock("sweetalert2", () => {
  return {
    default: {
      fire: (...args: unknown[]) => {
        console.log("[test][mock][Swal.fire] call", args);
        return swalFireMock(...args);
      },
    },
  };
});

vi.mock("../lib/notify", () => {
  return {
    toastOk: (msg: string) => {
      console.log("[test][mock][toastOk]", msg);
      return toastOkMock(msg);
    },
    toastErr: (msg: string) => {
      console.log("[test][mock][toastErr]", msg);
      return toastErrMock(msg);
    },
    toastInfo: (msg: string) => {
      console.log("[test][mock][toastInfo]", msg);
    },
  };
});

type OrderWithItems = Order & { order_items: OrderItem[] };

describe("Orders integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiFetchMock.mockReset();
    swalFireMock.mockReset();
    toastOkMock.mockReset();
    toastErrMock.mockReset();
    swalFireMock.mockResolvedValue({ isConfirmed: true });
  });

  it("mesero: selecciona productos y crea orden Saved (POST /orders) y recarga", async () => {
    const user = userEvent.setup();

    const productsState: Product[] = [
      { id: 1, name: "Burger", price: 10 },
      { id: 2, name: "Papas", price: 5 },
    ];

    let ordersState: OrderWithItems[] = [];

    apiFetchMock.mockImplementation(
      async (
        path: string,
        init?: RequestInit
      ): Promise<ApiResponse<unknown>> => {
        console.log("[test][apiFetchMock] impl", {
          path,
          method: init?.method,
          body: init?.body,
        });

        if (path === "/products")
          return { data: productsState } satisfies ApiResponse<Product[]>;

        if (path === "/orders" && (!init?.method || init.method === "GET")) {
          return { data: ordersState } satisfies ApiResponse<OrderWithItems[]>;
        }

        if (path === "/orders" && init?.method === "POST") {
          const body = JSON.parse(String(init.body || "{}")) as {
            status: "saved" | "closed";
            items: { productId: number; qty: number }[];
          };
          console.log("[test][apiFetchMock] POST /orders body", body);

          const p1 = productsState.find((p) => p.id === 1) || null;
          const p2 = productsState.find((p) => p.id === 2) || null;

          const newOrder: OrderWithItems = {
            id: 99,
            status: body.status,
            total: 15,
            created_at: "2025-12-18T22:00:00.000Z",
            created_by: "u1",
            assigned_to: "u1",
            created_by_profile: {
              id: "u1",
              email: "mesero@local.com",
              role: "mesero",
            },
            assigned_to_profile: {
              id: "u1",
              email: "mesero@local.com",
              role: "mesero",
            },
            order_items: [
              {
                id: 1,
                product_id: 1,
                qty: 1,
                unit_price: 10,
                line_total: 10,
                product: p1,
              },
              {
                id: 2,
                product_id: 2,
                qty: 1,
                unit_price: 5,
                line_total: 5,
                product: p2,
              },
            ],
          };

          ordersState = [newOrder, ...ordersState];
          return { data: newOrder } satisfies ApiResponse<OrderWithItems>;
        }

        throw new Error("unexpected apiFetch path " + path);
      }
    );

    renderWithAuth(<Orders />, {
      auth: makeAuth({
        profile: { id: "u1", email: "mesero@local.com", role: "mesero" },
      }),
    });

    await screen.findByText("Crear orden");
    await screen.findByText("Burger");
    await screen.findByText("Papas");

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    console.log("[test][Orders] plusButtons", { count: plusButtons.length });

    await user.click(plusButtons[0]);
    await user.click(plusButtons[1]);

    await screen.findByText("$15.00");

    const saveBtn = screen.getByRole("button", { name: "Save" });
    await user.click(saveBtn);

    expect(swalFireMock).toHaveBeenCalled();

    const postCall = apiFetchMock.mock.calls.find(
      (c) =>
        c[0] === "/orders" &&
        (c[1] as RequestInit | undefined)?.method === "POST"
    );
    console.log("[test][Orders] postCall", postCall);
    expect(postCall).toBeTruthy();

    const postInit = postCall?.[1] as RequestInit;
    const postBody = JSON.parse(String(postInit.body || "{}")) as {
      status: "saved" | "closed";
      items: { productId: number; qty: number }[];
    };

    expect(postBody.status).toBe("saved");
    expect(Array.isArray(postBody.items)).toBe(true);
    expect(postBody.items.length).toBe(2);

    await screen.findByText("Orden #99");
    await screen.findByText("$15");
  });

  it("admin: carga meseros y reasigna (PATCH /orders/:id/assign)", async () => {
    const user = userEvent.setup();

    const productsState: Product[] = [{ id: 1, name: "Burger", price: 10 }];

    const meserosState: Profile[] = [
      { id: "m1", email: "m1@local.com", role: "mesero" },
      { id: "m2", email: "m2@local.com", role: "mesero" },
    ];

    let ordersState: OrderWithItems[] = [
      {
        id: 10,
        status: "saved",
        total: 10,
        created_at: "2025-12-18T22:00:00.000Z",
        created_by: "admin1",
        assigned_to: "m1",
        created_by_profile: {
          id: "admin1",
          email: "admin@local.com",
          role: "admin",
        },
        assigned_to_profile: {
          id: "m1",
          email: "m1@local.com",
          role: "mesero",
        },
        order_items: [
          {
            id: 1,
            product_id: 1,
            qty: 1,
            unit_price: 10,
            line_total: 10,
            product: productsState[0],
          },
        ],
      },
    ];

    apiFetchMock.mockImplementation(
      async (
        path: string,
        init?: RequestInit
      ): Promise<ApiResponse<unknown>> => {
        console.log("[test][apiFetchMock] impl", {
          path,
          method: init?.method,
          body: init?.body,
        });

        if (path === "/products")
          return { data: productsState } satisfies ApiResponse<Product[]>;
        if (path === "/orders")
          return { data: ordersState } satisfies ApiResponse<OrderWithItems[]>;
        if (path === "/profiles?role=mesero")
          return { data: meserosState } satisfies ApiResponse<Profile[]>;

        if (path === "/orders/10/assign" && init?.method === "PATCH") {
          const body = JSON.parse(String(init.body || "{}")) as {
            assignedTo: string;
          };
          console.log("[test][apiFetchMock] PATCH assign body", body);

          ordersState = ordersState.map((o) =>
            o.id === 10
              ? {
                  ...o,
                  assigned_to: body.assignedTo,
                  assigned_to_profile:
                    meserosState.find((m) => m.id === body.assignedTo) || null,
                }
              : o
          );

          return { data: ordersState[0] } satisfies ApiResponse<OrderWithItems>;
        }

        throw new Error("unexpected apiFetch path " + path);
      }
    );

    renderWithAuth(<Orders />, {
      auth: makeAuth({
        profile: { id: "admin1", email: "admin@local.com", role: "admin" },
      }),
    });

    await screen.findByRole("heading", { name: /órdenes/i });
    console.log("[test][Orders][admin] heading ok");
    await screen.findByText("Orden #10");

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    console.log("[test][Orders][admin] select value before", select.value);

    await user.selectOptions(select, "m2");
    expect(swalFireMock).toHaveBeenCalled();

    const patchCall = apiFetchMock.mock.calls.find((c) =>
      String(c[0]).includes("/orders/10/assign")
    );
    console.log("[test][Orders][admin] patchCall", patchCall);
    expect(patchCall).toBeTruthy();

    const patchInit = patchCall?.[1] as RequestInit;
    const patchBody = JSON.parse(String(patchInit.body || "{}")) as {
      assignedTo: string;
    };
    expect(patchBody.assignedTo).toBe("m2");
  });

  it("mesero: NO asignado no puede cerrar; asignado sí (PATCH /orders/:id/status)", async () => {
    const user = userEvent.setup();

    const productsState: Product[] = [{ id: 1, name: "Burger", price: 10 }];

    const ordersState: OrderWithItems[] = [
      {
        id: 1,
        status: "saved",
        total: 10,
        created_at: "2025-12-18T22:00:00.000Z",
        created_by: "m2",
        assigned_to: "m2",
        created_by_profile: { id: "m2", email: "m2@local.com", role: "mesero" },
        assigned_to_profile: {
          id: "m2",
          email: "m2@local.com",
          role: "mesero",
        },
        order_items: [
          {
            id: 1,
            product_id: 1,
            qty: 1,
            unit_price: 10,
            line_total: 10,
            product: productsState[0],
          },
        ],
      },
      {
        id: 2,
        status: "saved",
        total: 10,
        created_at: "2025-12-18T22:00:00.000Z",
        created_by: "m1",
        assigned_to: "m1",
        created_by_profile: { id: "m1", email: "m1@local.com", role: "mesero" },
        assigned_to_profile: {
          id: "m1",
          email: "m1@local.com",
          role: "mesero",
        },
        order_items: [
          {
            id: 2,
            product_id: 1,
            qty: 1,
            unit_price: 10,
            line_total: 10,
            product: productsState[0],
          },
        ],
      },
    ];

    apiFetchMock.mockImplementation(
      async (
        path: string,
        init?: RequestInit
      ): Promise<ApiResponse<unknown>> => {
        console.log("[test][apiFetchMock] impl", {
          path,
          method: init?.method,
          body: init?.body,
        });

        if (path === "/products")
          return { data: productsState } satisfies ApiResponse<Product[]>;
        if (path === "/orders")
          return { data: ordersState } satisfies ApiResponse<OrderWithItems[]>;

        if (path === "/orders/2/status" && init?.method === "PATCH") {
          const body = JSON.parse(String(init.body || "{}")) as {
            status: "saved" | "closed";
          };
          console.log("[test][apiFetchMock] PATCH status body", body);
          return {
            data: { ...ordersState[1], status: body.status },
          } satisfies ApiResponse<OrderWithItems>;
        }

        throw new Error("unexpected apiFetch path " + path);
      }
    );

    renderWithAuth(<Orders />, {
      auth: makeAuth({
        profile: { id: "m1", email: "m1@local.com", role: "mesero" },
      }),
    });

    await screen.findByText("Orden #1");
    await screen.findByText("Orden #2");

    const order1 = screen.getByText("Orden #1").closest(".card") as HTMLElement;
    const order2 = screen.getByText("Orden #2").closest(".card") as HTMLElement;

    console.log("[test][Orders] cards", { has1: !!order1, has2: !!order2 });

    const btn1 = within(order1).getByRole("button", { name: /cerrar orden/i });
    const btn2 = within(order2).getByRole("button", { name: /cerrar orden/i });

    console.log("[test][Orders] btns", {
      btn1Text: btn1.textContent,
      btn2Text: btn2.textContent,
      btn1Disabled: btn1.hasAttribute("disabled"),
      btn2Disabled: btn2.hasAttribute("disabled"),
    });

    await user.click(btn2);
    expect(swalFireMock).toHaveBeenCalled();

    const patchCall = apiFetchMock.mock.calls.find((c) =>
      String(c[0]).includes("/orders/2/status")
    );
    console.log("[test][Orders] patchCall status", patchCall);
    expect(patchCall).toBeTruthy();

    const patchInit = patchCall?.[1] as RequestInit;
    const patchBody = JSON.parse(String(patchInit.body || "{}")) as {
      status: "saved" | "closed";
    };
    expect(patchBody.status).toBe("closed");
  });
});
