<script setup lang="ts">
import type { Source } from "~/types"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const Settings = useSettings()

const newSource = ref("")
const sources = ref<(string | Source)[]>([])

const addSource = async () => {
  if (newSource.value.trim()) {
    await Settings.addSource(newSource.value.trim())
    await loadSettings()
    newSource.value = ""
  }
}

const removeSource = async (url: string) => {
  await Settings.removeSource(url)
  await loadSettings()
}

const loadSettings = async () => {
  const settings = await Settings.loadSettings()
  sources.value = settings.sources
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <v-container fluid class="pa-4">
    <h1 class="main-text">
      {{ t("sources.title") }}
    </h1>

    <v-card class="stack-block">
      <v-card-title>{{ t("sources.addRss") }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newSource" :label="t('sources.addRssDesc')" placeholder="https://example.com/rss"
          @keyup.enter="addSource"
        >
          <template #append>
            <v-btn icon :disabled="!newSource" @click="addSource">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>{{ t("sources.activeRss") }} ({{ sources.length }})</v-card-title>
      <v-list>
        <v-list-item
          v-for="(source, index) in sources" :key="index"
          :title="typeof source === 'string' ? source : source.url || 'Unknown'"
        >
          <template #append>
            <v-btn
              icon color="error" size="small" @click="
                removeSource(typeof source === 'string' ? source : source.url || '')
              "
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="sources.length === 0">
          <v-list-item-title class="note-text">
            {{ t("sources.noSource") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>
