import {
  Controller,
  Get,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly jwt: JwtService,
  ) {}

  @Sse('receipts')
  receiptEvents(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException();

    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('관리자만 접근 가능합니다.');
    }

    return this.notifications.getStream();
  }
}
