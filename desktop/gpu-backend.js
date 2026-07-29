"use strict";

const fs = require("fs");
const path = require("path");

const GPU_BACKEND_STATE_VERSION = 1;
const VULKAN_RETRY_MS = 7 * 24 * 60 * 60 * 1000;
const VALID_BACKENDS = new Set(["automatic", "vulkan", "d3d11", "gl"]);

function normalizeGpuBackend(value) {
  const backend = String(value || "")
    .trim()
    .toLowerCase();
  if (backend === "auto" || backend === "default") return "automatic";
  if (backend === "opengl") return "gl";
  return VALID_BACKENDS.has(backend) ? backend : "";
}

function preferredGpuBackend(platform) {
  return platform === "win32" || platform === "linux" ? "vulkan" : "automatic";
}

function fallbackGpuBackend(platform) {
  if (platform === "win32") return "d3d11";
  if (platform === "linux") return "gl";
  return "automatic";
}

function gpuBackendRuntimeKey(options = {}) {
  return [
    options.appVersion || "unknown-app",
    options.electronVersion || "unknown-electron",
    options.platform || process.platform,
    options.arch || process.arch,
  ].join(":");
}

function readGpuBackendState(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    return value && value.version === GPU_BACKEND_STATE_VERSION ? value : {};
  } catch (_) {
    return {};
  }
}

function writeGpuBackendState(file, value) {
  try {
    const state = {
      version: GPU_BACKEND_STATE_VERSION,
      ...value,
    };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tempFile = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(tempFile, file);
    return true;
  } catch (_) {
    return false;
  }
}

function selectGpuBackend(options = {}) {
  const platform = options.platform || process.platform;
  const preferred = preferredGpuBackend(platform);
  const fallback = fallbackGpuBackend(platform);
  const env = options.env || process.env;
  const override = normalizeGpuBackend(env.MINERADIO_GPU_BACKEND);
  const relaunchBackend = normalizeGpuBackend(
    env.MINERADIO_GPU_BACKEND_RELAUNCH,
  );

  if (relaunchBackend) {
    return {
      backend: relaunchBackend,
      preferred,
      fallback,
      source: "fallback-relaunch",
      canFallback: false,
    };
  }
  if (override) {
    return {
      backend: override,
      preferred,
      fallback,
      source: "environment",
      canFallback: override === "vulkan" && fallback !== "automatic",
    };
  }
  if (preferred === "automatic") {
    return {
      backend: "automatic",
      preferred,
      fallback,
      source: "platform-default",
      canFallback: false,
    };
  }

  const state = options.state || {};
  const runtimeKey = options.runtimeKey || "";
  const failedAt = Number(state.vulkanFailedAt) || 0;
  const now = Number(options.now) || Date.now();
  const retryMs = Math.max(0, Number(options.retryMs) || VULKAN_RETRY_MS);
  if (
    state.runtimeKey === runtimeKey &&
    failedAt > 0 &&
    now - failedAt < retryMs
  ) {
    return {
      backend: fallback,
      preferred,
      fallback,
      source: "cached-vulkan-failure",
      canFallback: false,
    };
  }
  return {
    backend: preferred,
    preferred,
    fallback,
    source: failedAt ? "vulkan-retry" : "platform-preferred",
    canFallback: fallback !== "automatic",
  };
}

function gpuBackendSwitches(backend) {
  const normalized = normalizeGpuBackend(backend) || "automatic";
  if (normalized === "automatic") return [];
  if (normalized === "vulkan") return [["use-angle", "vulkan"]];
  return [["use-angle", normalized]];
}

function gpuInfoReportsVulkan(info) {
  const aux = (info && info.auxAttributes) || {};
  const implementation = String(aux.glImplementationParts || "").toLowerCase();
  const renderer = String(aux.glRenderer || "").toLowerCase();
  if (/angle\s*=\s*vulkan/.test(implementation)) return true;
  if (
    /angle\s*=\s*(?:gl|opengl|d3d|metal|swiftshader|none)/.test(implementation)
  )
    return false;
  if (aux.hardwareSupportsVulkan === false) return false;
  return renderer.includes("vulkan") && !renderer.includes("swiftshader");
}

module.exports = {
  GPU_BACKEND_STATE_VERSION,
  VULKAN_RETRY_MS,
  normalizeGpuBackend,
  preferredGpuBackend,
  fallbackGpuBackend,
  gpuBackendRuntimeKey,
  readGpuBackendState,
  writeGpuBackendState,
  selectGpuBackend,
  gpuBackendSwitches,
  gpuInfoReportsVulkan,
};
