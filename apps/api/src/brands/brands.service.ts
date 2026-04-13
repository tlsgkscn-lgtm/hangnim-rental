import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BulkSaveBrandsDto } from "./dto/bulk-save-brands.dto";

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async bulkSave(dto: BulkSaveBrandsDto) {
    const existing = await this.prisma.brand.findMany();
    const existingIds = new Set(existing.map((b) => b.id));
    const incomingIds = new Set(dto.brands.filter((b) => b.id).map((b) => b.id!));

    for (const brand of dto.brands) {
      if (brand.id && existingIds.has(brand.id)) {
        await this.prisma.brand.update({
          where: { id: brand.id },
          data: {
            name: brand.name,
            color: brand.color,
            sortOrder: brand.sortOrder,
            isActive: true,
          },
        });
      } else {
        await this.prisma.brand.create({
          data: {
            code: `brand_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: brand.name,
            color: brand.color,
            sortOrder: brand.sortOrder,
            isActive: true,
          },
        });
      }
    }

    for (const brand of existing) {
      if (!incomingIds.has(brand.id) && brand.code !== "etc") {
        await this.prisma.brand.update({
          where: { id: brand.id },
          data: { isActive: false },
        });
      }
    }

    return this.findAll();
  }
}