import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet details' })
  async getWallet(@CurrentUser() user: any) {
    return this.walletService.getWallet(user.userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current balance' })
  async getBalance(@CurrentUser() user: any) {
    const balance = await this.walletService.getBalance(user.userId);
    return { balance };
  }
}
