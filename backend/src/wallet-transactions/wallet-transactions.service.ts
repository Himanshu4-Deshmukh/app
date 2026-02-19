import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class WalletTransactionsService {
  constructor(
    @InjectModel(WalletTransaction.name)
    private transactionModel: Model<WalletTransactionDocument>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, session?: any): Promise<WalletTransactionDocument> {
    const transaction = new this.transactionModel({
      ...createTransactionDto,
      userId: new Types.ObjectId(createTransactionDto.userId),
    });
    return transaction.save({ session });
  }

  async getUserTransactions(userId: string): Promise<WalletTransactionDocument[]> {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async getAllTransactions(): Promise<WalletTransactionDocument[]> {
    return this.transactionModel.find().sort({ createdAt: -1 }).limit(500);
  }
}
