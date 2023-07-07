import AccountRepo from "./account.repo.js";
import NotFoundEntityError from "../libs/errors/notFoundEntity.error.js";
import SubscriptionFlatService from "../subscriptionFlat/subscriptionFlat.service.js";

export default class AccountService {

    constructor() {
        this.accountRepo = new AccountRepo();
        this.subscriptionFlatService = new SubscriptionFlatService();

    }

    async getAll() {
        const result = await this.accountRepo.getAccounts();
        return result.map(item => ({
            ...item,
            login: BigInt(item.login)
        }));
    }

    async updateAccount({login, balance_usd, source} = {}) {
        if (!login)
            throw new NotFoundEntityError('Account does not exist')

        const bigIntLogin = BigInt(login);

        const accounts = await this.accountRepo.findByLogins([login])
        if (!accounts?.length)
            throw new NotFoundEntityError('Account does not exist')

        await this.accountRepo.updateAccount({login: bigIntLogin, balance_usd, source});
        await this.subscriptionFlatService.updateRLoginBalance({login: bigIntLogin, balance_usd});

        // такие конструкции можно было в хелперы объединить(
        const subFlatsR = await this.subscriptionFlatService.subFlatsR(bigIntLogin);
        if (subFlatsR.length) {
            await this.subscriptionFlatService.reCalculateSubsFromBase(subFlatsR.map(({login}) => login));
        }

        const account = accounts[0];
        return {
            ...account,
            login: BigInt(account.login),
            ...(balance_usd ? {balance_usd} : {}),
            ...(source ? {source} : {}),
        }
    }
}
