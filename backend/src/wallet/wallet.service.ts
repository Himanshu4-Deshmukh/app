import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { TransactionType } from '../common/enums';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private walletTransactionsService: WalletTransactionsService,
  ) {}

  async createWallet(userId: string): Promise<WalletDocument> {
    const wallet = new this.walletModel({
      userId: new Types.ObjectId(userId),
      balance: 0,
    });
    return wallet.save();
  }

  async getWallet(userId: string): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async debit(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceId?: string,
    session?: any,
  ): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).session(session);

    if (!wallet) {
      throw new NotFoundException('Wallet not found'); 
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;
    await wallet.save({ session });

    await this.walletTransactionsService.create({
      userId,
      amount: -amount,
      type,
      referenceId,
    }, session);

    return wallet;
  }

  async credit(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceId?: string,
    session?: any,
  ): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).session(session);

    if (!wallet) {
       throw new NotFoundException('Wallet not found'); 
    }

    wallet.balance += amount;
    await wallet.save({ session });

    await this.walletTransactionsService.create({
      userId,
      amount,
      type,
      referenceId,
    }, session);

    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }
}
