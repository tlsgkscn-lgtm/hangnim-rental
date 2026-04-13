import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LookupService {
  constructor(private prisma: PrismaService) {}

  async getLookupData() {
    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      brands,
      categories,
    };
  }
}