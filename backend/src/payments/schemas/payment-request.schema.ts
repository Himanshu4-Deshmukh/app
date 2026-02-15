import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../common/enums';

export type PaymentRequestDocument = PaymentRequest & Document;

@Schema({ timestamps: true })
export class PaymentRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true })
  screenshotUrl: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String })
  adminRemark?: string;
}

export const PaymentRequestSchema = SchemaFactory.createForClass(PaymentRequest);
