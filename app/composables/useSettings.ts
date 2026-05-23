import type { AppSettings } from "~/types/index"

const isTauri = () => {
  if (typeof window === "undefined") return false
  return !!(window as any).__TAURI__
}

let storeInstance: any = null

async function getStore() {
  if (storeInstance) return storeInstance
  if (isTauri()) {
    try {
      const { load } = await import("@tauri-apps/plugin-store")
      storeInstance = await load("settings-store.json")
      return storeInstance
    } catch (error) {
      console.warn("Failed to initialize settings store:", error)
      storeInstance = null
      return null
    }
  }
  return null
}

const defaultSettings: AppSettings = {
  lastFetch: 0,
  sources: ["https://59.ru/rss-feeds/rss.xml"],
  filters: {},
  similarityThreshold: 0.6,
  lang: "ru",
  autoRefresh: true,
  refreshInterval: 900000
}

export function useSettings() {
  const loadSettings = async (): Promise<AppSettings> => {
    try {
      const store = await getStore()

      if (store) {
        const data = await store.get("settings")
        if (data !== null && data !== undefined) {
          return { ...defaultSettings, ...data }
        }
      } else {
        const local = localStorage.getItem("app-settings")
        if (local) {
          const parsed = JSON.parse(local)
          return { ...defaultSettings, ...parsed }
        }
      }
      return { ...defaultSettings }
    } catch (error) {
      console.warn("Error loading settings:", error)
      return { ...defaultSettings }
    }
  }

  const saveSettings = async (settings: AppSettings): Promise<void> => {
    try {
      const store = await getStore()

      if (store) {
        await store.set("settings", settings)
        await store.save()
      }

      localStorage.setItem("app-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving settings:", error)
      localStorage.setItem("app-settings", JSON.stringify(settings))
    }
  }

  const addFilter = async (
    name: string,
    keywords: string[],
    filterOut: boolean,
    threshold: number
  ): Promise<void> => {
    const current = await loadSettings()
    const updated: AppSettings = {
      ...current,
      filters: {
        ...current.filters,
        [name]: { keywords, filterOut, threshold }
      }
    }
    await saveSettings(updated)
  }

  const removeFilter = async (name: string): Promise<void> => {
    const current = await loadSettings()
    const { [name]: removed, ...rest } = current.filters
    const updated: AppSettings = { ...current, filters: rest }
    await saveSettings(updated)
  }

  const addSource = async (url: string): Promise<void> => {
    const current = await loadSettings()
    if (!current.sources.includes(url)) {
      await saveSettings({ ...current, sources: [...current.sources, url] })
    }
  }

  const removeSource = async (url: string): Promise<void> => {
    const current = await loadSettings()
    await saveSettings({
      ...current,
      sources: current.sources.filter((s) => s !== url)
    })
  }

  const setLanguage = async (lang: string): Promise<void> => {
    const current = await loadSettings()
    await saveSettings({ ...current, lang })
    localStorage.setItem("preferred-language", lang)
  }

  return {
    loadSettings,
    saveSettings,
    addFilter,
    removeFilter,
    addSource,
    removeSource,
    setLanguage
  }
}
