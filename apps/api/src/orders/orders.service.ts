import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextOrderNumber() {
    const count = await this.prisma.order.count();
    const stamp = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    return `RG-${stamp}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order needs at least one item');
    }

    const items = dto.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = dto.shippingFee ?? 0;
    const discount = dto.discount ?? 0;
    const total = Math.max(0, subtotal + shippingFee - discount);

    return this.prisma.order.create({
      data: {
        orderNumber: await this.nextOrderNumber(),
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        addressLine: dto.addressLine,
        city: dto.city,
        district: dto.district,
        note: dto.note,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.COD,
        subtotal,
        shippingFee,
        discount,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  findAll(params: { status?: OrderStatus; q?: string }) {
    const where: Prisma.OrderWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { orderNumber: { contains: params.q, mode: 'insensitive' } },
              { customerName: { contains: params.q, mode: 'insensitive' } },
              { customerPhone: { contains: params.q, mode: 'insensitive' } },
              { customerEmail: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: true },
    });
  }
}
