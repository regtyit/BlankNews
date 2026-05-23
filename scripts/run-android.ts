import { spawnSync } from "node:child_process"
import { resolveAndroidEnv } from "./android-env"

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("Usage: run-android.ts <tauri android args...>")
  console.error("Example: run-android.ts build --apk")
  process.exit(1)
}

const env = resolveAndroidEnv()
console.log(`ANDROID_HOME=${env.ANDROID_HOME}`)
console.log(`NDK_HOME=${env.NDK_HOME}`)

const result = spawnSync("bun", ["run", "tauri", "android", ...args], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: { ...process.env, ...env }
})

process.exit(result.status ?? 1)
