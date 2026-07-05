import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StudioModule } from '../studio/studio.module';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [AuthModule, StudioModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
