import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Slot, SlotDocument } from './schemas/slot.schema';
import { CreateSlotDto, SetWinningNumberDto } from './dto/create-slot.dto';
import { SlotStatus } from '../common/enums';
import { BetsService } from '../bets/bets.service';

@Injectable()
export class SlotsService {
  constructor(
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    private betsService: BetsService,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<SlotDocument> {
    const slot = new this.slotModel({
      ...createSlotDto,
      betAmount: createSlotDto.betAmount || 10,
      winAmount: createSlotDto.winAmount || 95,
      status: SlotStatus.OPEN,
    });
    return slot.save();
  }

  async findAll(): Promise<SlotDocument[]> {
    return this.slotModel.find().sort({ startTime: -1 });
  }

  async findById(id: string): Promise<SlotDocument> {
    const slot = await this.slotModel.findById(id);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return slot;
  }

  async getActiveSlot(): Promise<SlotDocument | null> {
    const now = new Date();
    const slot = await this.slotModel.findOne({
      status: SlotStatus.OPEN,
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    if (!slot) {
      // Logic: If no active slot found, let's log potential candidates to see why they failed
      //console.log(`No active slot found. Now: ${now.toISOString()}`);
      /*
      const openSlots = await this.slotModel.find({ status: SlotStatus.OPEN });
      openSlots.forEach(s => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        //console.log(`Slot ${s._id}: Start=${start.toISOString()}, End=${end.toISOString()} | Matches? ${start <= now && end >= now}`);
      });
      */
    }

    return slot;
  }

  async setWinningNumber(slotId: string, dto: SetWinningNumberDto): Promise<SlotDocument> {
    const slot = await this.findById(slotId);

    if (slot.status !== SlotStatus.OPEN) {
      throw new BadRequestException('Cannot set winning number for closed slot');
    }

    slot.winningNumber = dto.winningNumber;
    return slot.save();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processSlots() {
    const now = new Date();
    const slotsToClose = await this.slotModel.find({
      status: SlotStatus.OPEN,
      endTime: { $lt: now },
    });

    for (const slot of slotsToClose) {
      if (slot.winningNumber === undefined || slot.winningNumber === null) {
        console.log(`Slot ${slot._id} ended without winning number set`);
        slot.status = SlotStatus.CLOSED;
        await slot.save();
        continue;
      }

      slot.status = SlotStatus.CLOSED;
      await slot.save();

      await this.declareResult(slot._id.toString());
    }
  }

  async declareResult(slotId: string): Promise<void> {
    const slot = await this.findById(slotId);

    if (slot.status !== SlotStatus.CLOSED) {
      throw new BadRequestException('Slot must be closed before declaring result');
    }

    if (slot.winningNumber === undefined || slot.winningNumber === null) {
      throw new BadRequestException('Winning number must be set before declaring result');
    }

    await this.betsService.processSlotResults(slotId, slot.winningNumber, slot.winAmount);

    slot.status = SlotStatus.RESULT_DECLARED;
    await slot.save();

    console.log(`Result declared for slot ${slotId}, winning number: ${slot.winningNumber}`);
  }

  async getBetExposure(slotId: string): Promise<Record<number, { count: number; totalAmount: number }>> {
    return this.betsService.getSlotExposure(slotId);
  }
}
