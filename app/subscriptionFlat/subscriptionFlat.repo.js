import BaseRepo from "../common/base.repo.js";

export default class SubscriptionFlatRepo extends BaseRepo {
    static table = 'subscription_flat'

    insertValues(subscriptionFlats) {
        return this.db.query(`insert ignore into ${SubscriptionFlatRepo.table} (login,r_login, balance_usd)` +
            ' VALUES ' +
            `${Array(subscriptionFlats.length).fill('(?,?,?)').join(',')}`,
            subscriptionFlats.flat());
    }

    async deleteValues(subscriptionFlats) {
        return this.db.query(`delete from ${SubscriptionFlatRepo.table}` +
            ' where ' +
            `${Array(subscriptionFlats.length).fill('(login = ? and r_login = ?)').join(' or ')}`,
            subscriptionFlats.flat());
    }

    async updateSubFlatBalanceForRLogin(login, balance) {
        return this.db.query(`update ${SubscriptionFlatRepo.table} set balance_usd = ? where r_login = ?`, [balance, login])
    }

    // updateSubForLogin(login) {
    //     return this.db.query(`update ${AccountRepo.table} set balance_usd_sub = ` +
    //         `(select SUM(balance_usd) from ${SubscriptionFlatRepo.table} where login = ? group by login) ` +
    //         'where login = ?', [login, login]);
    // }

    async truncate() {
        return this.db.query(`truncate ${SubscriptionFlatRepo.table}`);
    }

    async insertOne({login, r_login, balance_usd}) {
        return this.db.query(`insert into ${SubscriptionFlatRepo.table}  set login = ?, r_login = ?, balance_usd = ?`,
            [login, r_login, balance_usd])
    }

    async selectByRLogin(login) {
        return this.db.query(`select * from ${SubscriptionFlatRepo.table}  where r_login = ?`,
            [login])
    }

    async selectByLogin(login) {
        return this.db.query(`select * from ${SubscriptionFlatRepo.table}  where login = ?`,
            [login])
    }


    async getBalances(logins) {
        if (!logins?.length)
            return [];

        const whereLogins = Array(logins.length).fill('?').join(',');

        return this.db.query(`select login, SUM(balance_usd) as balance, count(r_login) as subscribers_count from ${SubscriptionFlatRepo.table} where login in (${whereLogins}) group by login`, logins);
    }
}
