"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("loglevel");
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const StripeError_1 = require("./StripeError");
const verify_1 = require("./verify");
const products_1 = require("./products");
var plans;
(function (plans) {
    const accountPlans = new AccountData_1.AccountData();
    function create(accountId, params) {
        log.debug("plans.create", accountId, params);
        verify_1.verify.requiredParams(params, ["currency", "interval", "product"]);
        verify_1.verify.requiredValue(params, "billing_scheme", ["per_unit", "tiered", null, undefined]);
        verify_1.verify.requiredValue(params, "interval", ["day", "month", "week", "year"]);
        verify_1.verify.requiredValue(params, "usage_type", ["licensed", "metered", null, undefined]);
        verify_1.verify.currency(params.currency, "currency");
        const planId = params.id || `plan_${utils_1.generateId(14)}`;
        if (accountPlans.contains(accountId, planId)) {
            throw new StripeError_1.StripeError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: "Plan already exists.",
                type: "invalid_request_error"
            });
        }
        let product;
        if (typeof params.product === "string") {
            product = products_1.products.retrieve(accountId, params.product, "product");
            if (product.type !== "service") {
                throw new StripeError_1.StripeError(400, {
                    message: `Plans may only be created with products of type \`service\`, but the supplied product (\`${product.id}\`) had type \`${product.type}\`.`,
                    param: "product",
                    type: "invalid_request_error"
                });
            }
        }
        else {
            product = products_1.products.create(accountId, Object.assign(Object.assign({}, params.product), { type: "service" }));
        }
        const billingScheme = params.billing_scheme || "per_unit";
        const usageType = params.usage_type || "licensed";
        const plan = {
            id: planId,
            object: "plan",
            active: params.hasOwnProperty("active") ? params.active : true,
            aggregate_usage: usageType === "metered" ? params.aggregate_usage || "sum" : null,
            amount: billingScheme === "per_unit" ? +params.amount : null,
            billing_scheme: billingScheme,
            created: (Date.now() / 1000) | 0,
            currency: params.currency,
            interval: params.interval,
            interval_count: params.interval_count || 1,
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            nickname: params.nickname || null,
            product: product.id,
            tiers: params.tiers || null,
            tiers_mode: params.tiers_mode || null,
            transform_usage: params.transform_usage || null,
            trial_period_days: params.trial_period_days || null,
            usage_type: usageType
        };
        accountPlans.put(accountId, plan);
        return plan;
    }
    plans.create = create;
    function retrieve(accountId, planId, paramName) {
        log.debug("plans.retrieve", accountId, planId);
        const plan = accountPlans.get(accountId, planId);
        if (!plan) {
            throw new StripeError_1.StripeError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such plan: ${planId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return plan;
    }
    plans.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("plans.list", accountId, params);
        let data = accountPlans.getAll(accountId);
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    plans.list = list;
})(plans = exports.plans || (exports.plans = {}));
//# sourceMappingURL=plans.js.map