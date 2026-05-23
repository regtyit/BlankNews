import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

export function resolveAndroidEnv(): Record<string, string> {
  const home = process.env.HOME || ""
  const sdk = process.env.ANDROID_HOME || join(home, "Android", "Sdk")

  if (!existsSync(sdk)) {
    throw new Error(`Android SDK not found at ${sdk}. Set ANDROID_HOME or install the SDK.`)
  }

  const ndkRoot = join(sdk, "ndk")

  const isValidNdk = (path: string) =>
    existsSync(join(path, "source.properties"))

  let ndkHome = process.env.NDK_HOME || ""

  if (!ndkHome || !isValidNdk(ndkHome)) {
    if (!existsSync(ndkRoot)) {
      throw new Error(
        `NDK not found under ${ndkRoot}. Run: bun run tauri android build\n`
        + "and accept the prompt to install the NDK, or install via Android Studio SDK Manager."
      )
    }
    const versions = readdirSync(ndkRoot)
      .filter((name) => isValidNdk(join(ndkRoot, name)))
      .sort()
    const latest = versions.at(-1)
    if (!latest) {
      throw new Error(`No NDK version directory in ${ndkRoot}`)
    }
    ndkHome = join(ndkRoot, latest)
  }

  const javaHome = process.env.JAVA_HOME
    || (existsSync("/usr/lib/jvm/java-17-openjdk") ? "/usr/lib/jvm/java-17-openjdk" : "")

  const pathParts = [
    process.env.PATH,
    join(sdk, "platform-tools"),
    join(sdk, "cmdline-tools", "latest", "bin"),
    join(sdk, "cmdline-tools", "bin")
  ].filter(Boolean)

  return {
    ANDROID_HOME: sdk,
    NDK_HOME: ndkHome,
    ...(javaHome ? { JAVA_HOME: javaHome } : {}),
    PATH: pathParts.join(":")
  }
}
