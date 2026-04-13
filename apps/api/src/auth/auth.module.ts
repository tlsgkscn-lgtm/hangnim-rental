import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma/prisma.service";
import { JwtStrategy } from "./jwt.strategy";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    PassportModule,
      JwtModule.register({
    secret: process.env.JWT_SECRET ?? "super-secret-key",
    signOptions: {
      expiresIn: "1d",
    },
  }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, RolesGuard],
  exports: [JwtModule, PassportModule, RolesGuard],
})
export class AuthModule {}