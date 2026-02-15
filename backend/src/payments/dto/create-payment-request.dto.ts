import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  screenshotUrl: string;
}

export class UpdatePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  adminRemark: string;
}
