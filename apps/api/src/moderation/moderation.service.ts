import { BadRequestException, Injectable } from '@nestjs/common';
import { StudioService } from '../studio/studio.service';

@Injectable()
export class ModerationService {
  constructor(private readonly studio: StudioService) {}

  listPending() {
    return this.studio.listPendingReview();
  }

  approve(listingId: string, moderatorId: string, notes?: string) {
    void moderatorId;
    return this.studio.approveListing(listingId, notes ?? 'Approved by moderator');
  }

  reject(listingId: string, moderatorId: string, notes: string) {
    void moderatorId;
    if (!notes?.trim()) throw new BadRequestException('Rejection notes are required');
    return this.studio.rejectListing(listingId, notes.trim());
  }
}
