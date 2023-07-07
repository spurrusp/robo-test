import BaseRepo from "../common/base.repo.js";

export default class AccountRepo extends BaseRepo {

    static table = 'account';

    getAccounts() {
        return this.db.query(`select * from ${AccountRepo.table}`);
    }

    // специально упрощаю, чтобы не писать обработку параметров на orderBy и фильтров
    getOrderedAccounts() {
        return this.db.query(`select * from ${AccountRepo.table} order by balance_usd_sub DESC`);
    }

    // можно так же руками собирать всегда запросы, чтобы не перебирать тут whereObject
    async updateAccount({login, balance_usd, balance_usd_sub, subscribers_count} = {}) {
        if (!login) throw new Error('Cannot update account without login');

        const whereObject = {balance_usd, balance_usd_sub, subscribers_count};
        const filteredKeys = Object.keys(whereObject).filter(key => whereObject[key] !== undefined);
        const setString = filteredKeys
            .map(key => `${key} = ?`)
            .join(',');
        const params = filteredKeys.map(item => whereObject[item]);

        return this.db.query(`update ${AccountRepo.table} set ${setString} where login = ?`, [...params, login]);
    }

    findByLogins(logins) {
        if (!logins?.length)
            return [];

        const whereLogins = Array(logins.length).fill('?').join(',');
        return this.db.query(`select * from ${AccountRepo.table} where login in (${whereLogins})`, logins.map(login => BigInt(login)));
    }

    async updateSubBalance({login, balance_usd, subscribers_count}) {
        return this.db.query(`update ${AccountRepo.table} set balance_usd_sub = ?, subscribers_count = ? where login = ?`, [balance_usd, subscribers_count, login]);
    }
}
