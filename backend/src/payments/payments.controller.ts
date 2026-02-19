import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Submit a payment request' })
  async createRequest(
    @CurrentUser() user: any,
    @Body() createPaymentRequestDto: CreatePaymentRequestDto,
  ) {
    return this.paymentsService.create(user.userId, createPaymentRequestDto);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get my payment requests' })
  async getUserRequests(@CurrentUser() user: any) {
    return this.paymentsService.getUserRequests(user.userId);
  }
}
