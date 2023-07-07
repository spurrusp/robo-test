import mysql from "mysql2/promise.js";
import ConfigService from "../config/index.js";

export default class DatabaseService {
    static db;

    constructor() {
        this.configService = ConfigService.getInstance();
    }

    static getInstance() {
        if (!DatabaseService.db) {
            DatabaseService.db = new DatabaseService();
        }
        return DatabaseService.db;
    }

    _getDbConfig() {
        const map = {
            'DB_HOST': 'host',
            'DB_USER': 'user',
            'DB_PASSWORD': 'password',
            'DB_DATABASE': 'database',
        }

        const config = {};
        for (const key in map) {
            const configValue = this.configService.get(key);
            if (!configValue)
                throw new Error(`${key} does not exist in config`);
            config[map[key]] = configValue;
        }
        return {
            ...config,
            supportBigNumbers: true,
            bigNumberStrings: true

        };
    }

    async connect() {
        this.connection = await mysql.createConnection(this._getDbConfig());
    }

    async query(sql, params) {
        const [results,] = await this.connection.execute(sql, params);

        return results;
    }

}
