import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReceiptsModule } from './receipts/receipts.module';

@Module({
  imports: [PrismaModule, AuthModule, ReceiptsModule],
})
export class AppModule {}