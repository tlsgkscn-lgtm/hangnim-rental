import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type ReceiptNotification = {
  receiptNumber: string;
  customerName: string;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  private readonly subject = new Subject<ReceiptNotification>();

  emit(notification: ReceiptNotification) {
    this.subject.next(notification);
  }

  getStream(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const sub = this.subject.subscribe({
        next: (data) => subscriber.next({ data } as MessageEvent),
        error: (err) => subscriber.error(err),
      });
      return () => sub.unsubscribe();
    });
  }
}
