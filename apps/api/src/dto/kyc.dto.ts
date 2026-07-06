import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitKycDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  legalName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode!: string;

  @IsBoolean()
  agreedToTerms!: boolean;
}
