export function helpTopicForRoute(pathname: string): string {
  const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname

  const map: Record<string, string> = {
    "/": "index.htm",
    "/settings": "settings.htm",
    "/settings/sources": "sources.htm",
    "/settings/filters": "filters.htm",
    "/settings/locale": "locale.htm"
  }

  if (map[path]) return map[path]

  const prefix = Object.keys(map)
    .filter((k) => k !== "/" && path.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0]
  if (prefix) {
    return map[prefix] || ""
  }

  return map["/"] || ""
}
