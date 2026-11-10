import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic(take = 20) {
    return this.prisma.review.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take,
      include: { product: { select: { slug: true, nameEn: true, nameBn: true } } },
    });
  }

  findAdmin() {
    return this.prisma.review.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { product: { select: { slug: true, nameEn: true } } },
    });
  }

  create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({ data });
  }

  async update(id: string, data: Prisma.ReviewUncheckedUpdateInput) {
    await this.ensure(id);
    return this.prisma.review.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensure(id);
    return this.prisma.review.delete({ where: { id } });
  }

  private async ensure(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
