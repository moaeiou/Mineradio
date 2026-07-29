"use strict";

const assert = require("assert");
const {
  fallbackGpuBackend,
  gpuInfoReportsVulkan,
  gpuBackendSwitches,
  selectGpuBackend,
} = require("../desktop/gpu-backend");

const runtimeKey = "2026.2.6:43.2.0:test:x64";

for (const platform of ["win32", "linux"]) {
  const selected = selectGpuBackend({
    platform,
    runtimeKey,
    state: {},
    now: 10,
  });
  assert.strictEqual(selected.backend, "vulkan");
  assert.strictEqual(selected.canFallback, true);
}

assert.strictEqual(fallbackGpuBackend("win32"), "d3d11");
assert.strictEqual(fallbackGpuBackend("linux"), "gl");
assert.deepStrictEqual(gpuBackendSwitches("d3d11"), [["use-angle", "d3d11"]]);
assert.deepStrictEqual(gpuBackendSwitches("gl"), [["use-angle", "gl"]]);
assert.deepStrictEqual(gpuBackendSwitches("vulkan"), [["use-angle", "vulkan"]]);
assert.strictEqual(
  gpuInfoReportsVulkan({
    auxAttributes: {
      glImplementationParts: "(gl=egl-angle,angle=vulkan)",
      hardwareSupportsVulkan: true,
    },
  }),
  true,
);
assert.strictEqual(
  gpuInfoReportsVulkan({
    auxAttributes: {
      glImplementationParts: "(gl=egl-angle,angle=opengl)",
      hardwareSupportsVulkan: true,
    },
  }),
  false,
);
assert.strictEqual(
  gpuInfoReportsVulkan({
    auxAttributes: {
      glImplementationParts: "(gl=none,angle=none)",
      hardwareSupportsVulkan: false,
    },
  }),
  false,
);

const failedState = {
  runtimeKey,
  vulkanFailedAt: 1000,
  vulkanFailureReason: "gpu-process-crashed",
};
assert.strictEqual(
  selectGpuBackend({
    platform: "win32",
    runtimeKey,
    state: failedState,
    now: 2000,
  }).backend,
  "d3d11",
);
assert.strictEqual(
  selectGpuBackend({
    platform: "linux",
    runtimeKey,
    state: failedState,
    now: 2000,
  }).backend,
  "gl",
);
assert.strictEqual(
  selectGpuBackend({
    platform: "linux",
    runtimeKey,
    state: failedState,
    now: 2000,
    retryMs: 500,
  }).backend,
  "vulkan",
);
assert.strictEqual(
  selectGpuBackend({
    platform: "linux",
    runtimeKey,
    state: failedState,
    now: 2000,
    env: { MINERADIO_GPU_BACKEND: "vulkan" },
  }).backend,
  "vulkan",
);
assert.strictEqual(
  selectGpuBackend({
    platform: "linux",
    runtimeKey,
    state: {},
    env: { MINERADIO_GPU_BACKEND_RELAUNCH: "gl" },
  }).canFallback,
  false,
);

console.log("OK GPU backend selection and bounded Vulkan fallback");
