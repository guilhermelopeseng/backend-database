import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoryRepository = getRepository(Category);

  const balance = await transactionsRepository.getBalance();
  const transactionsValue = await transactionsRepository.find();

  const transactionsPromise = transactionsValue.map(async transaction => ({
    // Retorna um Array de Promisses
    id: transaction.id,
    title: transaction.title,
    type: transaction.type,
    value: transaction.value,
    category: await categoryRepository.findOne({
      where: { id: transaction.category_id },
    }),
    created_at: transaction.created_at,
    updated_at: transaction.updated_at,
  }));

  const transactions = await Promise.all(transactionsPromise); // Torna o array de Promisses em uma unica Promisse

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTrasaction = new CreateTransactionService();

  const transaction = await createTrasaction.execute({
    title,
    value,
    type,
    category,
  });

  const transactions = await createTrasaction.organization(transaction);
  return response.json(transactions);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(200).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'), // esse nome tem que ser o mesmo no insomnia
  async (request, response) => {
    const transaction = new ImportTransactionsService();

    const transactions = await transaction.execute({
      fileName: request.file.filename,
    });
    return response.json(transactions);
  },
);

export default transactionsRouter;
