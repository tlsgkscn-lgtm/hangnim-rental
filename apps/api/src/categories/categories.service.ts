import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BulkSaveCategoriesDto } from "./dto/bulk-save-categories.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async bulkSave(dto: BulkSaveCategoriesDto) {
    const existing = await this.prisma.category.findMany();

    for (const category of existing) {
      await this.prisma.category.update({
        where: { id: category.id },
        data: { isActive: false },
      });
    }

    for (const category of dto.categories) {
      const found = await this.prisma.category.findFirst({
        where: { name: category.name },
      });

      if (found) {
        await this.prisma.category.update({
          where: { id: found.id },
          data: {
            name: category.name,
            sortOrder: category.sortOrder,
            isActive: true,
          },
        });
      } else {
        await this.prisma.category.create({
          data: {
            code: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: category.name,
            sortOrder: category.sortOrder,
            isActive: true,
          },
        });
      }
    }

    return this.findAll();
  }
}