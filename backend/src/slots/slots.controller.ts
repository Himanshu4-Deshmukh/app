import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto, SetWinningNumberDto } from './dto/create-slot.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Slots')
@ApiBearerAuth()
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new slot (Admin)' })
  async create(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.create(createSlotDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all slots' })
  async findAll() {
    return this.slotsService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current active slot' })
  async getActive() {
    return this.slotsService.getActiveSlot();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get slot by ID' })
  async findOne(@Param('id') id: string) {
    return this.slotsService.findById(id);
  }

  @Post(':id/winning-number')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Set winning number for a slot (Admin)' })
  async setWinningNumber(@Param('id') id: string, @Body() dto: SetWinningNumberDto) {
    return this.slotsService.setWinningNumber(id, dto);
  }

  @Get(':id/exposure')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get bet exposure for a slot (Admin)' })
  async getExposure(@Param('id') id: string) {
    return this.slotsService.getBetExposure(id);
  }
}
