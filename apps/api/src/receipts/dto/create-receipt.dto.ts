export class CreateReceiptProductDto {
  brandId?: string;
  customBrandName?: string;

  categoryId?: string;
  customCategoryName?: string;

  productName!: string;
  modelName!: string;
  color!: string;
  quantity!: number;

  managementType!: string;
  promotion!: string;
  contractPeriod!: string;
  rentalFee!: string;
}

export class CreateReceiptAttachmentDto {
  type!: 'BUSINESS_DOC' | 'ETC_DOC' | 'PERSONAL_DOC';
  fileName!: string;
  fileUrl!: string;
  mimeType?: string;
  fileSize?: number;
}

export class CreateReceiptDto {
  customerName!: string;
  residentNoFront!: string;
  gender!: string;
  phone!: string;
  email?: string;

  zipCode?: string;
  address1!: string;
  address2?: string;

  installHopeDate?: string;
  memo?: string;

  paymentMethod!: 'BANK' | 'CARD' | 'ETC';
  paymentDay?: number;

  bankName?: string;
  bankAccount?: string;

  cardCompany?: string;
  cardNumber?: string;
  cardExpiry?: string;

  paymentEtcMemo?: string;

  salesAgent?: string;
  receptionChannel?: string;
  customerType!: 'PERSONAL' | 'BUSINESS' | 'ETC';

  products!: CreateReceiptProductDto[];
  attachments?: CreateReceiptAttachmentDto[];
}