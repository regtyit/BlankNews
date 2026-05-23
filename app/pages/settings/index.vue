<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const NewsStore = useNewsFetch()
const Settings = useSettings()

const similarityThreshold = ref(0.6)
const autoRefresh = ref(true)
const refreshMinutes = ref(15)

const clearCache = async () => {
  if (confirm(t("home.clearCacheConfirm"))) {
    await NewsStore.clearAllNews()
    alert("Кэш очищен")
  }
}

const updateThreshold = async (value: number) => {
  const current = await Settings.loadSettings()
  await Settings.saveSettings({
    ...current,
    similarityThreshold: value
  })
}

const saveRefreshPrefs = async () => {
  const current = await Settings.loadSettings()
  const mins = Math.min(180, Math.max(5, refreshMinutes.value))
  refreshMinutes.value = mins
  await Settings.saveSettings({
    ...current,
    autoRefresh: autoRefresh.value,
    refreshInterval: mins * 60 * 1000
  })
}

onMounted(async () => {
  const settings = await Settings.loadSettings()
  similarityThreshold.value = settings.similarityThreshold
  autoRefresh.value = settings.autoRefresh !== false
  refreshMinutes.value = Math.min(180, Math.max(5, Math.round((settings.refreshInterval ?? 900000) / 60000)))
})
</script>

<template>
  <v-container fluid class="pa-4 settings-hub-page">
    <header class="settings-hub-header">
      <v-btn icon variant="text" @click="navigateTo('/')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="settings-hub-heading">
        {{ t("settings.title") }}
      </h1>
    </header>

    <v-row dense class="ma-0">
      <v-col cols="12" class="pa-0 pb-3">
        <v-card class="settings-btn" @click="navigateTo('/settings/sources')">
          <v-icon size="large" color="primary">
            mdi-rss
          </v-icon>
          <span class="title-text">{{ t("settings.sources") }}</span>
        </v-card>
      </v-col>
      <v-col cols="12" class="pa-0 pb-3">
        <v-card class="settings-btn" @click="navigateTo('/settings/filters')">
          <v-icon size="large" color="primary">
            mdi-filter
          </v-icon>
          <span class="title-text">{{ t("settings.filters") }}</span>
        </v-card>
      </v-col>
      <v-col cols="12" class="pa-0 pb-3">
        <v-card class="settings-btn" @click="navigateTo('/settings/locale')">
          <v-icon size="large" color="primary">
            mdi-earth
          </v-icon>
          <span class="title-text">{{ t("settings.locale") }}</span>
        </v-card>
      </v-col>
      <v-col cols="12" class="pa-0">
        <v-card class="settings-btn" @click="clearCache">
          <v-icon size="large" color="error">
            mdi-delete-sweep
          </v-icon>
          <span class="title-text">{{ t("settings.clearCache") }}</span>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="settings-stack">
      <v-card-text class="settings-card-pad">
        <div class="settings-inline-row">
          <span class="card-section-title">{{ t("settings.autoRefresh") }}</span>
          <v-switch
            v-model="autoRefresh"
            hide-details
            inset
            @update:model-value="saveRefreshPrefs"
          />
        </div>
        <p class="hint-text hint-text--after-toggle">
          {{ t("settings.autoRefreshDesc") }}
        </p>
        <v-slider
          v-model="refreshMinutes"
          :min="5"
          :max="180"
          :step="5"
          :label="t('settings.refreshInterval')"
          density="compact"
          hide-details
          thumb-label="always"
          class="slider-flush-top"
          @update:model-value="saveRefreshPrefs"
        />
      </v-card-text>
    </v-card>

    <v-card class="settings-stack">
      <v-card-title class="settings-card-head">
        {{ t("settings.grouping") }}
      </v-card-title>
      <v-card-text>
        <v-slider
          v-model="similarityThreshold"
          :min="0.3"
          :max="0.9"
          :step="0.05"
          :label="t('settings.similarityThreshold')"
          density="compact"
          thumb-label="always"
          @update:model-value="updateThreshold"
        />
        <p class="hint-text">
          {{ t("settings.similarityDesc", { value: Math.round(similarityThreshold * 100) }) }}
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>
