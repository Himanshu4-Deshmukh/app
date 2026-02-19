import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallet Transaction')
@ApiBearerAuth()
@Controller('wallet-transactions')
@UseGuards(JwtAuthGuard)
export class WalletTransactionsController {
  constructor(private readonly transactionsService: WalletTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet transaction details' })
  async getUserTransactions(@CurrentUser() user: any) {
    return this.transactionsService.getUserTransactions(user.userId);
  }
}
