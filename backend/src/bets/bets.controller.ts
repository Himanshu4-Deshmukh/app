import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(user.userId, createBetDto);
  }

  @Get('my-bets')
  async getUserBets(@CurrentUser() user: any) {
    return this.betsService.getUserBets(user.userId);
  }
}
