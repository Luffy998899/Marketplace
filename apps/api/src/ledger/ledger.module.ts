import { Module } from '@nestjs/common';
import { EscrowServiceImpl } from './escrow.service';
import { InMemoryLedgerService } from './ledger.service';

// Bound to concrete classes for Phase 1. When persistence lands, rebind the
// `Ledger` / `EscrowService` tokens to Prisma-backed implementations here.
@Module({
  providers: [InMemoryLedgerService, EscrowServiceImpl],
  exports: [InMemoryLedgerService, EscrowServiceImpl],
})
export class LedgerModule {}
