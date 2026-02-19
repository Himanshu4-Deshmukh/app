import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bets')
@ApiBearerAuth()
@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new bet' })
  @ApiResponse({ status: 201, description: 'Bet placed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g. insufficient funds, slot closed).' })
  async create(@CurrentUser() user: any, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(user.userId, createBetDto);
  }

  @Get('my-bets')
  @ApiOperation({ summary: 'Get current user bets' })
  @ApiResponse({ status: 200, description: 'List of bets.' })
  async getUserBets(@CurrentUser() user: any) {
    return this.betsService.getUserBets(user.userId);
  }
}
