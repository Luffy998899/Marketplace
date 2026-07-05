import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchModule } from '../search/search.module';
import { StudioModule } from '../studio/studio.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [StudioModule, PrismaModule, SearchModule],
  controllers: [CharactersController],
  providers: [CharactersService],
})
export class CharactersModule {}
