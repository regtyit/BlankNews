import { defineEventHandler, getQuery, HTTPError } from "h3"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url || !url.startsWith("http")) {
    throw new HTTPError({ statusCode: 400, statusMessage: "Invalid URL" })
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8",
        "Cache-Control": "no-cache"
      },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new HTTPError({
        statusCode: response.status,
        statusMessage: `Failed to fetch: ${response.statusText}`
      })
    }

    const xmlText = await response.text()

    event.res.headers.set("Content-Type", "application/xml; charset=utf-8")
    event.res.headers.set("Access-Control-Allow-Origin", "*")

    return xmlText
  } catch (error: any) {
    throw new HTTPError({ statusCode: 500, statusMessage: error.message || "Error in rss get proxy" })
  }
})
