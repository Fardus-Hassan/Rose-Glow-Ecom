import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  listBlocks(group?: string) {
    return this.prisma.contentBlock.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: 'asc' }, { label: 'asc' }],
    });
  }

  async getBlock(key: string) {
    const block = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (!block) throw new NotFoundException(`Content "${key}" not found`);
    return block;
  }

  upsertBlock(data: {
    key: string;
    label: string;
    group?: string;
    value: Prisma.InputJsonValue;
  }) {
    return this.prisma.contentBlock.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        label: data.label,
        group: data.group ?? 'general',
        value: data.value,
      },
      update: {
        label: data.label,
        group: data.group ?? 'general',
        value: data.value,
      },
    });
  }

  listPages() {
    return this.prisma.page.findMany({ orderBy: { slug: 'asc' } });
  }

  async getPage(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  upsertPage(data: {
    slug: string;
    titleEn: string;
    titleBn: string;
    bodyEn?: string;
    bodyBn?: string;
    seoTitleEn?: string;
    seoTitleBn?: string;
    seoDescriptionEn?: string;
    seoDescriptionBn?: string;
    ogImage?: string;
    isPublished?: boolean;
  }) {
    return this.prisma.page.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
  }

  listSettings() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  upsertSetting(key: string, value: Prisma.InputJsonValue) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
