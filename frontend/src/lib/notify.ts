import { toast } from "react-toastify"

export function toastOk(msg: string) {
  console.log("[toastOk]", msg)
  toast.success(msg, { position: "bottom-right" })
}

export function toastErr(msg: string) {
  console.log("[toastErr]", msg)
  toast.error(msg, { position: "bottom-right" })
}

export function toastInfo(msg: string) {
  console.log("[toastInfo]", msg)
  toast.info(msg, { position: "bottom-right" })
}
