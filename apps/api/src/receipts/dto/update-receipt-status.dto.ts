export class UpdateReceiptStatusDto {
  status!: 'RECEIVED' | 'CONSULTING' | 'CONTRACTED' | 'INSTALLED' | 'CANCELED';
  note?: string;
}