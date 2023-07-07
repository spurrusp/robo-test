import BaseController from "../common/base.controller.js";
import AccountService from "./account.service.js";
import JSONbigString from "json-bigint";

export default class AccountController extends BaseController {
    constructor() {
        super();
        this.accountService = new AccountService();
        this.bindRoutes([
            {
                path: '/get-all-account',
                method: 'get',
                func: this.getAll
            },
            {
                // красивее конечно put update/:id и т.п., но упростил сознательно
                path: '/update-account',
                method: 'post',
                func: this.updateByLogin,
            }
        ]);
    }

    async getAll(
        req,
        res,
    ) {
        const result = await this.accountService.getAll();

        this.ok(res, JSONbigString.stringify(result));
    }

    async updateByLogin(req, res, next) {
        try {
            const updatedAccount = await this.accountService.updateAccount(req.rawBody)
            this.ok(res, JSONbigString.stringify({account: updatedAccount}));
        } catch (e) {
            this.loggerService.error(e);
            next(e);
        }
    }
}
