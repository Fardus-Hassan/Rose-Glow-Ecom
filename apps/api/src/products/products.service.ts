import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private include = {
    category: true,
    media: { orderBy: { sortOrder: 'asc' as const } },
  };

  findPublic(params: {
    category?: string;
    featured?: boolean;
    q?: string;
    take?: number;
  }) {
    const where: Prisma.ProductWhereInput = {
      published: true,
      ...(params.featured ? { featured: true } : {}),
      ...(params.category
        ? { category: { slug: params.category, isActive: true } }
        : {}),
      ...(params.q
        ? {
            OR: [
              { nameEn: { contains: params.q, mode: 'insensitive' } },
              { nameBn: { contains: params.q, mode: 'insensitive' } },
              { sku: { contains: params.q, mode: 'insensitive' } },
              { slug: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.product.findMany({
      where,
      include: this.include,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: params.take ?? 100,
    });
  }

  async findOnePublic(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, published: true },
      include: this.include,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  findAdmin(q?: string) {
    return this.prisma.product.findMany({
      where: q
        ? {
            OR: [
              { nameEn: { contains: q, mode: 'insensitive' } },
              { nameBn: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: this.include,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.include,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: UpsertProductDto) {
    const { media = [], colors = [], ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        colors: colors as unknown as Prisma.InputJsonValue,
        media: {
          create: media.map((m, i) => ({
            ...m,
            sortOrder: m.sortOrder ?? i,
          })),
        },
      },
      include: this.include,
    });
  }

  async update(id: string, dto: UpsertProductDto) {
    await this.findOneAdmin(id);
    const { media, colors, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (media) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        await tx.productMedia.createMany({
          data: media.map((m, i) => ({
            productId: id,
            type: m.type,
            src: m.src,
            poster: m.poster,
            altEn: m.altEn ?? '',
            altBn: m.altBn ?? '',
            sortOrder: m.sortOrder ?? i,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...rest,
          ...(colors
            ? { colors: colors as unknown as Prisma.InputJsonValue }
            : {}),
        },
        include: this.include,
      });
    });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
