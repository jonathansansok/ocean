export type ApiOk<T> = { data: T }
export type ApiErr = { error: string }
export type ApiResponse<T> = ApiOk<T> | ApiErr

export function isApiErr<T>(r: ApiResponse<T>): r is ApiErr {
  return "error" in r
}

export function isApiOk<T>(r: ApiResponse<T>): r is ApiOk<T> {
  return "data" in r
}