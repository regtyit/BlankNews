<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const { t, locale } = useI18n()
const Settings = useSettings()

const currentLocale = ref("ru")

const setLocale = async (lang: string) => {
  locale.value = lang
  currentLocale.value = lang
  await Settings.setLanguage(lang)
}

onMounted(() => {
  const saved = localStorage.getItem("preferred-language") || "ru"
  currentLocale.value = saved
  locale.value = saved
})
</script>

<template>
  <v-container fluid class="pa-4">
    <h1 class="main-text">
      {{ t("settings.locale") }}
    </h1>

    <v-card>
      <v-card-title>{{ t("settings.locale") }}</v-card-title>
      <v-card-text class="d-flex gap-4 flex-wrap">
        <v-btn variant="outlined" :color="currentLocale === 'ru' ? 'primary' : undefined" @click="setLocale('ru')">
          <v-icon start>
            mdi-flag
          </v-icon>
          Русский
        </v-btn>
        <v-btn variant="outlined" :color="currentLocale === 'en' ? 'primary' : undefined" @click="setLocale('en')">
          <v-icon start>
            mdi-flag
          </v-icon>
          English
        </v-btn>
        <v-btn variant="outlined" :color="currentLocale === 'zh' ? 'primary' : undefined" @click="setLocale('zh')">
          <v-icon start>
            mdi-flag
          </v-icon>
          中国人
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>
