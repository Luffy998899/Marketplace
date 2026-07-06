import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateFeedPostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  characterSlug!: string;

  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(2048)
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @IsBoolean()
  isReel?: boolean;
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body!: string;
}

export class FeedPageQueryDto {
  @IsOptional()
  page?: number;
}
