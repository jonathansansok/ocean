export function formatDateTime(iso: string) {
  console.log("[formatDateTime]", iso)
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch (e) {
    console.log("[formatDateTime] error", e)
    return iso
  }
}
