import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { loginId: string; password: string }) {
    return this.authService.login(body.loginId, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return req.user;
  }
}