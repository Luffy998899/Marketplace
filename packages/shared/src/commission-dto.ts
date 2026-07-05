import type { EscrowStatus, UserRole } from './enums.js';

export const CommissionStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERED: 'DELIVERED',
  APPROVED: 'APPROVED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  DISPUTED: 'DISPUTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type CommissionStatus = (typeof CommissionStatus)[keyof typeof CommissionStatus];

export interface BidDTO {
  id: string;
  commissionId: string;
  freelancerId: string;
  freelancerName: string;
  amountMinor: number;
  currency: string;
  message?: string;
  etaDays?: number;
  createdAt: string;
}

export interface CommissionDTO {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  brief: string;
  budgetMinor: number;
  currency: string;
  deadline?: string;
  status: CommissionStatus;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  escrowStatus: EscrowStatus;
  deliverableUrl?: string;
  bids: BidDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionInput {
  title: string;
  brief: string;
  budgetMinor: number;
  deadline?: string;
}

export interface CreateBidInput {
  amountMinor: number;
  message?: string;
  etaDays?: number;
}

export interface BecomeFreelancerResult {
  role: UserRole;
  message: string;
}
