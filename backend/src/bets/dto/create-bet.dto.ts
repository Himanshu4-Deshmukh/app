import { IsNotEmpty, IsNumber, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBetDto {
  @ApiProperty({ example: '65c71b...', description: 'ID of the slot to bet on' })
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @ApiProperty({ example: 42, description: 'Number to bet on (0-99)', minimum: 0, maximum: 99 })
  @IsNumber()
  @Min(0)
  @Max(99)
  number: number;
}
