import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ReceiptsModule } from "./receipts/receipts.module";
import { UsersModule } from "./users/users.module";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";
import { LookupModule } from "./lookup/lookup.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ReceiptsModule,
    UsersModule,
    BrandsModule,
    CategoriesModule,
    LookupModule
  ],
})
export class AppModule {}