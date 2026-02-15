import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentRequest, PaymentRequestDocument } from './schemas/payment-request.schema';
import { CreatePaymentRequestDto, UpdatePaymentRequestDto } from './dto/create-payment-request.dto';
import { PaymentStatus, TransactionType } from '../common/enums';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(PaymentRequest.name)
    private paymentRequestModel: Model<PaymentRequestDocument>,
    private walletService: WalletService,
  ) {}

  async create(
    userId: string,
    createPaymentRequestDto: CreatePaymentRequestDto,
  ): Promise<PaymentRequestDocument> {
    const paymentRequest = new this.paymentRequestModel({
      userId: new Types.ObjectId(userId),
      ...createPaymentRequestDto,
      status: PaymentStatus.PENDING,
    });
    return paymentRequest.save();
  }

  async getUserRequests(userId: string): Promise<PaymentRequestDocument[]> {
    return this.paymentRequestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async getAllRequests(): Promise<PaymentRequestDocument[]> {
    return this.paymentRequestModel.find().populate('userId').sort({ createdAt: -1 });
  }

  async approve(
    requestId: string,
    adminRemark: string,
  ): Promise<PaymentRequestDocument> {
    const request = await this.paymentRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Payment request not found');
    }

    if (request.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment request is already processed');
    }

    request.status = PaymentStatus.APPROVED;
    request.adminRemark = adminRemark;
    await request.save();

    await this.walletService.credit(
      request.userId.toString(),
      request.amount,
      TransactionType.ADMIN_CREDIT,
      requestId,
    );

    return request;
  }

  async reject(
    requestId: string,
    adminRemark: string,
  ): Promise<PaymentRequestDocument> {
    const request = await this.paymentRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Payment request not found');
    }

    if (request.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment request is already processed');
    }

    request.status = PaymentStatus.REJECTED;
    request.adminRemark = adminRemark;
    return request.save();
  }
}
