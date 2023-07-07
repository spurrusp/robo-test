import DatabaseService from "../libs/database/index.js";

export default class BaseRepo {
    constructor() {
        this.db = DatabaseService.getInstance();
    }
}
