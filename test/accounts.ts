import * as chai from "chai";
import {getLocalStripeClient} from "./stripeUtils";
import {generateId} from "../src/api/utils";

describe("accounts", () => {

    const localStripeClient = getLocalStripeClient();

    it("can create, retrieve and delete a standard account", async () => {
        const account = await localStripeClient.accounts.create({type: "standard"});
        chai.assert.isString(account.id);

        const getAccount = await localStripeClient.accounts.retrieve(account.id);
        chai.assert.deepEqual(getAccount, account);

        const getAccountWithHeader = await localStripeClient.accounts.retrieve(account.id, {stripe_account: account.id});
        chai.assert.deepEqual(getAccountWithHeader, account);

        const delAccount = await localStripeClient.accounts.del(account.id);
        chai.assert.equal(delAccount.id, account.id);
        chai.assert.isTrue(delAccount.deleted);

        let getError: any;
        try {
            const regetAccount = await localStripeClient.accounts.retrieve(account.id);
            chai.assert.fail(regetAccount, undefined, "should not get the account");
        } catch (err) {
            getError = err;
        }
        chai.assert.isDefined(getError);
        chai.assert.equal(getError.statusCode, 403);
        chai.assert.equal(getError.rawType, "invalid_request_error");
        chai.assert.equal(getError.type, "StripePermissionError");
    });

    it("cannot create an account from a connect account", async () => {
        const account = await localStripeClient.accounts.create({type: "standard"});
        chai.assert.isString(account.id);

        let createError: any;
        try {
            const account2 = await localStripeClient.accounts.create({type: "standard"}, {
                stripe_account: account.id
            });
            chai.assert.fail(account2, undefined, "should not create the account");
        } catch (err) {
            createError = err;
        }
        chai.assert.isDefined(createError);
        chai.assert.equal(createError.statusCode, 400);
    });

    it("cannot retrieve an account that doesn't exist", async () => {
        let getError: any;
        try {
            const regetAccount = await localStripeClient.accounts.retrieve(generateId());
            chai.assert.fail(regetAccount, undefined, "should not get an account");
        } catch (err) {
            getError = err;
        }
        chai.assert.isDefined(getError);
        chai.assert.equal(getError.statusCode, 403);
        chai.assert.equal(getError.rawType, "invalid_request_error");
        chai.assert.equal(getError.type, "StripePermissionError");
    });

    it("cannot delete an account that doesn't exist", async () => {
        let delError: any;
        try {
            const regetAccount = await localStripeClient.accounts.del(generateId());
            chai.assert.fail(regetAccount, undefined, "should not delete an account");
        } catch (err) {
            delError = err;
        }
        chai.assert.isDefined(delError);
        chai.assert.equal(delError.statusCode, 403);
        chai.assert.equal(delError.rawType, "invalid_request_error");
        chai.assert.equal(delError.type, "StripePermissionError");
    });
});
