import { Module } from '@nestjs/common';
import { EscrowServiceImpl } from './escrow.service';
import { InMemoryLedgerService } from './ledger.service';

// Default: in-memory ledger (zero-infra dev). Postgres-backed PrismaLedgerService
// lives in prisma-ledger.service.ts — wire it here when LEDGER_DRIVER=prisma and
// the DB package is compiled for CJS consumption.
@Module({
  providers: [InMemoryLedgerService, EscrowServiceImpl],
  exports: [InMemoryLedgerService, EscrowServiceImpl],
})
export class LedgerModule {}
