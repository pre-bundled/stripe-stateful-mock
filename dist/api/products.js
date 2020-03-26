"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("../../pre-bundled/node_modules/loglevel");
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const verify_1 = require("./verify");
const StripeError_1 = require("./StripeError");
var products;
(function (products) {
    const accountProducts = new AccountData_1.AccountData();
    function create(accountId, params) {
        log.debug("products.create", accountId, params);
        verify_1.verify.requiredParams(params, ["name", "type"]);
        verify_1.verify.requiredValue(params, "type", ["service", "good"]);
        const productId = params.id || `prod_${utils_1.generateId()}`;
        if (accountProducts.contains(accountId, productId)) {
            throw new StripeError_1.StripeError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: `Product already exists.`,
                type: "invalid_request_error"
            });
        }
        const product = {
            id: productId,
            object: "product",
            active: params.hasOwnProperty("active") ? params.active : true,
            attributes: params.attributes || [],
            created: (Date.now() / 1000) | 0,
            caption: params.caption || null,
            deactivated_on: params.deactivate_on || undefined,
            description: params.description || null,
            images: params.images || [],
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            name: params.name,
            package_dimensions: params.package_dimensions || null,
            shippable: params.type === "good" ? params.shippable || true : null,
            statement_descriptor: undefined,
            skus: undefined,
            type: params.type,
            updated: (Date.now() / 1000) | 0,
            url: params.url || null
        };
        accountProducts.put(accountId, product);
        return product;
    }
    products.create = create;
    function retrieve(accountId, productId, paramName) {
        log.debug("products.retrieve", accountId, productId);
        const product = accountProducts.get(accountId, productId);
        if (!product) {
            throw new StripeError_1.StripeError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such product: ${productId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return product;
    }
    products.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("products.list", accountId, params);
        let data = accountProducts.getAll(accountId);
        if (params.hasOwnProperty("active")) {
            data = data.filter(d => d.active === params.active);
        }
        if (params.ids) {
            data = data.filter(d => params.ids.indexOf(d.id) !== -1);
        }
        if (params.hasOwnProperty("shippable")) {
            data = data.filter(d => d.shippable === params.shippable);
        }
        if (params.url) {
            data = data.filter(d => d.url === params.url);
        }
        if (params.type) {
            data = data.filter(d => d.type === params.type);
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    products.list = list;
})(products = exports.products || (exports.products = {}));
//# sourceMappingURL=products.js.map