import { Module } from '@nestjs/common';
import { StudioModule } from '../studio/studio.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [StudioModule],
  controllers: [CharactersController],
  providers: [CharactersService],
})
export class CharactersModule {}
