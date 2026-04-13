import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { BulkSaveCategoriesDto } from "./dto/bulk-save-categories.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Put("bulk")
  bulkSave(@Body() dto: BulkSaveCategoriesDto) {
    return this.categoriesService.bulkSave(dto);
  }
}