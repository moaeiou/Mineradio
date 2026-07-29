"use strict";

const net = require("net");

const DEFAULT_LISTEN_HOST = "127.0.0.1";

function commandLineListenHost(argv) {
  const args = Array.isArray(argv) ? argv : [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index] || "");
    if (arg === "-l" || arg === "--listen") {
      return { specified: true, value: String(args[index + 1] || "") };
    }
    if (arg.startsWith("--listen=")) {
      return { specified: true, value: arg.slice("--listen=".length) };
    }
    if (arg.startsWith("-l=")) {
      return { specified: true, value: arg.slice("-l=".length) };
    }
  }
  return { specified: false, value: "" };
}

function normalizeListenHost(value) {
  let host = String(value || "").trim();
  if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
  if (!host || host.length > 253 || /[\s/?#@]/.test(host)) return "";
  if (net.isIP(host)) return host;
  const hostname = host.toLowerCase();
  if (
    hostname.length <= 253 &&
    hostname
      .split(".")
      .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  )
    return hostname;
  return "";
}

function resolveListenHost(options = {}) {
  const env = options.env || process.env;
  const cli = commandLineListenHost(options.argv || process.argv);
  let value;
  let source;
  if (cli.specified) {
    value = cli.value;
    source = "command-line";
  } else if (String(env.MINERADIO_LISTEN_HOST || "").trim()) {
    value = env.MINERADIO_LISTEN_HOST;
    source = "MINERADIO_LISTEN_HOST";
  } else if (String(env.HOST || "").trim()) {
    value = env.HOST;
    source = "HOST";
  } else {
    value = options.defaultHost || DEFAULT_LISTEN_HOST;
    source = "default";
  }
  const host = normalizeListenHost(value);
  if (!host) {
    const error = new Error(`Invalid Mineradio listen host: ${String(value)}`);
    error.code = "MINERADIO_INVALID_LISTEN_HOST";
    throw error;
  }
  return { host, source };
}

function connectHostForListenHost(value) {
  const host = normalizeListenHost(value) || DEFAULT_LISTEN_HOST;
  if (host === "0.0.0.0") return "127.0.0.1";
  if (host === "::") return "::1";
  return host;
}

function formatListenHostForUrl(value) {
  const host = normalizeListenHost(value) || DEFAULT_LISTEN_HOST;
  return net.isIP(host.split("%")[0]) === 6 ? `[${host}]` : host;
}

module.exports = {
  DEFAULT_LISTEN_HOST,
  commandLineListenHost,
  normalizeListenHost,
  resolveListenHost,
  connectHostForListenHost,
  formatListenHostForUrl,
};
