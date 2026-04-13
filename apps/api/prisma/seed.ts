import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin1234', 10);

  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {
      passwordHash,
      name: '관리자',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      company: '우리집렌탈',
      phone: '010-0000-0000',
      memo: '기본 관리자 계정',
    },
    create: {
      loginId: 'admin',
      passwordHash,
      name: '관리자',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      company: '우리집렌탈',
      phone: '010-0000-0000',
      memo: '기본 관리자 계정',
    },
  });

  console.log('✅ seed 완료: admin 계정 생성/갱신');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });