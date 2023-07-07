import AccountRepo from "../account/account.repo.js";
import SubscriptionFlatRepo from "./subscriptionFlat.repo.js";

export default class SubscriptionFlatService {
    constructor() {
        this.subFlatRepo = new SubscriptionFlatRepo();
        this.accountRepo = new AccountRepo();
    }

    async reCalculateSubsFromBase(logins) {
        const bigIntLogins = logins.map(item => BigInt(item));
        const balances = await this.subFlatRepo.getBalances(bigIntLogins)

        for (const {login, balance, subscribers_count} of balances) {
            const subCount = subscribers_count - 1; // -1 потому что мы во flat пишем связь сам на себя
            await this.accountRepo.updateSubBalance({
                login: BigInt(login),
                balance_usd: balance,
                subscribers_count: subCount
            })
        }
    }

    async getAllSubFlatsForDelete(login, r_login) {
        // берем всех у кого так же нужно удалить подписку
        const subFlatsR = await this.subFlatRepo.selectByRLogin(login); // отсюда нужен login
        if (!subFlatsR.length) {
            return [];
        }
        // Берем все подписки r_login чтобы их удалить у тех, что выше.
        const subFlatsL = await this.subFlatRepo.selectByLogin(r_login); // отсюда нужен r_login


        const subFlats = subFlatsR.length ? subFlatsR.reduce((acc, {login}) => {
            acc.push(...subFlatsL.map(({r_login}) => [login, r_login]))
            return acc;
        }, []) : [];

        return {
            subFlatsR,
            subFlatsL,
            subFlats
        }

    }

    async subFlatsR(login) {
        return this.subFlatRepo.selectByRLogin(login);
    }

    async getAllSubFlats(login, r_login, balance_usd) {
        // берем всех кому нужно добавить подписок из-за новой (отсюда нужен login)
        const subFlatsR = await this.subFlatsR(login);
        if (!subFlatsR.length) {
            return [];
        }
        // Берем все подписки r_login чтобы их добавить тем что выше.
        // После первого recalculate он сам у себя есть в flat
        // отсюда нужен r_login
        const subFlatsL = await this.subFlatRepo.selectByLogin(r_login);


        const subFlats = subFlatsR.length ? subFlatsR.reduce((acc, {login}) => {
            acc.push(...subFlatsL.map(({r_login}) => [login, r_login, balance_usd]))
            return acc;
        }, []) : [];

        return {
            subFlatsR,
            subFlatsL,
            subFlats
        }

    }

    async updateRLoginBalance({login, balance_usd}) {
        return this.subFlatRepo.updateSubFlatBalanceForRLogin(login, balance_usd);

    }
}
