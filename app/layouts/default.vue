<script setup lang="ts">
import { useEventListener } from "@vueuse/core"
import Navbar from "~/components/Site/Navbar.vue"
import { triggerNewsNavbarRefresh } from "~/composables/useNewsFetch"

const onNavbarRefresh = () => triggerNewsNavbarRefresh()

const { openContextHelp } = useHelp()
useEventListener(
  document,
  "keydown",
  (e: KeyboardEvent) => {
    if (e.key !== "F1" && e.code !== "Help") return
    e.preventDefault()
    void openContextHelp()
  },
  { capture: true }
)
</script>

<template>
  <v-app>
    <Navbar @refresh="onNavbarRefresh" />
    <v-main class="app-main pb-0">
      <NuxtPage />
    </v-main>
  </v-app>
</template>
