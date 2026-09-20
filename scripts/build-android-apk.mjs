import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const clientDirectory = path.join(projectRoot, "server", "client");
const androidDirectory = path.join(clientDirectory, "android");
const isWindows = process.platform === "win32";
const isRelease = process.argv.includes("--release");
const buildType = isRelease ? "release" : "debug";
const gradleTask = isRelease ? "assembleRelease" : "assembleDebug";

const fail = (message) => {
  console.error(`\nErreur : ${message}`);
  process.exit(1);
};

const run = (command, args, options = {}) => {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });

  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(`la commande s'est arrêtée avec le code ${result.status}.`);
};

const inspectJava = (executable) => {
  const result = spawnSync(executable, ["-version"], {
    encoding: "utf8",
    shell: false,
  });
  if (result.error || result.status !== 0) return null;
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const version = output.match(/version\s+"(?:1\.)?(\d+)/)?.[1];
  return version ? { executable, major: Number(version), output: output.trim() } : null;
};

const findJava = async () => {
  const candidates = [];
  if (process.env.JAVA_HOME) {
    candidates.push(path.join(process.env.JAVA_HOME, "bin", isWindows ? "java.exe" : "java"));
  }
  candidates.push(isWindows ? "java.exe" : "java");

  if (isWindows) {
    const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
    candidates.push(path.join(programFiles, "Android", "Android Studio", "jbr", "bin", "java.exe"));

    const javaRoots = [
      path.join(programFiles, "Microsoft"),
      path.join(programFiles, "Eclipse Adoptium"),
      path.join(programFiles, "Java"),
    ];
    for (const javaRoot of javaRoots) {
      if (!existsSync(javaRoot)) continue;
      for (const directory of await readdir(javaRoot)) {
        candidates.push(path.join(javaRoot, directory, "bin", "java.exe"));
      }
    }
  }

  for (const candidate of [...new Set(candidates)]) {
    const java = inspectJava(candidate);
    if (java?.major >= 21) return java;
  }
  return null;
};

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 24) {
  fail(`Node.js 24 ou plus récent est requis (version actuelle : ${process.version}). Consulte la section Android du README.`);
}

const java = await findJava();
if (!java) {
  fail("JDK 21 ou plus récent introuvable. Mets Android Studio à jour ou configure JAVA_HOME vers un JDK 21.");
}

const javaHome = path.dirname(path.dirname(path.resolve(java.executable)));
process.env.JAVA_HOME = javaHome;
process.env.Path = `${path.join(javaHome, "bin")}${path.delimiter}${process.env.Path ?? ""}`;

const androidSdk = process.env.ANDROID_SDK_ROOT
  || process.env.ANDROID_HOME
  || (isWindows && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Android", "Sdk") : "");
if (!androidSdk || !existsSync(path.join(androidSdk, "platforms", "android-36"))) {
  fail("le SDK Android 36 est introuvable. Installe Android SDK Platform 36 depuis Android Studio > SDK Manager.");
}
process.env.ANDROID_SDK_ROOT = androidSdk;

if (isRelease && !existsSync(path.join(androidDirectory, "keystore.properties"))) {
  fail("android/keystore.properties est requis pour signer une release. Utilise `npm run android:apk` pour un APK de test.");
}

const productionEnvPath = path.join(clientDirectory, ".env.production");
const productionEnv = existsSync(productionEnvPath) ? await readFile(productionEnvPath, "utf8") : "";
if (!/^VITE_API_BASE_URL=\S+/m.test(productionEnv) && !process.env.VITE_API_BASE_URL) {
  console.warn("\nAttention : VITE_API_BASE_URL n'est pas configurée. L'application installée ne pourra probablement pas joindre l'API.");
}

console.log(`\nConstruction de l'APK ${buildType} avec Java ${java.major} et le SDK ${androidSdk}.`);
run(isWindows ? "npm.cmd" : "npm", ["run", "build"], { cwd: clientDirectory });
run(isWindows ? "npm.cmd" : "npm", ["exec", "--", "cap", "sync", "android"], { cwd: clientDirectory });
run(isWindows ? "gradlew.bat" : "./gradlew", [gradleTask], { cwd: androidDirectory });

const generatedApk = path.join(androidDirectory, "app", "build", "outputs", "apk", buildType, `app-${buildType}.apk`);
if (!existsSync(generatedApk)) {
  fail(`Gradle a terminé, mais l'APK attendu est introuvable : ${generatedApk}`);
}

const outputDirectory = path.join(projectRoot, "build", "android");
const outputApk = path.join(outputDirectory, `DavinHub-${buildType}.apk`);
await mkdir(outputDirectory, { recursive: true });
await copyFile(generatedApk, outputApk);

console.log(`\nAPK prêt : ${outputApk}`);
if (!isRelease) {
  console.log("Tu peux copier ce fichier sur ton téléphone et l'ouvrir pour l'installer.");
}
