import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeTransaction = await this.find({ where: { type: 'income' } });
    const outcomeTransaction = await this.find({ where: { type: 'outcome' } });

    const incomeArray = incomeTransaction.map(transaction => transaction.value);
    const outcomeArray = outcomeTransaction.map(
      transaction => transaction.value,
    );

    const income = incomeArray.reduce((item, next) => item + next, 0);
    const outcome = outcomeArray.reduce((item, next) => item + next, 0);

    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
