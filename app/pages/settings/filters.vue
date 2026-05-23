<script setup lang="ts">
import type { Filter } from "~/types/index"
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useSettings } from "~/composables/useSettings"

const { t } = useI18n()

const Settings = useSettings()

const newFilterName = ref("")
const newFilterKeywords = ref<string[]>([])
const newFilterIsBad = ref(true)
const newFilterThreshold = ref(0.5)
const filters = ref<Record<string, Filter>>({})

const canAddFilter = computed(() => {
  return newFilterName.value.trim() && newFilterKeywords.value.length > 0
})

const addFilter = async () => {
  if (canAddFilter.value) {
    await Settings.addFilter(
      newFilterName.value.trim(),
      newFilterKeywords.value,
      newFilterIsBad.value,
      newFilterThreshold.value
    )

    await loadFilters()

    newFilterName.value = ""
    newFilterKeywords.value = []
    newFilterIsBad.value = true
    newFilterThreshold.value = 0.5
  }
}

const removeFilter = async (name: string) => {
  await Settings.removeFilter(name)
  await loadFilters()
}

const loadFilters = async () => {
  const settings = await Settings.loadSettings()
  filters.value = settings.filters
}

onMounted(() => {
  loadFilters()
})
</script>

<template>
  <v-container fluid class="pa-4">
    <h1 class="main-text">
      {{ t("filters.title") }}
    </h1>

    <v-card class="stack-block">
      <v-card-title>{{ t("filters.addFilter") }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="newFilterName" :label="t('filters.addFilterNameDesc')" class="form-field-gap" />

        <v-combobox
          v-model="newFilterKeywords" :items="[]" :label="t('filters.addFilterWords')" multiple chips
          :placeholder="t('filters.addFilterWordsDesc')" class="form-field-gap filter-form-combo"
        />

        <v-switch
          v-model="newFilterIsBad" :label="t('filters.addFilterMode')" class="form-field-gap"
          :hint="t('filters.addFilterModeDesc')"
        />

        <v-slider
          v-model="newFilterThreshold" :min="0" :max="1" :step="0.1" :label="t('filters.addFilterLimiter')"
          thumb-label class="form-field-gap" :hint="t('filters.addFilterLimiterDesc')"
        />
        <v-btn color="primary" :disabled="!canAddFilter" @click="addFilter">
          {{ t('filters.addFilterBtn') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>{{ t("filters.activeFilter") }} ({{ Object.keys(filters).length }})</v-card-title>
      <v-list>
        <v-list-item v-for="(filter, name) in filters" :key="name" class="filter-list-row" :title="name">
          <template #subtitle>
            <div class="filter-keywords-block">
              <v-chip
                v-for="keyword in filter.keywords" :key="keyword"
                class="filter-keyword-chip"
                variant="tonal"
              >
                {{ keyword }}
              </v-chip>
            </div>
            <div class="filter-meta-line">
              <span
                :class="filter.filterOut ? 'filter-mode-label--block' : 'filter-mode-label--classify'"
              >
                {{ filter.filterOut ? t("filters.activeFilterBlock") : t("filters.activeFilterClassify") }}
              </span>
              {{ t("filters.activeFilterLimiter") }} {{ (filter.threshold * 100).toFixed(0) }}%
            </div>
          </template>
          <template #append>
            <v-btn icon color="error" size="small" @click="removeFilter(name)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="Object.keys(filters).length === 0">
          <v-list-item-title class="note-text">
            {{ t("filters.noFilter") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>
