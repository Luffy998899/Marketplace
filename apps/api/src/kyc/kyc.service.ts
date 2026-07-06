import { BadRequestException, Injectable } from '@nestjs/common';
import { allowDevStubs } from '../config/env';

export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycRecord {
  userId: string;
  legalName: string;
  countryCode: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface KycStatusDto {
  status: KycStatus;
  legalName?: string;
  countryCode?: string;
  submittedAt?: string;
  message?: string;
}

@Injectable()
export class KycService {
  private readonly records = new Map<string, KycRecord>();

  constructor() {
    if (allowDevStubs()) {
      this.seedDemoKyc();
    }
  }

  private seedDemoKyc() {
    for (const userId of [
      'user_demo_buyer',
      'user_demo_creator',
      'user_demo_admin',
      'user_demo_freelancer',
    ]) {
      this.records.set(userId, {
        userId,
        legalName: 'Demo Verified User',
        countryCode: 'US',
        status: 'APPROVED',
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      });
    }
  }

  getStatus(userId: string): KycStatusDto {
    const record = this.records.get(userId);
    if (!record) {
      return { status: 'NONE', message: 'Complete identity verification to unlock creator and freelancer roles.' };
    }
    return {
      status: record.status,
      legalName: record.legalName,
      countryCode: record.countryCode,
      submittedAt: record.submittedAt,
      message:
        record.status === 'APPROVED'
          ? 'Identity verified.'
          : record.status === 'PENDING'
            ? 'Verification in review.'
            : record.rejectionReason,
    };
  }

  isApproved(userId: string): boolean {
    return this.records.get(userId)?.status === 'APPROVED';
  }

  submit(userId: string, input: { legalName: string; countryCode: string; agreedToTerms: boolean }): KycStatusDto {
    if (!input.agreedToTerms) {
      throw new BadRequestException('You must agree to the terms');
    }

    const existing = this.records.get(userId);
    if (existing?.status === 'APPROVED') {
      return this.getStatus(userId);
    }

    const now = new Date().toISOString();
    const record: KycRecord = {
      userId,
      legalName: input.legalName.trim(),
      countryCode: input.countryCode.trim().toUpperCase(),
      status: 'PENDING',
      submittedAt: now,
    };

    // Simulated KYC: instant approval in dev stubs; otherwise stays pending until admin review.
    if (allowDevStubs()) {
      record.status = 'APPROVED';
      record.reviewedAt = now;
    }

    this.records.set(userId, record);
    return this.getStatus(userId);
  }

  /** Admin/dev: approve pending KYC */
  approve(userId: string): KycStatusDto {
    const record = this.records.get(userId);
    if (!record) throw new BadRequestException('No KYC submission found');
    record.status = 'APPROVED';
    record.reviewedAt = new Date().toISOString();
    return this.getStatus(userId);
  }
}
