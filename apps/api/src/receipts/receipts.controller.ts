import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ReceiptsService } from "./receipts.service";
import { CreateReceiptDto } from "./dto/create-receipt.dto";
import { UpdateReceiptStatusDto } from "./dto/update-receipt-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@UseGuards(JwtAuthGuard)
@Controller("receipts")
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  create(@Body() dto: CreateReceiptDto, @Req() req: any) {
    return this.receiptsService.create(dto, req.user?.id);
  }

  @Get()
  findAll() {
    return this.receiptsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.receiptsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateReceiptStatusDto,
    @Req() req: any,
  ) {
    return this.receiptsService.updateStatus(id, dto, req.user?.id);
  }
}