import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Information {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category?: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome') {
      if (balance.total - value < 0) {
        throw new AppError('This transaction is not executable');
      }
    }

    const categoryRepository = getRepository(Category);

    const categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      const createCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(createCategory);
    }

    const categoryFind = await categoryRepository.findOne({
      where: { title: category },
    });

    const category_id = categoryFind?.id;

    const createTransaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(createTransaction);

    return createTransaction;
  }

  public async organization(transaction: Transaction): Promise<Information> {
    const categoryRepository = getRepository(Category);

    const categoryTitle = await categoryRepository.findOne({
      where: { id: transaction.category_id },
    });
    const information = {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: categoryTitle?.title,
    };
    return information;
  }
}

export default CreateTransactionService;
