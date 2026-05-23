const isTauri = () => {
  if (typeof window === "undefined") return false
  return !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__
}

export async function openExternalLink(url: string): Promise<void> {
  const u = (url || "").trim()
  if (!u) return

  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener")
      await openUrl(u)
      return
    } catch {
      try {
        const { open } = await import("@tauri-apps/plugin-shell")
        await open(u)
        return
      } catch {
      }
    }
  }

  window.open(u, "_blank", "noopener,noreferrer")
}
