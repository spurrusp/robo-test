import BaseController from "../common/base.controller.js";
import RatingService from "./rating.service.js";
import JSONbigString from "json-bigint";

export default class RatingController extends BaseController {
    constructor() {
        super();
        this.ratingService = new RatingService();
        this.bindRoutes([
            {
                path: '/rating',
                method: 'get',
                func: this.getRating
            },
            {
                path: '/recalculate',
                method: 'get',
                func: this.recalculate,
            }
        ]);
    }

    async firstRecalculate() {
        try {
            await this.ratingService.recalculate();
            this.loggerService.log('Calculating ends successfully')
        } catch (e) {
            this.loggerService.error('Calculating throw error', e)
        }
    }

    async recalculate(req,
                      res,
                      next,) {
        try {
            await this.ratingService.recalculate();
            this.loggerService.log('Calculating ends successfully')
        } catch (e) {
            this.loggerService.error('Calculating throw error', e)
            next(e);
        }

        this.ok(res, {success: true});
    }

    async getRating(
        req,
        res,
    ) {
        const result = await this.ratingService.getRating();

        this.ok(res, JSONbigString.stringify(result));
    }

}
