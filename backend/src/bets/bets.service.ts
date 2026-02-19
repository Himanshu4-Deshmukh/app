import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Bet, BetDocument } from './schemas/bet.schema';
import { CreateBetDto } from './dto/create-bet.dto';
import { WalletService } from '../wallet/wallet.service';
import { BetStatus, TransactionType, SlotStatus } from '../common/enums';

@Injectable()
export class BetsService {
  private readonly logger = new Logger(BetsService.name);

  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    private walletService: WalletService,
  ) {}

  private async executeInTransaction<T>(
    operation: (session: ClientSession | null) => Promise<T>,
  ): Promise<T> {
    const session = await this.betModel.db.startSession();
    let transactionStarted = false;

    try {
      session.startTransaction();
      transactionStarted = true;
      
      const result = await operation(session);
      
      await session.commitTransaction();
      return result;
    } catch (error) {
      if (transactionStarted) {
        await session.abortTransaction();
      }

      // Check for "Transaction numbers are only allowed on a replica set member or mongos"
      // Error code 20 is IllegalOperation, but relying on message is safer for this specific case
      if (error.message && error.message.includes('Transaction numbers are only allowed on a replica set member')) {
        this.logger.warn('MongoDB Standalone confirmed. Retrying operation without transaction.');
        return operation(null);
      }

      throw error;
    } finally {
      session.endSession();
    }
  }

  async create(userId: string, createBetDto: CreateBetDto): Promise<BetDocument> {
    return this.executeInTransaction(async (session) => {
    const { Slot } = require('../slots/schemas/slot.schema');
    const slotModel = this.betModel.db.model('Slot');
    const slot = await slotModel.findById(createBetDto.slotId).session(session);

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== SlotStatus.OPEN) {
      throw new BadRequestException('Betting is closed for this slot');
    }

    const now = new Date();
    if (now < slot.startTime || now > slot.endTime) {
      throw new BadRequestException('Slot is not active');
    }

    const betAmount = slot.betAmount || 10;

    await this.walletService.debit(
        userId, 
        betAmount, 
        TransactionType.BET, 
        createBetDto.slotId, 
        session
      );

    const bet = new this.betModel({
      slotId: new Types.ObjectId(createBetDto.slotId),
      userId: new Types.ObjectId(userId),
      number: createBetDto.number,
      amount: betAmount,
      status: BetStatus.PENDING,
    });

      return bet.save({ session });
    });
  }

  async getUserBets(userId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('slotId')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async getSlotBets(slotId: string): Promise<BetDocument[]> {
    return this.betModel.find({ slotId: new Types.ObjectId(slotId) });
  }

  async getSlotExposure(slotId: string): Promise<Record<number, { count: number; totalAmount: number }>> {
    const bets = await this.getSlotBets(slotId);
    const exposure: Record<number, { count: number; totalAmount: number }> = {};

    for (let i = 0; i <= 99; i++) {
      exposure[i] = { count: 0, totalAmount: 0 };
    }

    bets.forEach((bet) => {
      exposure[bet.number].count++;
      exposure[bet.number].totalAmount += bet.amount;
    });

    return exposure;
  }

  async processSlotResults(slotId: string, winningNumber: number, winAmount: number): Promise<void> {
    return this.executeInTransaction(async (session) => {
      const bets = await this.betModel.find({ slotId: new Types.ObjectId(slotId) }).session(session);

    for (const bet of bets) {
      if (bet.number === winningNumber) {
        bet.status = BetStatus.WON;
        await this.walletService.credit(
          bet.userId.toString(),
          winAmount,
          TransactionType.WIN,
          slotId,
          session,
        );
      } else {
        bet.status = BetStatus.LOST;
      }
      await bet.save({ session });
    }
  });
  }

  async getAllBets(): Promise<BetDocument[]> {
    return this.betModel.find().populate(['slotId', 'userId']).sort({ createdAt: -1 }).limit(500);
  }
}
