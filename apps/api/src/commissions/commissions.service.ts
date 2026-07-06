import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommissionStatus,
  DEFAULT_CURRENCY,
  EscrowStatus,
  PLATFORM_TAKE_RATE_BPS,
  type BidDTO,
  type CommissionDTO,
  type CreateBidInput,
  type CreateCommissionInput,
} from '@acm/shared';
import { randomUUID } from 'node:crypto';
import { assertHttpsUrl } from '../common/safe-url';
import { AuthService } from '../auth/auth.service';
import { EscrowServiceImpl } from '../ledger/escrow.service';

interface CommissionRecord extends CommissionDTO {
  heldAmountMinor?: number;
}

@Injectable()
export class CommissionsService {
  private readonly commissions = new Map<string, CommissionRecord>();
  private readonly bids = new Map<string, BidDTO[]>();

  constructor(
    private readonly auth: AuthService,
    private readonly escrow: EscrowServiceImpl,
  ) {
    this.seedDemo();
  }

  private seedDemo() {
    const buyer = this.auth.findById('user_demo_buyer');
    if (!buyer) return;
    const id = 'comm_demo_001';
    const record: CommissionRecord = {
      id,
      buyerId: buyer.id,
      buyerName: buyer.displayName,
      title: 'Neon campaign renders — 5 poses',
      brief: 'Need 5 synthetic influencer renders in cyberpunk neon style for a streetwear drop.',
      budgetMinor: 15000,
      currency: DEFAULT_CURRENCY,
      status: CommissionStatus.OPEN,
      escrowStatus: EscrowStatus.NONE,
      bids: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.commissions.set(id, record);
    this.bids.set(id, []);
  }

  listOpen(): CommissionDTO[] {
    return this.listOpenPublic();
  }

  listOpenPublic(): CommissionDTO[] {
    return [...this.commissions.values()]
      .filter((c) => c.status === CommissionStatus.OPEN)
      .map((c) => this.toPublicDto(c));
  }

  listForBuyer(buyerId: string): CommissionDTO[] {
    return [...this.commissions.values()]
      .filter((c) => c.buyerId === buyerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((c) => this.withBids(c));
  }

  listForFreelancer(freelancerId: string): CommissionDTO[] {
    return [...this.commissions.values()]
      .filter(
        (c) =>
          c.assignedFreelancerId === freelancerId ||
          this.bids.get(c.id)?.some((b) => b.freelancerId === freelancerId),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((c) => this.withBids(c));
  }

  get(id: string): CommissionDTO {
    const record = this.requireCommission(id);
    return this.withBids(record);
  }

  getForViewer(id: string, viewerId: string, role: string): CommissionDTO {
    const record = this.requireCommission(id);
    const isBuyer = record.buyerId === viewerId;
    const isFreelancer =
      record.assignedFreelancerId === viewerId ||
      this.bids.get(id)?.some((b) => b.freelancerId === viewerId);
    const isAdmin = role === 'ADMIN' || role === 'MODERATOR';

    if (isBuyer || isFreelancer || isAdmin) {
      return this.withBids(record);
    }

    return this.toPublicDto(record);
  }

  create(buyerId: string, input: CreateCommissionInput): CommissionDTO {
    const buyer = this.auth.findById(buyerId);
    if (!buyer) throw new ForbiddenException();
    if (input.budgetMinor < 500) throw new BadRequestException('Minimum budget is $5.00');

    const id = `comm_${randomUUID()}`;
    const now = new Date().toISOString();
    const record: CommissionRecord = {
      id,
      buyerId,
      buyerName: buyer.displayName,
      title: input.title.trim(),
      brief: input.brief.trim(),
      budgetMinor: input.budgetMinor,
      currency: DEFAULT_CURRENCY,
      deadline: input.deadline,
      status: CommissionStatus.OPEN,
      escrowStatus: EscrowStatus.NONE,
      bids: [],
      createdAt: now,
      updatedAt: now,
    };
    this.commissions.set(id, record);
    this.bids.set(id, []);
    return this.withBids(record);
  }

  placeBid(freelancerId: string, commissionId: string, input: CreateBidInput): CommissionDTO {
    const record = this.requireCommission(commissionId);
    if (record.status !== CommissionStatus.OPEN) {
      throw new BadRequestException('Commission is not accepting bids');
    }
    const freelancer = this.auth.findById(freelancerId);
    if (!freelancer) throw new ForbiddenException();

    if (input.amountMinor < 500) {
      throw new BadRequestException('Minimum bid is $5.00');
    }
    if (input.amountMinor > record.budgetMinor * 2) {
      throw new BadRequestException('Bid exceeds maximum allowed amount');
    }

    const list = this.bids.get(commissionId)!;
    if (list.some((b) => b.freelancerId === freelancerId)) {
      throw new BadRequestException('You already placed a bid');
    }

    const bid: BidDTO = {
      id: `bid_${randomUUID()}`,
      commissionId,
      freelancerId,
      freelancerName: freelancer.displayName,
      amountMinor: input.amountMinor,
      currency: DEFAULT_CURRENCY,
      message: input.message,
      etaDays: input.etaDays,
      createdAt: new Date().toISOString(),
    };
    list.push(bid);
    record.updatedAt = new Date().toISOString();
    return this.withBids(record);
  }

  async assignBid(buyerId: string, commissionId: string, bidId: string): Promise<CommissionDTO> {
    const record = this.requireCommission(commissionId);
    if (record.buyerId !== buyerId) throw new ForbiddenException();
    if (record.status !== CommissionStatus.OPEN) {
      throw new BadRequestException('Commission already assigned');
    }

    const bid = this.bids.get(commissionId)?.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException('Bid not found');

    await this.escrow.hold(commissionId, { amountMinor: bid.amountMinor, currency: bid.currency }, buyerId);

    record.status = CommissionStatus.IN_PROGRESS;
    record.assignedFreelancerId = bid.freelancerId;
    record.assignedFreelancerName = bid.freelancerName;
    record.escrowStatus = EscrowStatus.HELD;
    record.heldAmountMinor = bid.amountMinor;
    record.updatedAt = new Date().toISOString();
    return this.withBids(record);
  }

  submitDelivery(freelancerId: string, commissionId: string, deliverableUrl: string): CommissionDTO {
    const record = this.requireCommission(commissionId);
    if (record.assignedFreelancerId !== freelancerId) throw new ForbiddenException();
    if (record.status !== CommissionStatus.IN_PROGRESS && record.status !== CommissionStatus.REVISION_REQUESTED) {
      throw new BadRequestException('Cannot submit delivery in current status');
    }

    record.status = CommissionStatus.DELIVERED;
    record.deliverableUrl = assertHttpsUrl(deliverableUrl, 'deliverableUrl');
    record.updatedAt = new Date().toISOString();
    return this.withBids(record);
  }

  async approveDelivery(buyerId: string, commissionId: string): Promise<CommissionDTO> {
    const record = this.requireCommission(commissionId);
    if (record.buyerId !== buyerId) throw new ForbiddenException();
    if (record.status !== CommissionStatus.DELIVERED) {
      throw new BadRequestException('No delivery to approve');
    }
    if (!record.assignedFreelancerId) throw new BadRequestException('No freelancer assigned');

    await this.escrow.release({
      orderId: commissionId,
      payeeUserId: record.assignedFreelancerId,
      takeRateBps: PLATFORM_TAKE_RATE_BPS,
    });

    record.status = CommissionStatus.COMPLETED;
    record.escrowStatus = EscrowStatus.RELEASED;
    record.updatedAt = new Date().toISOString();
    return this.withBids(record);
  }

  requestRevision(buyerId: string, commissionId: string, notes: string): CommissionDTO {
    const record = this.requireCommission(commissionId);
    if (record.buyerId !== buyerId) throw new ForbiddenException();
    if (record.status !== CommissionStatus.DELIVERED) {
      throw new BadRequestException('Can only request revision on delivered work');
    }
    record.status = CommissionStatus.REVISION_REQUESTED;
    record.brief = `${record.brief}\n\n--- Revision requested ---\n${notes}`;
    record.updatedAt = new Date().toISOString();
    return this.withBids(record);
  }

  private requireCommission(id: string): CommissionRecord {
    const record = this.commissions.get(id);
    if (!record) throw new NotFoundException('Commission not found');
    return record;
  }

  private withBids(record: CommissionRecord): CommissionDTO {
    return { ...record, bids: [...(this.bids.get(record.id) ?? [])] };
  }

  /** Public gig board view — no buyer IDs, deliverables, or bid details. */
  private toPublicDto(record: CommissionRecord): CommissionDTO {
    const bids = this.bids.get(record.id) ?? [];
    return {
      id: record.id,
      buyerId: '',
      buyerName: record.buyerName,
      title: record.title,
      brief: record.brief,
      budgetMinor: record.budgetMinor,
      currency: record.currency,
      deadline: record.deadline,
      status: record.status,
      escrowStatus: record.escrowStatus,
      bidCount: bids.length,
      bids: [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
