import BaseRepo from "../common/base.repo.js";

export default class SubscriptionRepo extends BaseRepo {
    static table = 'subscription'

    findOne({login, source, r_login, r_source}) {
        return this.db.query(`select * from ${SubscriptionRepo.table} where login = ? and source = ? and r_login = ? and r_source = ?`,
            [login, source, r_login, r_source])
    }

    async insertOne({login, source, r_login, r_source}) {
        return this.db.query(`insert into ${SubscriptionRepo.table}  set login = ?, source = ?, r_login = ?, r_source = ?`,
            [login, source, r_login, r_source])
    }

    async deleteOne({login, source, r_login, r_source}) {
        return this.db.query(`delete from ${SubscriptionRepo.table} where login = ? and source = ? and r_login = ? and r_source = ?`,
            [login, source, r_login, r_source])
    }

    async getAll() {
        return this.db.query(`select * from ${SubscriptionRepo.table}`);
    }

}
