import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      productCount,
      publishedProducts,
      orderCount,
      pendingOrders,
      revenueAgg,
      recentOrders,
      lowStock,
      reviewCount,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { published: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.product.findMany({
        where: { inStock: true, stock: { lte: 5 } },
        take: 6,
        orderBy: { stock: 'asc' },
        select: {
          id: true,
          nameEn: true,
          sku: true,
          stock: true,
          slug: true,
        },
      }),
      this.prisma.review.count({ where: { isPublished: true } }),
    ]);

    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return {
      stats: {
        productCount,
        publishedProducts,
        orderCount,
        pendingOrders,
        revenue: revenueAgg._sum.total ?? 0,
        reviewCount,
      },
      statusGroups: statusGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      recentOrders,
      lowStock,
    };
  }
}
