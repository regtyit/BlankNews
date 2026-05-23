import type { FetchResponse, Filter, NewsCluster, NewsItem, NewsStoreData } from "~/types"
import { XMLParser } from "fast-xml-parser"
import { useSettings } from "./useSettings"

export const MAX_ITEMS_PER_SOURCE = 500
export const MAX_STORED_ITEMS = 500000

function normalizeRssText(value: unknown, fallback = ""): string {
  if (value == null) return fallback
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    const parts = value.map((v) => normalizeRssText(v, "")).filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : fallback
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("#text" in obj) return normalizeRssText(obj["#text"], fallback)
    if ("_" in obj) return normalizeRssText(obj._, fallback)
  }
  return fallback
}

function normalizeRssLink(item: Record<string, unknown>): string {
  const link = item.link
  if (typeof link === "string") return link.trim()
  if (link && typeof link === "object" && !Array.isArray(link)) {
    const href = (link as Record<string, unknown>)["@_href"]
    if (typeof href === "string") return href.trim()
  }
  if (Array.isArray(link)) {
    for (const entry of link) {
      const text = normalizeRssLink({ link: entry })
      if (text) return text
    }
  }
  return normalizeRssText(item.id, "")
}

const isTauri = () => {
  if (typeof window === "undefined") return false
  return !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__
}

let memoryCache: NewsStoreData | null = null
let storeInstance: any = null

async function getStore() {
  if (storeInstance) return storeInstance
  if (isTauri()) {
    try {
      const { load } = await import("@tauri-apps/plugin-store")
      storeInstance = await load("news-store.json", { autoSave: false, defaults: {} })
      return storeInstance
    } catch (error) {
      console.warn("Failed to initialize Tauri Store:", error)
      storeInstance = null
      return null
    }
  }
  return null
}

let newsNavbarRefreshHandler: (() => void) | null = null

export function setNewsNavbarRefresh(fn: (() => void) | null) {
  newsNavbarRefreshHandler = fn
}

export function triggerNewsNavbarRefresh() {
  newsNavbarRefreshHandler?.()
}

