# Blank News

RSS news reader with grouping, filters, and local cache. Built with [Nuxt 4](https://nuxt.com) and [Tauri 2](https://v2.tauri.app) (desktop and mobile).

## Features

Multiple RSS sources (up to 500 items per feed per fetch), merged into one timeline (store capped at 500000

 newest items)

- Clustering of similar headlines within a time window
- Keyword filters and i18n (Russian / English UI strings)
- Local storage of news
- Opens articles in the browser

## Stack

- Nuxt 4 (SSR off, SPA for Tauri)
- Vue 3, Vuetify 3, vue-i18n
- Tauri 2
- TypeScript, ESLint, Bun

## Prerequisites

- [Bun](https://bun.sh) (enforced via `package.json`)
- [Rust and Tauri prerequisites](https://tauri.app/start/prerequisites/) for native builds
- For Android / iOS: follow [Tauri mobile setup](https://tauri.app/develop/#developing-your-mobile-application)

## Development

```sh
bun install
bun run tauri:dev
```

Nuxt dev server defaults to port `3000`; HMR is configured on `3001` in `nuxt.config.ts`. Adjust in `nuxt.config.ts` and `src-tauri/tauri.conf.json` if needed.

```sh
bun run dev
```

Runs the web frontend only (no Tauri window).

## Build

Bundle targets are **AppImage, .deb, and .rpm** (Linux), **EXE** (Windows), and **APK** (Android via a separate command).

```sh
bun run generate
```

**Linux**:

```sh
bun run tauri:build:linux.
```

AppImage may need a fix for linuxdeploy GTK plugin

```sh
sudo mkdir -p /usr/lib/gdk-pixbuf-2.0/2.10.0
sudo gdk-pixbuf-query-loaders --update-cache
```

**Windows (executable)**:

```sh
bun tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
```

**Android**:

```sh
bun run tauri:dev:android

#if dont work
bun run tauri:build:android:apk
```

**iOS**:

Currently need computer from Apple to build app.

## Project layout

- `app/` — Nuxt app (pages, components, composables, plugins)
- `src-tauri/` — Rust crate, Tauri config, capabilities (`src-tauri/capabilities/main.json`)

## Credits

This project started from **[Nuxtor](https://github.com/NicolaSpadari/nuxtor)** by [Nicola Spadari](https://github.com/NicolaSpadari): a Nuxt 4 + Tauri 2 template. Blank News reuses that integration pattern and tooling choices. Full upstream license: [Nuxtor LICENSE](https://github.com/NicolaSpadari/nuxtor/blob/main/LICENSE).

## License

This repository is licensed under the **MIT License** — see `[LICENSE](./LICENSE)`. Third-party libraries keep their own licenses. Nuxtor-derived portions are acknowledged in `LICENSE` and are MIT-licensed at the source.
