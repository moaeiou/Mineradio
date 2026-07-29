const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const desktopMain = fs.readFileSync(
  path.join(appRoot, "desktop", "main.js"),
  "utf8",
);
const server = fs.readFileSync(path.join(appRoot, "server.js"), "utf8");

assert(
  /gpuBackendSwitches\(ACTIVE_GPU_BACKEND\.backend\)/.test(desktopMain),
  "ANGLE selection must use the platform-aware GPU backend policy",
);
assert(
  /function setMainWindowFullscreenResizeGuard[\s\S]{0,300}process\.platform !== ["']win32["']\) return/.test(
    desktopMain,
  ),
  "the fullscreen resize workaround must remain Windows-only",
);
assert(
  /function toggleMaximize[\s\S]{0,400}win\.maximize\(\)/.test(desktopMain) &&
    /desktop-window-toggle-maximize[\s\S]{0,450}toggleMaximize\(win\)/.test(
      desktopMain,
    ),
  "maximize and fullscreen must remain separate window operations",
);
assert(
  /fullscreenable:\s*true/.test(desktopMain) &&
    /process\.platform === ["']darwin["'] \? 10000 : 3000/.test(desktopMain),
  "macOS native fullscreen must retain eligibility and an asynchronous watchdog",
);
assert(
  /const WEATHER_IP_LOCATION_URL = ["']https:\/\/ipinfo\.io\/json["']/.test(
    server,
  ) &&
    /String\(\(body && body\.loc\) \|\| ["']["']\)[\s\S]{0,80}split\(["'],["']\)/.test(
      server,
    ) &&
    /provider:\s*["']ipinfo["']/.test(server),
  "IP weather location must use and parse the ipinfo.io response shape",
);
assert(
  !/ip-api\.com/.test(server),
  "the legacy IP location endpoint must be gone",
);

console.log("OK cross-platform window, GPU, and ipinfo regressions");
