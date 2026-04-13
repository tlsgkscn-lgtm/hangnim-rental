import { Controller, Get, UseGuards } from "@nestjs/common";
import { LookupService } from "./lookup.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("lookup")
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get()
  getLookup() {
    return this.lookupService.getLookupData();
  }
}