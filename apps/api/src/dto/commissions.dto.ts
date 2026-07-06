import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCommissionDto {
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  brief!: string;

  @IsInt()
  @Min(500)
  @Max(50_000_000)
  budgetMinor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  deadline?: string;
}

export class CreateBidDto {
  @IsInt()
  @Min(500)
  @Max(50_000_000)
  amountMinor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  etaDays?: number;
}

export class DeliverCommissionDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(2048)
  deliverableUrl!: string;
}

export class RevisionDto {
  @IsString()
  @MinLength(4)
  @MaxLength(2000)
  notes!: string;
}

export class ModerationNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
