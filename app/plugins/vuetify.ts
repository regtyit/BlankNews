import { createVuetify } from "vuetify"

import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    display: {
      mobileBreakpoint: "md",
      thresholds: {
        xs: 0,
        sm: 340,
        md: 600,
        lg: 800,
        xl: 1280
      }
    }
  })
  app.vueApp.use(vuetify)
})
