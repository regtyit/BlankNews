import { helpTopicForRoute } from "~/utils/helpTopics"

const allowedHelpPages = new Set([
  "index.htm",
  "settings.htm",
  "sources.htm",
  "filters.htm",
  "locale.htm"
])

export function normalizeHelpPage(filename: string | undefined): string {
  const name = (filename || "index.htm").trim()
  return allowedHelpPages.has(name) ? name : "index.htm"
}

export function useHelp() {
  const route = useRoute()

  const openHelp = (topic?: string) => {
    const page = normalizeHelpPage(topic)
    return navigateTo({ path: "/help", query: page === "index.htm" ? {} : { p: page } })
  }

  const openContextHelp = () => {
    const topic = helpTopicForRoute(route.path)
    return openHelp(topic)
  }

  return {
    openHelp,
    openContextHelp,
    helpTopicForRoute
  }
}
