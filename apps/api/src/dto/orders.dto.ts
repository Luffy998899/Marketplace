import { IsString, MaxLength, MinLength } from 'class-validator';

export class PurchaseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  characterSlug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  licenseTierId!: string;
}
