import {config} from "dotenv";

export default class ConfigService {
    static configService;
    config;

    constructor() {
        const result = config();
        if (result.error || !result.parsed) {
            throw new Error('Не удалось прочитать конфиг')
        }
        this.config = result.parsed;
    }

    static getInstance() {
        if (!ConfigService.configService) {
            ConfigService.configService = new ConfigService();
        }
        return ConfigService.configService;
    }

    get(key) {
        return this.config[key];
    }
}
