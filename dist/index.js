"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("../pre-bundled/node_modules/express"));
const body_parser_1 = __importDefault(require("../pre-bundled/node_modules/body-parser"));
const routes_1 = require("./routes");
const StripeError_1 = require("./api/StripeError");
const idempotency_1 = require("./api/idempotency");
const auth_1 = require("./api/auth");
const log = require("../pre-bundled/node_modules/loglevel");
function createExpressApp() {
    const app = express_1.default();
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(auth_1.auth.authRoute);
    app.use(idempotency_1.idempotencyRoute);
    app.use("/", routes_1.routes);
    // Error handling comes last.
    app.use((err, req, res, next) => {
        if (err instanceof StripeError_1.StripeError) {
            res.status(err.statusCode).send({ error: err.error });
            return;
        }
        log.error("Unexpected error:", err.stack);
        res.status(500).send({
            message: "Unexpected error: " + err.message,
            stack: err.stack
        });
    });
    return app;
}
exports.createExpressApp = createExpressApp;
//# sourceMappingURL=index.js.map