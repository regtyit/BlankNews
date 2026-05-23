export interface NewsItem {
  id: string
  title: string
  link: string
  date: string
  dateTimestamp: number
  author: string
  category: string
  description: string
  enclosureUrl: string
  source: string
  fetchedAt: number
  messageType?: "rss" | "api"
  clusterId?: string
  type: "Card"
}

export interface NewsCluster {
  id: string
  mainItem: NewsItem
  similarItems: NewsItem[]
  sourceCount: number
  date: string
  dateTimestamp: number
  type: "Cluster"
}

export interface NewsStoreData {
  items: NewsItem[]
  clusters: NewsCluster[]
  lastFetch: number | null
  source: string
}

export interface FetchResponse {
  success: boolean
  news: (NewsCluster[] | NewsItem[])[]
}

export interface Filter {
  keywords: string[]
  filterOut: boolean
  threshold: number
}

export interface Source {
  type: "rss" | "api"
  url?: string
  config?: {
    endpoint: string
    apiKey?: string
    params?: Record<string, string>
    headers?: Record<string, string>
  }
}

export interface AppSettings {
  lastFetch: number
  sources: string[]
  filters: Record<string, Filter>
  similarityThreshold: number
  lang: string
  itemsPerPage?: number
  autoRefresh?: boolean
  refreshInterval?: number
  clusteringTimeWindow?: number
}
