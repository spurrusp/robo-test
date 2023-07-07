import {Router} from 'express';
import {LoggerService} from "../libs/logger/index.js";

export default class BaseController {
    constructor() {
        this._router = Router();
        this.loggerService = LoggerService.getInstance();
    }

    _router;

    get router() {
        return this._router;
    }

    send(res, code, message) {
        res.type('application/json');
        return res.status(code).send(message);
    }

    ok(res, message) {
        return this.send(res, 200, message);
    }

    created(res, message) {
        return this.send(res, 201, message);
    }

    bindRoutes(routes) {
        for (const route of routes) {
            this.loggerService.log(`[${route.method}] ${route.path}`);
            const handler = route.func.bind(this);
            this.router[route.method](route.path, handler);
        }
    }
}
