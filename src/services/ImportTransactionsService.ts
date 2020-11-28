import fs from 'fs';
import path from 'path';
import neatCsv from 'neat-csv';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

interface ResquestObj {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

class ImportTransactionsService {
  async readCSV(buffer: Buffer): Promise<Array<ResquestObj>> {
    const responseCsv = (await neatCsv(buffer)) as Array<ResquestObj>;
    return responseCsv;
  }

  async execute({ fileName }: Request): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, fileName);
    const csv = fs.readFileSync(filePath);

    const value = await this.readCSV(csv);

    const transactionsPromise = value.map(
      async (item): Promise<Transaction> => {
        const createTransaction = new CreateTransactionService();
        const transaction = await createTransaction.execute({
          title: item.title,
          category: item.category,
          type: item.type,
          value: parseFloat(item.value),
        });
        return transaction;
      },
    );
    const transactions = await Promise.all(transactionsPromise);
    return transactions;
  }
}

export default ImportTransactionsService;
