"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("../pre-bundled/node_modules/loglevel");
const _1 = require("./");
// This script starts the server automatically using env vars to control configuration.
log.setDefaultLevel("info");
if (process.env.hasOwnProperty("LOG_LEVEL")) {
    log.setLevel(process.env["LOG_LEVEL"]);
}
const app = _1.createExpressApp();
exports.app = app;
const port = process.env["PORT"] || 8000;
exports.port = port;
app.listen(+port, () => {
    log.info(`Server started on port ${port}`);
});
//# sourceMappingURL=autostart.js.map