import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        loginId: true,
        name: true,
        company: true,
        phone: true,
        role: true,
        status: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { loginId: dto.loginId },
    });

    if (exists) {
      throw new BadRequestException("이미 사용 중인 아이디입니다.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        loginId: dto.loginId,
        passwordHash,
        name: dto.name,
        company: dto.company || null,
        phone: dto.phone || null,
        role: dto.role as UserRole,
        status: dto.status as UserStatus,
        memo: dto.memo || null,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        company: true,
        phone: true,
        role: true,
        status: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    let passwordHash: string | undefined;

    if (dto.password?.trim()) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        loginId: dto.loginId ?? undefined,
        passwordHash,
        name: dto.name ?? undefined,
        company: dto.company ?? undefined,
        phone: dto.phone ?? undefined,
        role: dto.role ? (dto.role as UserRole) : undefined,
        status: dto.status ? (dto.status as UserStatus) : undefined,
        memo: dto.memo ?? undefined,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        company: true,
        phone: true,
        role: true,
        status: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    const adminCount = await this.prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (user.role === "ADMIN" && adminCount <= 1) {
      throw new BadRequestException("관리자 계정은 최소 1개 이상 있어야 합니다.");
    }

    await this.prisma.user.delete({ where: { id } });

    return { success: true };
  }
}