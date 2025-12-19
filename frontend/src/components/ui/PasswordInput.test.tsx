import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import PasswordInput from "./PasswordInput"

function Harness() {
  const { register } = useForm<{ pass: string }>({ defaultValues: { pass: "" } })
  return <PasswordInput reg={register("pass")} placeholder="pass" />
}

describe("PasswordInput", () => {
  it("togglea entre password y text", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByPlaceholderText("pass") as HTMLInputElement
    expect(input.type).toBe("password")

    const btn = screen.getByRole("button", { name: /mostrar/i })
    console.log("[test][PasswordInput] before click", { type: input.type })
    await user.click(btn)

    expect(input.type).toBe("text")
    console.log("[test][PasswordInput] after click", { type: input.type })

    const btn2 = screen.getByRole("button", { name: /ocultar/i })
    await user.click(btn2)
    expect(input.type).toBe("password")
  })
})
