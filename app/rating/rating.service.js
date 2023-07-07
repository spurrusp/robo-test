import SubscriptionFlatRepo from "../subscriptionFlat/subscriptionFlat.repo.js";
import AccountRepo from "../account/account.repo.js";
import SubscriptionHelper from "../libs/helpers/SubscriptionHelper.js";
import SubscriptionRepo from "../subscription/subscription.repo.js";

export default class RatingService {

    constructor() {
        this.subscriptionFlatRepo = new SubscriptionFlatRepo();
        this.subscriptionRepo = new SubscriptionRepo();
        this.accountModel = new AccountRepo();
        this.subsHelper = new SubscriptionHelper();
    }

    // тут такой больше суматошный метод, такой не удобен в переиспользовании, но удобен для отладки
    async recalculate() {
        await this.subscriptionFlatRepo.truncate();
        const [allAccounts, allSubs] =
            await Promise.all([this.accountModel.getAccounts(), this.subscriptionRepo.getAll()])

        const calculatedBalances = this.subsHelper.reCalculateSubs(allAccounts, allSubs);

        // получить подписки из subscription_flat
        for (const login in calculatedBalances) {
            await this.accountModel.updateAccount({
                login,
                balance_usd_sub: calculatedBalances[login].balanceUsdSub,
                subscribers_count: calculatedBalances[login].subscribersCount
            });
            if (calculatedBalances[login].subscriptionFlat?.length) {
                await this.subscriptionFlatRepo.insertValues(
                    calculatedBalances[login].subscriptionFlat
                        .map(({login: r_login, balance}) => [login, r_login, balance])
                );
            }
        }
    }

    async getRating() {
        const result = await this.accountModel.getOrderedAccounts();

        return result.map(item => ({
            ...item,
            login: BigInt(item.login)
        }));
    }
}

