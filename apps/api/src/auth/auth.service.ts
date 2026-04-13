import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}

async login(loginId: string, password: string) {
  if (!loginId || !password) {
    throw new BadRequestException('loginId와 password를 입력해 주세요.');
  }

  const user = await this.prisma.user.findUnique({
    where: { loginId },
  });

  if (!user) {
    throw new UnauthorizedException('존재하지 않는 사용자입니다.');
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
  }

  const payload = {
    sub: user.id,
    loginId: user.loginId,
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  return {
    accessToken,
    user: {
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  };
}
}