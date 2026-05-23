import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineNuxtConfig({
  modules: [
    "@vueuse/nuxt",
    "@nuxt/eslint"
  ],

  imports: {
    autoImport: true
  },

  build: {
    transpile: ["vuetify", "vue-i18n"]
  },

  app: {
    head: {
      title: "Blank News",
      charset: "utf-8",
      meta: [
        { name: "format-detection", content: "no" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" }
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/logo.png" },
        { rel: "apple-touch-icon", href: "/logo.png" }
      ]
    },
    pageTransition: {
      name: "page",
      mode: "out-in"
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in"
    }
  },

  css: ["~/assets/css/main.scss"],

  ssr: false,

  dir: {
    modules: "app/modules"
  },

  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: "0.0.0.0",
        port: 3001
      },
      watch: {
        ignored: ["/src-tauri/"]
      }
    },
    plugins: [
      vuetify({ autoImport: true })
    ],
    vue: {
      template: {
        transformAssetUrls
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"]
        }
      }
    }
  },

  devServer: {
    host: "0.0.0.0"
  },

  router: {
    options: {
      scrollBehaviorType: "smooth"
    }
  },

  eslint: {
    config: {
      standalone: false
    }
  },

  devtools: {
    enabled: false
  },

  experimental: {
    typedPages: true
  },

  runtimeConfig: {
    public: {
      i18n: {
        defaultLocale: "ru",
        locales: ["ru", "en"]
      }
    }
  },

  compatibilityDate: "2025-09-01"
})
