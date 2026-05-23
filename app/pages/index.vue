<script setup lang="ts">
import type { NewsCluster, NewsItem } from "~/types"
import { useI18n } from "vue-i18n"
import Card from "~/components/Site/Rss/Card.vue"
import ClusterCard from "~/components/Site/Rss/ClusterCard.vue"
import { setNewsNavbarRefresh, useNewsFetch } from "~/composables/useNewsFetch"
import { useSettings } from "~/composables/useSettings"

const { locale } = useI18n()

const NewsStore = useNewsFetch()
const Settings = useSettings()
const news = ref<(NewsCluster | NewsItem)[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const fromCache = ref(false)

const hasNews = computed(() => news.value.length > 0)
const isLoading = computed(() => loading.value)
const hasError = computed(() => error.value !== null)

let pollTimer: ReturnType<typeof setInterval> | null = null

const fetchRssFeed = async (forceRefresh: boolean = false) => {
  try {
    loading.value = true
    error.value = null
    const response: any = await NewsStore.getNewsRss(forceRefresh)
    if (response.success && response.news) {
      news.value = response.news
    } else {
      throw new Error("Данные не получены")
    }
  } catch (err: any) {
    console.error("Error:", err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  fetchRssFeed(true)
}

onMounted(async () => {
  setNewsNavbarRefresh(() => fetchRssFeed(true))
  await fetchRssFeed()
  const saved = localStorage.getItem("preferred-language") || "ru"
  locale.value = saved
  const s = await Settings.loadSettings()
  if (s.autoRefresh !== false) {
    const ms = s.refreshInterval ?? 900000
    pollTimer = setInterval(() => fetchRssFeed(false), ms)
  }
})

onUnmounted(() => {
  setNewsNavbarRefresh(null)
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<template>
  <v-container fluid class="pa-0">
    <div class="content-wrapper--home">
      <v-row v-if="isLoading" justify="center">
        <v-col cols="12" class="page-align-center">
          <v-progress-circular indeterminate size="64" color="primary" class="loading-progress-gap" />
          <p class="muted-text">
            Загрузка новостей...
          </p>
        </v-col>
      </v-row>

      <v-alert v-if="hasError" :type="fromCache ? 'warning' : 'error'" variant="tonal" class="stack-block" closable>
        <div class="home-alert-row">
          <span>{{ error }}</span>
          <v-btn color="primary" variant="text" @click="refresh">
            Повторить попытку
          </v-btn>
        </div>
      </v-alert>

      <v-row v-if="!isLoading && news.length > 0" dense>
        <v-col v-for="card in news" :key="card.id" cols="12" sm="6" md="4">
          <ClusterCard v-if="card.type == 'Cluster'" :cluster="card" />
          <Card v-else :item="card" />
        </v-col>
      </v-row>

      <v-row v-if="!isLoading && !hasNews && !hasError" justify="center">
        <v-col cols="12" class="empty-state">
          <v-icon size="large" color="grey-lighten-1" class="empty-state__icon">
            mdi-newspaper-variant-off
          </v-icon>
          <span class="empty-state__title">Новости не найдены</span>
          <p class="empty-state__hint">
            Попробуйте обновить страницу позже
          </p>
          <v-btn color="primary" variant="outlined" @click="refresh">
            Обновить
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
