// Learner workspace. Keep the public API; replace unfinished bodies.
export class BalanceAccount {
  constructor() { throw new Error("Not implemented"); }
  balance() { throw new Error("Not implemented"); }
  deposit(amount) { throw new Error("Not implemented"); }
  withdraw(amount) { throw new Error("Not implemented"); }
}
export class Bank {
  constructor() { throw new Error("Not implemented"); }
  createAccount(accountId) { throw new Error("Not implemented"); }
  balance(accountId) { throw new Error("Not implemented"); }
  deposit(accountId, amount) { throw new Error("Not implemented"); }
  transfer(requestId, source, target, amount) { throw new Error("Not implemented"); }
  topSpenders(limit) { throw new Error("Not implemented"); }
}
