import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { Bet, BetSchema } from './schemas/bet.schema';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
    WalletModule,
  ],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}
