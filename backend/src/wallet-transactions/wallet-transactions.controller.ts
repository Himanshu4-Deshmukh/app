import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Controller('wallet-transactions')
@UseGuards(JwtAuthGuard)
export class WalletTransactionsController {
  constructor(private readonly transactionsService: WalletTransactionsService) {}

  @Get()
  async getUserTransactions(@CurrentUser() user: any) {
    return this.transactionsService.getUserTransactions(user.userId);
  }
}
