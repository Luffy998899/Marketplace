import { Module } from '@nestjs/common';
import { StudioModule } from '../studio/studio.module';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';

@Module({
  imports: [StudioModule],
  controllers: [ModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
