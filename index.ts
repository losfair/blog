/// <reference path="node_modules/blueboat-types/src/index.d.ts" />

if("Router" in globalThis) {
  (globalThis as any).APP_RUNTIME = "blueboat";
  require("./init_blueboat");
} else {
  (globalThis as any).APP_RUNTIME = "cloudflare";
  require("./init_worker");
}
