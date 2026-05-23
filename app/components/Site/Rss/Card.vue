<script setup lang="ts">
import type { NewsItem } from "~/types"
import { openExternalLink } from "~/composables/openExternalLink"

const props = defineProps<{ item: NewsItem }>()

const openArticle = () => openExternalLink(props.item.link)
const formatDate = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return ""
  }
}
</script>

<template>
  <v-card class="rss-card" hover rounded="lg" @click="openArticle">
    <div>
      <div v-if="item.enclosureUrl" class="image-container">
        <v-img :src="item.enclosureUrl" alt="~/assets/tmp.png" height="200" cover />
      </div>
      <div v-else class="image-container">
        <v-img src="~/assets/tmp.png" height="200" cover />
      </div>

      <div class="pa-4">
        <span class="title-text">{{ item.title }}</span>

        <div v-if="item.description" class="description-text">
          {{ item.description }}
        </div>
      </div>
    </div>
    <v-card-subtitle class="note-text d-flex justify-space-between">
      <div>
        <v-icon size="small" class="">
          mdi-calendar
        </v-icon>
        {{ formatDate(item.dateTimestamp) }}
      </div>
      <v-chip v-if="item.category" color="primary" size="small" variant="tonal" class="feed-card-chip">
        {{ item.category }}
      </v-chip>
    </v-card-subtitle>
  </v-card>
</template>
