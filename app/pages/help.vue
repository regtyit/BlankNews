<script setup lang="ts">
import { useI18n } from "vue-i18n"

const route = useRoute()
const { t } = useI18n()

const pageFile = computed(() => {
  const q = route.query.p
  const raw = Array.isArray(q) ? q[0] : q
  return normalizeHelpPage(typeof raw === "string" ? raw : undefined)
})

const iframeSrc = computed(() => `/help/${pageFile.value}`)

useHead({
  title: () => `${t("help.pageTitle")} — Blank News`
})
</script>

<template>
  <v-container fluid class="help-page pa-0">
    <div class="help-toolbar page-subtoolbar pa-2 d-flex align-center ga-2">
      <v-btn icon variant="text" @click="navigateTo('/')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-subtitle-1">{{ t("help.pageTitle") }}</span>
    </div>
    <iframe
      :key="iframeSrc"
      class="help-iframe"
      :title="t('help.pageTitle')"
      :src="iframeSrc"
    />
  </v-container>
</template>

<style scoped>
.help-page {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--app-content-offset-top));
  min-height: 0;
}
.help-iframe {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  border: 0;
  background: rgb(var(--v-theme-surface));
}
</style>
