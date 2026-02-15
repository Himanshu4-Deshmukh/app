import { IsNotEmpty, IsNumber, Min, Max, IsString } from 'class-validator';

export class CreateBetDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsNumber()
  @Min(0)
  @Max(99)
  number: number;
}
