import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AttachmentType,
  CustomerType,
  PaymentMethod,
  Prisma,
  ReceiptStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptStatusDto } from './dto/update-receipt-status.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateReceiptNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `WR-${y}${m}-`;

    const count = await this.prisma.receipt.count({
      where: {
        receiptNumber: {
          startsWith: prefix,
        },
      },
    });

    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateReceiptDto, userId?: string) {
    if (!dto.products?.length) {
      throw new BadRequestException('최소 1개 이상의 상품이 필요합니다.');
    }

    const receiptNumber = await this.generateReceiptNumber();

    const data: Prisma.ReceiptCreateInput = {
      receiptNumber,
      status: ReceiptStatus.RECEIVED,

      customerName: dto.customerName,
      residentNoFront: dto.residentNoFront,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email || null,

      zipCode: dto.zipCode || null,
      address1: dto.address1,
      address2: dto.address2 || null,

      installHopeDate: dto.installHopeDate ? new Date(dto.installHopeDate) : null,
      memo: dto.memo || null,

      paymentMethod: dto.paymentMethod as PaymentMethod,
      paymentDay: dto.paymentDay ?? null,

      bankName: dto.bankName || null,
      bankAccount: dto.bankAccount || null,

      cardCompany: dto.cardCompany || null,
      cardNumber: dto.cardNumber || null,
      cardExpiry: dto.cardExpiry || null,

      paymentEtcMemo: dto.paymentEtcMemo || null,

      salesAgent: dto.salesAgent || null,
      receptionChannel: dto.receptionChannel || null,
      customerType: dto.customerType as CustomerType,

      createdBy: userId
        ? {
            connect: { id: userId },
          }
        : undefined,

      products: {
        create: dto.products.map((p) => ({
          brand: p.brandId ? { connect: { id: p.brandId } } : undefined,
          customBrandName: p.customBrandName || null,

          category: p.categoryId ? { connect: { id: p.categoryId } } : undefined,
          customCategoryName: p.customCategoryName || null,

          productName: p.productName,
          modelName: p.modelName,
          color: p.color,
          quantity: p.quantity ?? 1,

          managementType: p.managementType,
          promotion: p.promotion,
          contractPeriod: p.contractPeriod,
          rentalFee: p.rentalFee,
        })),
      },

      attachments: dto.attachments?.length
        ? {
            create: dto.attachments.map((a) => ({
              type: a.type as AttachmentType,
              fileName: a.fileName,
              fileUrl: a.fileUrl,
              mimeType: a.mimeType || null,
              fileSize: a.fileSize ?? null,
            })),
          }
        : undefined,

      histories: {
        create: {
          fromStatus: null,
          toStatus: ReceiptStatus.RECEIVED,
          changedBy: userId
            ? {
                connect: { id: userId },
              }
            : undefined,
          note: '접수 생성',
        },
      },
    };

    return this.prisma.receipt.create({
      data,
      include: {
        createdBy: true,
        products: {
          include: {
            brand: true,
            category: true,
          },
        },
        attachments: true,
        histories: true,
      },
    });
  }

  async findAll() {
    return this.prisma.receipt.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        products: {
          include: {
            brand: true,
            category: true,
          },
        },
        attachments: true,
      },
    });
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        createdBy: true,
        products: {
          include: {
            brand: true,
            category: true,
          },
        },
        attachments: true,
        histories: {
          include: {
            changedBy: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('접수를 찾을 수 없습니다.');
    }

    return receipt;
  }

  async updateStatus(id: string, dto: UpdateReceiptStatusDto, changedById?: string) {
    const existing = await this.prisma.receipt.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('접수를 찾을 수 없습니다.');
    }

    const nextStatus = dto.status as ReceiptStatus;

    await this.prisma.receiptStatusHistory.create({
      data: {
        receipt: { connect: { id } },
        fromStatus: existing.status,
        toStatus: nextStatus,
        changedBy: changedById ? { connect: { id: changedById } } : undefined,
        note: dto.note || null,
      },
    });

    return this.prisma.receipt.update({
      where: { id },
      data: {
        status: nextStatus,
      },
      include: {
        createdBy: true,
        products: {
          include: {
            brand: true,
            category: true,
          },
        },
        attachments: true,
      },
    });
  }
}