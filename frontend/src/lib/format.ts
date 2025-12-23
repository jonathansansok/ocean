export function formatDateTime(iso: string) {
  console.log("[formatDateTime]", iso)
  try {
    const d = new Date(iso)
    const t = d.getTime()
    if (Number.isNaN(t)) {
      console.log("[formatDateTime] invalid date", { iso })
      return iso
    }
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch (e) {
    console.log("[formatDateTime] error", e)
    return iso
  }
}
