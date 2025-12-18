export type Role = "admin" | "mesero"

export type AuthedUser = {
  id: string
  email: string
  role: Role
}