export function useNewsFetch() {
  const generateId = (link: string, date: string): string => {
    try {
      return `${btoa(link).substring(0, 12)}_${new Date(date).getTime()}`
    } catch {
      return `${Date.now()}_${Math.random().toString(36).substring(2, 12)}`
    }
  }

  const calculateSimilarity = (title1: string, title2: string): number => {
    const words1 = title1.toLowerCase().split(/\s+/).filter((w) => w.length >= 3)
    const words2 = title2.toLowerCase().split(/\s+/).filter((w) => w.length >= 3)

    if (words1.length === 0 || words2.length === 0) return 0

    const set2 = new Set(words2)
    const matches = words1.filter((word) => set2.has(word)).length

    return matches / Math.max(words1.length, words2.length)
  }

  const clusterArticles = (items: NewsItem[], threshold: number = 0.6): { clusters: NewsCluster[], cards: NewsItem[] } => {
    const clusters: NewsCluster[] = []
    const cards: NewsItem[] = []
    const used = new Set<string>()
    const sorted = [...items].sort((a, b) => b.dateTimestamp - a.dateTimestamp)

    for (const item of sorted) {
      if (used.has(item.id)) continue

      const similarItems: NewsItem[] = []

      for (const other of sorted) {
        if (used.has(other.id) || other.id === item.id) continue

        const timeDiff = Math.abs(item.dateTimestamp - other.dateTimestamp)
        const withinTimeWindow = timeDiff < (30 * 60 * 1000)

        if (withinTimeWindow) {
          const similarity = calculateSimilarity(item.title, other.title)
          if (similarity >= threshold) {
            similarItems.push(other)
            used.add(other.id)
          }
        }
      }

      used.add(item.id)
      const dateTimestamp = similarItems.length > 0
        ? Math.max(item.dateTimestamp, ...similarItems.map((s) => s.dateTimestamp))
        : item.dateTimestamp

      if (similarItems.length > 0) {
        clusters.push({
          id: item.id,
          mainItem: item,
          similarItems: similarItems.sort((a, b) => b.dateTimestamp - a.dateTimestamp),
          sourceCount: similarItems.length + 1,
          date: new Date(dateTimestamp).toString(),
          dateTimestamp,
          type: "Cluster"
        })
      } else {
        cards.push(item)
      }
    }

    return { clusters, cards }
  }

  const parseRSS = async (xmlText: string, sourceName: string = "", maxItems: number = MAX_ITEMS_PER_SOURCE): Promise<NewsItem[]> => {
    const trimmed = xmlText?.trim() || ""
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      throw new Error(`Received HTML instead of RSS from ${sourceName}`)
    }
    if (!trimmed || trimmed.length < 50) {
      throw new Error(`Empty response from ${sourceName}`)
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
      parseAttributeValue: true,
      trimValues: true,
      removeNSPrefix: true
    })

    let parsed: any
    try {
      parsed = parser.parse(xmlText)
    } catch (error) {
      console.error("XML parse error:", error)
      throw new Error("XML Parse error")
    }

    let items = parsed.rss?.channel?.item || parsed.feed?.entry || parsed.channel?.item || []
    if (!Array.isArray(items)) {
      items = [items]
    }
    if (items.length == 0) {
      throw new Error("No items")
    }

    items = items.slice(0, maxItems)

    return items.map((item: any) => {
      let dateTimestamp = 0
      let dateFormatted = "Дата не указана"
      const dateStr = item.pubDate || item.date || item.published || ""
      if (dateStr) {
        try {
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            dateTimestamp = date.getTime()
            dateFormatted = date.toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          }
        } catch { }
      }

      let desc = item.description || item.summary || item.content || ""
      if (typeof desc === "string") {
        desc = desc.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").replace(/<[^>]*>/g, "").trim().replace(/\s+/g, " ")
      }

      let enc = ""
      if (Array.isArray(item.enclosure)) enc = item.enclosure[0]?.["@_url"] || ""
      else if (item.enclosure?.["@_url"]) enc = item.enclosure["@_url"]
      else if (item.media?.content?.["@_url"]) enc = item.media.content["@_url"]

      const link = normalizeRssLink(item)
      return {
        id: generateId(link || normalizeRssText(item.id), dateStr),
        title: normalizeRssText(item.title, "Без заголовка"),
        link,
        date: dateFormatted,
        dateTimestamp,
        author: normalizeRssText(item.author ?? item.creator, "Автор не указан"),
        category: normalizeRssText(item.category, "Без категории"),
        description: desc || "Нет описания",
        enclosureUrl: (enc || "").trim(),
        source: sourceName,
        fetchedAt: Date.now(),
        isRead: false
      }
    })
  }

  const fetchRssFeed = async (url: string, maxItems: number = MAX_ITEMS_PER_SOURCE): Promise<NewsItem[]> => {
    let xmlText = ""

    if (isTauri()) {
      try {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http")
        const response = await tauriFetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8"
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        xmlText = await response.text()
      } catch (error: any) {
        console.error("Tauri fetch error:", error.message)
        throw error
      }
    } else {
      try {
        const proxyUrl = `/api/proxy/rss?url=${encodeURIComponent(url)}`
        const response: any = await $fetch(proxyUrl, {
          method: "GET",
          retry: 2,
          retryDelay: 1000
        })

        xmlText = typeof response === "string" ? response : response.toString()
      } catch (error: any) {
        console.error("Proxy fetch error:", error.message)
        throw new Error(`Proxy fetch failed: ${error.message}`)
      }
    }

    return await parseRSS(xmlText, url, maxItems)
  }

  const fetchAllSources = async (sources: string[], maxItemsPerSource: number = MAX_ITEMS_PER_SOURCE): Promise<NewsItem[]> => {
    const allItems: NewsItem[] = []

    for (const source of sources) {
      try {
        const items = await fetchRssFeed(source, maxItemsPerSource)
        allItems.push(...items)
      } catch (err: any) {
        console.warn(`Failed ${source}:`, err.message)
      }
    }

    return allItems
  }

  const applyFilters = (items: NewsItem[], filters: Record<string, Filter>): NewsItem[] => {
    if (!filters || Object.keys(filters).length === 0) {
      return items
    }

    const filtered = items.filter(
      (item) => {
        const titleLower = item.title.toLowerCase()

        for (const [name, filter] of Object.entries(filters)) {
          let matchCount = 0
          for (const keyword of filter.keywords) {
            if (titleLower.includes(keyword.toLowerCase())) {
              matchCount += 1
            }
          }
          const matchRatio = filter.keywords.length > 0 ? matchCount / filter.keywords.length : 0
          if (matchRatio >= filter.threshold) {
            if (filter.filterOut) {
              return false
            } else {
              if (item.category == "" || item.category == null) {
                item.category = name
              }
              return true
            }
          }
        }
        return true
      }
    )
    return filtered
  }

  const saveToStore = async (items: NewsItem[], threshold: number = 0.6): Promise<{ items: NewsItem[], clusters: NewsCluster[], cards: NewsItem[] }> => {
    const store = await getStore()
    let existingItems: NewsItem[] = []

    if (store) {
      const existing = await store.get("news")
      existingItems = existing?.items || []
    } else if (memoryCache) {
      existingItems = memoryCache.items || []
    }

    const existingIds = new Set(existingItems.map((i) => i.id))
    const newItems = items.filter((i) => !existingIds.has(i.id))

    const mergedItems = [...newItems, ...existingItems]
      .sort((a, b) => b.dateTimestamp - a.dateTimestamp)
      .slice(0, MAX_STORED_ITEMS)

    const { clusters, cards } = clusterArticles(mergedItems, threshold)

    const newData = { items: mergedItems, clusters, lastFetch: Date.now(), source: "multiple" }

    if (store) {
      await store.set("news", newData)
      await store.save()
    } else {
      memoryCache = newData
    }

    return { items: mergedItems, clusters, cards }
  }

  const loadFromStore = async (): Promise<NewsStoreData | null> => {
    const store = await getStore()
    if (store) {
      const data = await store.get("news")
      if (data) {
        memoryCache = data
        return data
      }
    }
    return memoryCache
  }

  const clearAllNews = async (): Promise<void> => {
    const store = await getStore()
    const empty = { items: [], clusters: [], lastFetch: null, source: "multiple" }
    if (store) {
      await store.set("news", empty)
      await store.save()
    }
    memoryCache = empty
  }

  const createSuccessResponse = (
    clusters: any[],
    cards: any[]
  ): FetchResponse => ({
    success: true,
    news: [...clusters, ...cards].sort((a, b) => b.dateTimestamp - a.dateTimestamp)
  })

  const getNewsRss = async (force: boolean = false): Promise<FetchResponse> => {
    try {
      const Settings = useSettings()
      const [settings, cached] = await Promise.all([
        Settings.loadSettings(),
        loadFromStore()
      ])

      const cacheMs = settings.refreshInterval ?? 1800000
      if (!force && cached?.lastFetch && (Date.now() - cached.lastFetch) < cacheMs) {
        const { clusters, cards } = clusterArticles(cached.items || [], settings.similarityThreshold)
        return createSuccessResponse(clusters, cards)
      }

      const freshItems = await fetchAllSources(settings.sources, MAX_ITEMS_PER_SOURCE)
      const filtered = applyFilters(freshItems, settings.filters)
      const { clusters, cards } = await saveToStore(filtered, settings.similarityThreshold)

      return createSuccessResponse(clusters, cards)
    } catch {
      const Settings = useSettings()
      const settings = await Settings.loadSettings()
      const cached = await loadFromStore()
      if (cached?.items) {
        const { clusters, cards } = clusterArticles(cached.items, settings.similarityThreshold)
        return createSuccessResponse(clusters, cards)
      }
      return {
        success: false,
        news: []
      }
    }
  }

  return {
    getNewsRss,
    loadFromStore,
    saveToStore,
    clearAllNews,
    applyFilters,
    clusterArticles
  }
}
