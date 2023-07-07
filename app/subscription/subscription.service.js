import DuplicateFoundError from "../libs/errors/duplicatefound.error.js";
import SubscriptionRepo from "./subscription.repo.js";
import NotFoundEntityError from "../libs/errors/notFoundEntity.error.js";
import AccountRepo from "../account/account.repo.js";
import SubscriptionFlatRepo from "../subscriptionFlat/subscriptionFlat.repo.js";
import SubscriptionFlatService from "../subscriptionFlat/subscriptionFlat.service.js";

export default class SubscriptionService {

    constructor() {
        this.subRepo = new SubscriptionRepo();
        this.subFlatRepo = new SubscriptionFlatRepo();
        this.accRepo = new AccountRepo();
        this.subFlatService = new SubscriptionFlatService();
    }

    async subscribe({login, source, r_login, r_source}) {
        const accounts = await this.accRepo.findByLogins([login, r_login]);

        const groupedAccounts = this.groupAccounts(accounts);

        if (!groupedAccounts[login])
            throw new NotFoundEntityError(`${login} does not exists`)
        if (!groupedAccounts[r_login])
            throw new NotFoundEntityError(`${login} or ${r_login} does not exists`)

        const bigIntLogin = BigInt(login);
        const bigIntRLogin = BigInt(r_login);

        const subscription = {login: bigIntLogin, source, r_login: bigIntRLogin, r_source};
        const sub = await this.subRepo.findOne(subscription)
        if (sub?.length)
            throw new DuplicateFoundError('Subscription already exists')

        await this.subRepo.insertOne(subscription)

        const balance_usd = groupedAccounts[r_login].balance_usd;

        await this.subFlatRepo.insertOne({login: subscription.login, r_login: subscription.r_login, balance_usd})

        const {
            subFlats,
            subFlatsR
        } = await this.subFlatService.getAllSubFlats(subscription.login, subscription.r_login, balance_usd);

        if (subFlats.length) {
            await this.subFlatRepo.insertValues(subFlats);
            await this.subFlatService.reCalculateSubsFromBase(subFlatsR.map(({login}) => login));
        }
    }

    async unsubscribe({login, source, r_login, r_source}) {
        const bigIntLogin = BigInt(login);
        const bigIntRLogin = BigInt(r_login);

        const subscription = {login: bigIntLogin, source, r_login: bigIntRLogin, r_source};

        const sub = await this.subRepo.findOne(subscription)

        if (!sub?.length)
            throw new NotFoundEntityError('Subscription does not exist')

        await this.subRepo.deleteOne(subscription)


        const {
            subFlats,
            subFlatsR
        } = await this.subFlatService.getAllSubFlatsForDelete(subscription.login, subscription.r_login);

        if (subFlats.length) {
            await this.subFlatRepo.deleteValues(subFlats);
            await this.subFlatService.reCalculateSubsFromBase(subFlatsR.map(({login}) => login));
        }
    }

    groupAccounts(accounts) {
        if (Array.isArray(accounts))
            return accounts.reduce((acc, item) => {
                acc[item.login.toString()] = item;
                return acc;
            }, {})
        return {};
    }
}
