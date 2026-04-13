import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { BulkSaveBrandsDto } from "./dto/bulk-save-brands.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Put("bulk")
  bulkSave(@Body() dto: BulkSaveBrandsDto) {
    return this.brandsService.bulkSave(dto);
  }
}