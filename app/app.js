import express from 'express';
import RatingController from "./rating/rating.controller.js";
import bodyParser from "body-parser";
import SubscriptionController from "./subscription/subscription.controller.js";
import DuplicateFoundError from "./libs/errors/duplicatefound.error.js";
import {LoggerService} from "./libs/logger/index.js";
import createError from "http-errors";
import NotFoundEntityError from "./libs/errors/notFoundEntity.error.js";
import JSONbigString from "json-bigint";
import DatabaseService from "./libs/database/index.js";
import AccountController from "./account/account.controller.js";
import ConfigService from "./libs/config/index.js";

export default class App {
    constructor() {
        this.configService = ConfigService.getInstance();
        this.app = express();
        this.port = this.configService.get('APP_PORT') || 8000;
        this.logger = LoggerService.getInstance();
        this.ratingController = new RatingController();
        this.subscriptionController = new SubscriptionController();
        this.accountController = new AccountController();
    }

    useRoutes() {
        this.app.use(this.ratingController.router)
        this.app.use(this.subscriptionController.router)
        this.app.use(this.accountController.router)
    }

    async run() {
        this.addUses();
        this.useRoutes();
        this.useExceptionFilters();

        this.app.listen(this.port);
        await DatabaseService.getInstance().connect();
        this.logger.log(`Listening port ${this.port}`);
        await this.ratingController.firstRecalculate();
    }

    addUses() {
        this.app.use(bodyParser.json({
            limit: "10mb",
            extended: true,
            verify: (req, res, buf, encoding) => {
                try {
                    req.rawBody = JSONbigString.parse(buf.toString());
                } catch (e) {
                    try {
                        req.rawBody = JSON.parse(buf.toString());
                    } catch (e) {
                        req.rawBody = JSON.parse("{}");
                    }
                }
            },
        }))
    }

    useExceptionFilters() {
        this.app.use((req, res, next) => {
            next(createError(404));
        });
        this.app.use((err, req, res, next) => {
            if (err instanceof DuplicateFoundError) {
                res.status(400).send({err: err.message});
                return;
            }

            if (err instanceof NotFoundEntityError) {
                res.status(400).send({err: err.message});
                return;
            }

            if (err.status === 404) {
                res.status(404).send({err: 'Not found'});
                return;
            }
            this.logger.error(err);
            res.status(500).send({err: 'Something went wrong'});
        })
    }
}
