import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Products from "./Products";
import { renderWithAuth, makeAuth } from "../test/renderWithAuth";
import type { Product } from "../types/models";
import type { ApiResponse } from "../types/api";

const apiFetchMock = vi.fn();
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

describe("Products integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiFetchMock.mockReset();
    toastOkMock.mockReset();
    toastErrMock.mockReset();
  });

  it("admin: ve formulario, crea producto (POST /products) y recarga lista", async () => {
    const user = userEvent.setup();

    let productsState: Product[] = [{ id: 1, name: "Burger", price: 10 }];

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

        if (path === "/products" && (!init?.method || init.method === "GET")) {
          return { data: productsState } satisfies ApiResponse<Product[]>;
        }

        if (path === "/products" && init?.method === "POST") {
          const body = JSON.parse(String(init.body || "{}")) as {
            name: string;
            price: number;
          };
          console.log("[test][apiFetchMock] POST /products body", body);

          const next: Product = { id: 2, name: body.name, price: body.price };
          productsState = [next, ...productsState];
          return { data: next } satisfies ApiResponse<Product>;
        }

        throw new Error("unexpected apiFetch path " + path);
      }
    );

    renderWithAuth(<Products />, {
      auth: makeAuth({
        profile: { id: "admin1", email: "admin@local.com", role: "admin" },
      }),
    });

    await screen.findByRole("heading", { name: /^Products$/i });
    await screen.findByText("Create product");
    await screen.findByText("Burger");

    const name = screen.getByPlaceholderText(/hamburguesa/i);
    const price = screen.getByPlaceholderText(/12\.50/i);

    await user.clear(name);
    await user.type(name, "Milanesa");

    await user.clear(price);
    await user.type(price, "25");

    const btn = screen.getByRole("button", { name: "Crear" });
    await user.click(btn);

    const postCall = apiFetchMock.mock.calls.find(
      (c) =>
        c[0] === "/products" &&
        (c[1] as RequestInit | undefined)?.method === "POST"
    );
    console.log("[test][Products] postCall", postCall);

    expect(postCall).toBeTruthy();
    await screen.findByText("Milanesa");
    expect(toastOkMock).toHaveBeenCalled();
  });

  it("mesero: NO ve formulario de creación", async () => {
    apiFetchMock.mockResolvedValue({
      data: [{ id: 1, name: "Burger", price: 10 }],
    } satisfies ApiResponse<Product[]>);

    renderWithAuth(<Products />, {
      auth: makeAuth({
        profile: { id: "m1", email: "m1@local.com", role: "mesero" },
      }),
    });

    await screen.findByRole("heading", { name: /^Products$/i });
    await screen.findByText("Burger");
    expect(screen.queryByText("Create product")).toBeNull();
    expect(screen.getByText(/no podés crear productos/i)).toBeInTheDocument();
  });
});
