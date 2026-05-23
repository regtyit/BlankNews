<script setup lang="ts">
import type { NewsCluster } from "~/types"
import { openExternalLink } from "~/composables/openExternalLink"

const props = defineProps<{ cluster: NewsCluster }>()
const dialogOpen = ref(false)

const expandCluster = () => {
  if (props.cluster.sourceCount > 1) {
    dialogOpen.value = true
  } else {
    openArticle(props.cluster.mainItem)
  }
}

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

const openArticle = (item: { link: string }) => openExternalLink(item.link)
</script>

<template>
  <v-card class="cluster-card" hover rounded="lg" @click="expandCluster">
    <div>
      <div v-if="cluster.mainItem.enclosureUrl" class="image-container">
        <v-img :src="cluster.mainItem.enclosureUrl" :alt="cluster.mainItem.title" height="200" cover />
      </div>
      <div v-else class="image-container">
        <v-img src="~/assets/tmp.png" height="200" cover />
      </div>

      <div class="pa-4">
        <span class="title-text">{{ cluster.mainItem.title }}</span>

        <div v-if="cluster.mainItem.description" class="description-text">
          {{ cluster.mainItem.description }}
        </div>
      </div>
    </div>
    <v-card-subtitle class="note-text d-flex justify-space-between align-center">
      <div>
        <v-icon size="small" class="icon-leading">
          mdi-calendar
        </v-icon>
        {{ formatDate(cluster.dateTimestamp) }}
      </div>
      <v-chip v-if="cluster.sourceCount > 1" color="secondary" size="x-small" variant="tonal">
        <v-icon size="x-small" start>
          mdi-eye
        </v-icon>
        {{ cluster.sourceCount }}
      </v-chip>
      <v-chip v-if="cluster.mainItem.category" color="primary" size="small" variant="tonal">
        {{ cluster.mainItem.category }}
      </v-chip>
    </v-card-subtitle>
  </v-card>

  <v-dialog v-model="dialogOpen" max-width="800" scrollable>
    <v-card>
      <div class="d-flex justify-space-between align-center pa-4">
        <span class="title-text">{{ cluster.mainItem.title }}</span>
        <v-btn icon variant="text" @click="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-card-text>
        <v-list>
          <v-list-subheader>Похожие новости ({{ cluster.sourceCount }})</v-list-subheader>
          <v-list-item
            :title="cluster.mainItem.title"
            :subtitle="`${cluster.mainItem.source}  ${formatDate(cluster.mainItem.dateTimestamp)}`"
            class="list-stack-gap" rounded="lg" color="primary" @click="openArticle(cluster.mainItem)"
          >
            <template #prepend>
              <v-avatar color="primary" size="40">
                <v-icon color="white">
                  mdi-star
                </v-icon>
              </v-avatar>
            </template>
            <template #append>
              <v-chip size="small" color="primary" variant="tonal">
                Основной
              </v-chip>
            </template>
          </v-list-item>
          <v-divider class="my-4" />
          <v-list-item
            v-for="item in cluster.similarItems" :key="item.id" :title="item.title"
            :subtitle="`${item.source}  ${formatDate(item.dateTimestamp)}`" class="list-stack-gap" rounded="lg"
            @click="openArticle(item)"
          >
            <template #prepend>
              <v-avatar color="note-text" size="40">
                <v-icon>mdi-newspaper</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
