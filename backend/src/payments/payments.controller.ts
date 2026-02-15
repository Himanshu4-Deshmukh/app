import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('request')
  async createRequest(
    @CurrentUser() user: any,
    @Body() createPaymentRequestDto: CreatePaymentRequestDto,
  ) {
    return this.paymentsService.create(user.userId, createPaymentRequestDto);
  }

  @Get('my-requests')
  async getUserRequests(@CurrentUser() user: any) {
    return this.paymentsService.getUserRequests(user.userId);
  }
}
