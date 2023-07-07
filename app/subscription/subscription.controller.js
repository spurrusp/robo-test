import BaseController from "../common/base.controller.js";
import SubscriptionService from "./subscription.service.js";

export default class SubscriptionController extends BaseController {

    constructor() {
        super();
        this.subscriptionService = new SubscriptionService();
        this.bindRoutes([
            {
                path: '/subscribe',
                method: 'post',
                func: this.subscribe
            },
            {
                path: '/unsubscribe',
                method: 'post',
                func: this.unsubscribe,
            }
        ]);
    }

    async unsubscribe(req, res, next) {
        try {
            await this.subscriptionService.unsubscribe(req.rawBody);
        } catch (e) {
            return next(e);
        }

        this.created(res, {success: true});
    }

    async subscribe(req, res, next) {
        try {
            await this.subscriptionService.subscribe(req.rawBody);
        } catch (e) {
            return next(e);
        }

        this.created(res, {success: true});
    }

}
