export class LoggerService {
    static logger;

    static getInstance() {
        if (!LoggerService.logger) {
            LoggerService.logger = new LoggerService();
        }
        return LoggerService.logger;
    }

    log(...args) {
        console.log(...args);
    }

    error(...args) {
        console.error(...args);
    }
}
