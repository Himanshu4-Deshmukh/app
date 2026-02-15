import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BetStatus } from '../../common/enums';

export type BetDocument = Bet & Document;

@Schema({ timestamps: true })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'Slot', required: true })
  slotId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 99 })
  number: number;

  @Prop({ required: true, default: 10 })
  amount: number;

  @Prop({ required: true, enum: BetStatus, default: BetStatus.PENDING })
  status: BetStatus;
}

export const BetSchema = SchemaFactory.createForClass(Bet);
