import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, type AuthTokensDTO, type AuthUserDTO } from '@acm/shared';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { allowDevStubs } from '../config/env';
import type { JwtPayload } from './auth.decorators';

interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  googleId?: string;
  createdAt: string;
}

// In-memory user store for Phase 1. Swap to Prisma User model when DB is wired.
@Injectable()
export class AuthService {
  private readonly users = new Map<string, UserRecord>();
  private readonly byEmail = new Map<string, string>();

  constructor(private readonly jwt: JwtService) {
    if (allowDevStubs()) {
      this.seedDemoUser();
    }
  }

  private seedDemoUser() {
    const id = 'user_demo_buyer';
    const record: UserRecord = {
      id,
      email: 'buyer@synthetica.dev',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      displayName: 'Demo Buyer',
      role: UserRole.BUYER,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, record);
    this.byEmail.set(record.email.toLowerCase(), id);

    const creatorId = 'user_demo_creator';
    const creator: UserRecord = {
      id: creatorId,
      email: 'creator@synthetica.dev',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      displayName: 'Demo Creator',
      role: UserRole.CREATOR,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(creatorId, creator);
    this.byEmail.set(creator.email.toLowerCase(), creatorId);

    const adminId = 'user_demo_admin';
    const admin: UserRecord = {
      id: adminId,
      email: 'admin@synthetica.dev',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      displayName: 'Platform Admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(adminId, admin);
    this.byEmail.set(admin.email.toLowerCase(), adminId);

    const freelancerId = 'user_demo_freelancer';
    const freelancer: UserRecord = {
      id: freelancerId,
      email: 'freelancer@synthetica.dev',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      displayName: 'Demo Freelancer',
      role: UserRole.FREELANCER,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(freelancerId, freelancer);
    this.byEmail.set(freelancer.email.toLowerCase(), freelancerId);
  }

  findById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  async register(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthTokensDTO> {
    const email = input.email.toLowerCase().trim();
    if (this.byEmail.has(email)) throw new ConflictException('Email already registered');
    if (input.password.length < 8) {
      throw new ConflictException('Password must be at least 8 characters');
    }
    if (input.displayName.trim().length < 2) {
      throw new ConflictException('Display name is too short');
    }

    const id = `user_${randomUUID()}`;
    const record: UserRecord = {
      id,
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      displayName: input.displayName.trim(),
      role: UserRole.BUYER,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, record);
    this.byEmail.set(email, id);
    return this.issueTokens(record);
  }

  async login(email: string, password: string): Promise<AuthTokensDTO> {
    const id = this.byEmail.get(email.toLowerCase().trim());
    if (!id) throw new UnauthorizedException('Invalid credentials');
    const user = this.users.get(id)!;
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  /** Dev/stub Google sign-in — disabled outside dev stubs. */
  async loginWithGoogle(input: {
    email: string;
    displayName: string;
    googleId: string;
  }): Promise<AuthTokensDTO> {
    if (!allowDevStubs()) {
      throw new ForbiddenException('Google sign-in is not enabled');
    }
    const email = input.email.toLowerCase().trim();
    let id = this.byEmail.get(email);
    if (!id) {
      id = `user_${randomUUID()}`;
      const record: UserRecord = {
        id,
        email,
        displayName: input.displayName,
        role: UserRole.BUYER,
        isActive: true,
        googleId: input.googleId,
        createdAt: new Date().toISOString(),
      };
      this.users.set(id, record);
      this.byEmail.set(email, id);
      return this.issueTokens(record);
    }
    const user = this.users.get(id)!;
    user.googleId = input.googleId;
    user.displayName = input.displayName;
    return this.issueTokens(user);
  }

  me(userId: string): AuthUserDTO {
    const user = this.users.get(userId);
    if (!user) throw new UnauthorizedException();
    return this.toDto(user);
  }

  becomeCreator(userId: string): AuthUserDTO {
    const user = this.users.get(userId);
    if (!user) throw new UnauthorizedException();
    if (user.role === UserRole.CREATOR || user.role === UserRole.ADMIN) {
      return this.toDto(user);
    }
    user.role = UserRole.CREATOR;
    return this.toDto(user);
  }

  becomeFreelancer(userId: string): AuthUserDTO {
    const user = this.users.get(userId);
    if (!user) throw new UnauthorizedException();
    if (user.role === UserRole.FREELANCER || user.role === UserRole.ADMIN) {
      return this.toDto(user);
    }
    user.role = UserRole.FREELANCER;
    return this.toDto(user);
  }

  private issueTokens(user: UserRecord): AuthTokensDTO {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
      user: this.toDto(user),
    };
  }

  private toDto(user: UserRecord): AuthUserDTO {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }
}
