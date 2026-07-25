"use strict";

const PLATFORM_ALIASES = {
  win32: "win32",
  windows: "win32",
  win: "win32",
  darwin: "darwin",
  mac: "darwin",
  macos: "darwin",
  osx: "darwin",
  linux: "linux",
};

const ARCH_ALIASES = {
  x64: "x64",
  amd64: "x64",
  x86_64: "x64",
  arm64: "arm64",
  aarch64: "arm64",
  ia32: "ia32",
  x86: "ia32",
  universal: "universal",
};

function normalizePlatform(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return PLATFORM_ALIASES[key] || key || "unknown";
}

function normalizeArch(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return ARCH_ALIASES[key] || key || "unknown";
}

function updateTarget(options = {}) {
  return {
    platform: normalizePlatform(options.platform || process.platform),
    arch: normalizeArch(options.arch || process.arch),
  };
}

function updateMetadataFileName(target = updateTarget()) {
  if (target.platform === "darwin") return "latest-mac.yml";
  if (target.platform === "linux") return "latest-linux.yml";
  return "latest.yml";
}

function defaultUpdateArtifactName(version, target = updateTarget()) {
  const safeVersion = String(version || "").trim() || "latest";
  if (target.platform === "darwin") return `Mineradio-${safeVersion}.dmg`;
  if (target.platform === "linux") return `Mineradio-${safeVersion}.AppImage`;
  if (target.platform === "win32") return `Mineradio-${safeVersion}-Setup.exe`;
  return `Mineradio-${safeVersion}.zip`;
}

function explicitPlatform(name) {
  const value = String(name || "").toLowerCase();
  if (/(?:^|[-_.])(macos|mac|osx|darwin)(?:[-_.]|$)/.test(value))
    return "darwin";
  if (/(?:^|[-_.])(linux)(?:[-_.]|$)/.test(value)) return "linux";
  if (/(?:^|[-_.])(windows|win32|win)(?:[-_.]|$)/.test(value)) return "win32";
  return "";
}

function explicitArch(name) {
  const value = String(name || "").toLowerCase();
  if (/(?:^|[-_.])(arm64|aarch64)(?:[-_.]|$)/.test(value)) return "arm64";
  if (/(?:^|[-_.])(x64|x86_64|amd64)(?:[-_.]|$)/.test(value)) return "x64";
  if (/(?:^|[-_.])(ia32|x86)(?:[-_.]|$)/.test(value)) return "ia32";
  if (/(?:^|[-_.])(universal)(?:[-_.]|$)/.test(value)) return "universal";
  return "";
}

function isUpdateTargetCompatible(name, target = updateTarget()) {
  const platform = explicitPlatform(name);
  if (platform && platform !== target.platform) return false;
  const arch = explicitArch(name);
  return !arch || arch === "universal" || arch === target.arch;
}

function artifactExtensionScore(name, platform) {
  const value = String(name || "").toLowerCase();
  if (/\.(?:yml|yaml|json|blockmap|sha\d*)$/.test(value)) return -Infinity;
  if (/(?:source|sources)[-_. ]?(?:code)?\.(?:zip|tar\.gz)$/.test(value))
    return -Infinity;
  if (platform === "win32") {
    if (/\.exe$/.test(value)) return 90;
    if (/\.msi$/.test(value)) return 80;
    if (/\.(?:zip|7z)$/.test(value)) return 20;
    return -Infinity;
  }
  if (platform === "darwin") {
    if (/\.dmg$/.test(value)) return 90;
    if (/\.pkg$/.test(value)) return 80;
    if (/\.zip$/.test(value)) return 20;
    return -Infinity;
  }
  if (platform === "linux") {
    if (/\.appimage$/.test(value)) return 90;
    if (/\.deb$/.test(value)) return 80;
    if (/\.rpm$/.test(value)) return 70;
    if (/\.(?:pacman|pkg\.tar\.(?:zst|xz|gz))$/.test(value)) return 60;
    if (/\.(?:tar\.gz|zip)$/.test(value)) return 20;
    return -Infinity;
  }
  return /\.(?:zip|7z|tar\.gz)$/.test(value) ? 10 : -Infinity;
}

function updateAssetScore(asset, target = updateTarget()) {
  const name = String(
    (asset && (asset.name || asset.fileName || asset.path || asset.url)) || "",
  );
  const extensionScore = artifactExtensionScore(name, target.platform);
  if (!Number.isFinite(extensionScore)) return -Infinity;

  if (!isUpdateTargetCompatible(name, target)) return -Infinity;
  const platform = explicitPlatform(name);
  const arch = explicitArch(name);

  return (
    extensionScore +
    (platform === target.platform ? 15 : 0) +
    (arch === target.arch ? 20 : arch === "universal" ? 15 : 0)
  );
}

function pickUpdateAsset(assets, target = updateTarget()) {
  return (
    (Array.isArray(assets) ? assets : [])
      .map((asset, index) => ({
        asset,
        index,
        score: updateAssetScore(asset, target),
      }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.asset || null
  );
}

module.exports = {
  normalizePlatform,
  normalizeArch,
  updateTarget,
  updateMetadataFileName,
  defaultUpdateArtifactName,
  isUpdateTargetCompatible,
  updateAssetScore,
  pickUpdateAsset,
};
