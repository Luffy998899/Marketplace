import { PaymentProvider } from '@acm/shared';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { MAX_TOP_UP_MINOR, MIN_TOP_UP_MINOR } from '@acm/shared';

export class TopUpDto {
  @IsInt()
  @Min(MIN_TOP_UP_MINOR)
  @Max(MAX_TOP_UP_MINOR)
  amountMinor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsIn(Object.values(PaymentProvider))
  provider?: PaymentProvider;
}
