"use strict";

const assert = require("assert");
const {
  commandLineListenHost,
  normalizeListenHost,
  resolveListenHost,
  connectHostForListenHost,
  formatListenHostForUrl,
} = require("../desktop/listen-host");

assert.deepStrictEqual(commandLineListenHost(["Mineradio", "-l", "0.0.0.0"]), {
  specified: true,
  value: "0.0.0.0",
});
assert.deepStrictEqual(
  commandLineListenHost(["Mineradio", "--listen", "192.168.1.20"]),
  { specified: true, value: "192.168.1.20" },
);
assert.strictEqual(
  commandLineListenHost(["Mineradio", "--listen=::"]).value,
  "::",
);
assert.strictEqual(normalizeListenHost("[::1]"), "::1");
assert.strictEqual(normalizeListenHost("localhost"), "localhost");
assert.strictEqual(normalizeListenHost("http://0.0.0.0"), "");

assert.deepStrictEqual(
  resolveListenHost({
    argv: ["Mineradio", "--listen", "0.0.0.0"],
    env: { MINERADIO_LISTEN_HOST: "192.168.1.2", HOST: "127.0.0.2" },
  }),
  { host: "0.0.0.0", source: "command-line" },
);
assert.deepStrictEqual(
  resolveListenHost({
    argv: ["Mineradio"],
    env: { MINERADIO_LISTEN_HOST: "192.168.1.2", HOST: "127.0.0.2" },
  }),
  { host: "192.168.1.2", source: "MINERADIO_LISTEN_HOST" },
);
assert.deepStrictEqual(resolveListenHost({ argv: [], env: {} }), {
  host: "127.0.0.1",
  source: "default",
});
assert.throws(
  () => resolveListenHost({ argv: ["Mineradio", "--listen"], env: {} }),
  /Invalid Mineradio listen host/,
);
assert.strictEqual(connectHostForListenHost("0.0.0.0"), "127.0.0.1");
assert.strictEqual(connectHostForListenHost("::"), "::1");
assert.strictEqual(formatListenHostForUrl("::1"), "[::1]");

console.log("OK listen host CLI, environment precedence, and local connection");
