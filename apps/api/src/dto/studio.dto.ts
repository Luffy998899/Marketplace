import { AssetKind } from '@acm/shared';
import { IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  niche!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  style!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  gender!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  ethnicity!: string;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class UploadListingAssetDto {
  @IsIn(Object.values(AssetKind))
  kind!: AssetKind;

  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(2048)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}

export class RejectListingDto {
  @IsString()
  @MinLength(4)
  @MaxLength(2000)
  notes!: string;
}
