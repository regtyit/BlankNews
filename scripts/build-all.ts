import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { resolveAndroidEnv } from "./android-env"

const root = process.cwd()
const isLinux = process.platform === "linux"
const isWindows = process.platform === "win32"

function run(label: string, command: string, args: string[], env: Record<string, string> = {}) {
  console.log(`\n=== ${label} ===\n`)
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env }
  })
  if (result.status !== 0) {
    console.error(`\n[build-all] ${label} failed (exit ${result.status ?? 1})\n`)
    return false
  }
  return true
}

function gdkPixbufReady(): boolean {
  const loaders = "/usr/lib/gdk-pixbuf-2.0/2.10.0/loaders.cache"
  if (existsSync(loaders)) return true
  console.warn(
    "[build-all] AppImage needs GDK Pixbuf cache. On Arch/Artix run:\n"
    + "  sudo mkdir -p /usr/lib/gdk-pixbuf-2.0/2.10.0\n"
    + "  sudo gdk-pixbuf-query-loaders --update-cache\n"
  )
  return false
}

function androidEnv(): Record<string, string> | null {
  try {
    return resolveAndroidEnv()
  } catch (error) {
    console.warn(`[build-all] Android: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

let failed = 0

if (isLinux) {
  if (!run("Linux (.deb + .rpm)", "bun", ["run", "tauri", "build", "--bundles", "deb,rpm"])) {
    failed++
  }
  if (gdkPixbufReady()) {
    if (!run("Linux (AppImage)", "bun", ["run", "tauri", "build", "--bundles", "appimage"], { NO_STRIP: "1" })) {
      failed++
    }
  } else {
    failed++
  }
} else if (isWindows) {
  if (!run("Windows (NSIS + MSI)", "bun", ["run", "tauri", "build", "--bundles", "nsis,msi"])) {
    failed++
  }
} else {
  console.warn("[build-all] Desktop bundles: run on Linux or Windows.")
  failed++
}

const android = androidEnv()
if (android) {
  if (!run("Android", "bun", ["run", "tauri:build:android"], {})) {
    failed++
  }
} else {
  console.warn("[build-all] Android skipped.")
}

if (isLinux) {
  console.warn("[build-all] Windows installers require a Windows host (or CI). Skipped on Linux.")
}

const bundleRoot = join(root, "src-tauri/target/release/bundle")
console.log(`\nArtifacts (when successful): ${bundleRoot}\n`)

process.exit(failed > 0 ? 1 : 0)
