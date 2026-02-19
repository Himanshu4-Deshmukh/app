import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { CreditWalletDto } from './dto/admin.dto';
import { UpdatePaymentRequestDto } from '../payments/dto/create-payment-request.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('bets')
  @ApiOperation({ summary: 'Get all bets' })
  async getAllBets() {
    return this.adminService.getAllBets();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions' })
  async getAllTransactions() {
    return this.adminService.getAllTransactions();
  }

  @Get('payment-requests')
  @ApiOperation({ summary: 'Get all payment requests' })
  async getAllPaymentRequests() {
    return this.adminService.getAllPaymentRequests();
  }

  @Post('payment-requests/:id/approve')
  @ApiOperation({ summary: 'Approve a payment request' })
  async approvePayment(@Param('id') id: string, @Body() dto: UpdatePaymentRequestDto) {
    return this.adminService.approvePayment(id, dto.adminRemark);
  }

  @Post('payment-requests/:id/reject')
  @ApiOperation({ summary: 'Reject a payment request' })
  async rejectPayment(@Param('id') id: string, @Body() dto: UpdatePaymentRequestDto) {
    return this.adminService.rejectPayment(id, dto.adminRemark);
  }

  @Post('credit-wallet')
  @ApiOperation({ summary: 'Manually credit a user wallet' })
  async creditWallet(@Body() creditWalletDto: CreditWalletDto) {
    return this.adminService.creditWallet(creditWalletDto);
  }

  @Get('slots/:id/profit')
  @ApiOperation({ summary: 'Get profit stats for a slot' })
  async getSlotProfit(@Param('id') id: string) {
    return this.adminService.getSlotProfit(id);
  }
}
