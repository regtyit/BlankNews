<script setup lang="ts">
import { useI18n } from "vue-i18n"

const emit = defineEmits(["refresh"])

const { t } = useI18n()

const drawer = ref<boolean>(false)
const loading = ref(false)

const routes = [
  { title: "nav.home", icon: "mdi-home", to: "/" },
  { title: "nav.settings", icon: "mdi-cog-outline", to: "/settings" },
  { title: "nav.localization", icon: "mdi-earth", to: "/settings/locale" }
]

const refresh = () => emit("refresh")

const { openHelp } = useHelp()
const openHelpMain = () => {
  void openHelp()
}
</script>

<template>
  <v-app-bar density="compact" elevation="2" class="app-navbar-fixed">
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-app-bar-title>Blank News</v-app-bar-title>

    <v-spacer />

    <v-btn icon :title="t('help.tooltip')" @click="openHelpMain">
      <v-icon>mdi-help-circle-outline</v-icon>
    </v-btn>

    <v-btn icon :loading="loading" @click="refresh">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary class="nav-drawer-fixed">
    <v-list>
      <v-list-item
        v-for="route in routes" :key="route.to" :prepend-icon="route.icon" :title="t(route.title)"
        @click="navigateTo(route.to)"
      />
    </v-list>
  </v-navigation-drawer>
</template>
