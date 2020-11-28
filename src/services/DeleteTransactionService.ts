import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const findExistIdRepository = await transactionsRepository.findOne({
      where: { id },
    });

    if (!findExistIdRepository) {
      throw new AppError('This Transcation dont exists');
    }
    await transactionsRepository.remove(findExistIdRepository);
  }
}

export default DeleteTransactionService;
