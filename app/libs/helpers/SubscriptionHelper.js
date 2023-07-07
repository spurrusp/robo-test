export default class SubscriptionHelper {
    groupedSubs = Object.create(null);
    balances = Object.create(null);
    visited = [];
    accounts = [];
    subscribersCount = Object.create(null);
    subscriptionFlat = Object.create(null);

    reCalculateSubs(allAccounts, allSubs) {
        this.fillBalances(allAccounts);
        this.fillAccounts(allAccounts);
        this.fillSubs(allSubs);
        return this.calculateBalances();
    }

    fillBalances(allAccounts) {
        this.balances = allAccounts.reduce((acc, item) => {
            acc[item.login] = item.balance_usd;
            return acc
        }, {})
    }

    fillSubs(allSubs) {
        this.groupedSubs = allSubs.reduce((acc, item) => {
            const r_login = item.r_login;
            const login = item.login;
            const rBalance = this.balances[r_login];
            const subObject = [
                r_login, rBalance
            ]
            if (this.accounts.includes(login))
                acc[login] = acc[login] ? [...acc[login], subObject] : [subObject];
            return acc
        }, {})
    }

    calculateBalances() {
        const result = {};
        for (const login of this.accounts) {
            const {
                subBalance,
                subscribersCount,
                subscriptionFlat
            } = this.calculateSubBalanceForLogin(login, login);

            result[login] = {
                balanceUsdSub: subBalance + this.balances[login],
                subscribersCount,
                subscriptionFlat
            };
            this.visited = [];
        }
        return result;
    }

    calculateSubBalanceForLogin(login, originalLogin) {
        if (this.visited.includes(login)) return { //  || !this.groupedSubs[login]
            subBalance: 0,
            subscribersCount: this.subscribersCount[originalLogin], // не возвращать, возвращать только баланс
            subscriptionFlat: this.subscriptionFlat[originalLogin]
        };

        this.visited.push(login);
        const subs = this.groupedSubs[login]

        // не совсем красиво, что одна функция делает несколько действий, но чтобы не перебирать несколько раз пришлось сделать так
        if (this.subscribersCount[originalLogin] === undefined) this.subscribersCount[originalLogin] = 0;
        this.subscribersCount[originalLogin]++;

        if (this.subscriptionFlat[originalLogin] === undefined) this.subscriptionFlat[originalLogin] = [];
        this.subscriptionFlat[originalLogin].push({
            login,
            balance: this.balances[login]
        });

        let balance = 0;
        if (subs)
            for (const sub of subs) {
                const nextSubBalance = this.calculateSubBalanceForLogin(sub[0], originalLogin);
                balance += sub[1] + nextSubBalance.subBalance; // тут баланс можно было и не считать, но для первой калькуляции норм
            }

        return {
            subBalance: balance, // не возвращать его, пересчитать из таблицы _flat
            subscribersCount: this.subscribersCount[login],
            subscriptionFlat: this.subscriptionFlat[login]
        };
    }

    fillAccounts(allAccounts) {
        this.accounts = allAccounts.map(({login}) => login);
    }
}
