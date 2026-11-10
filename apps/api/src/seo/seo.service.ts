import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.seoEntry.findMany({ orderBy: { path: 'asc' } });
  }

  async getByPath(path: string) {
    const entry = await this.prisma.seoEntry.findUnique({ where: { path } });
    if (!entry) throw new NotFoundException('SEO entry not found');
    return entry;
  }

  upsert(data: {
    path: string;
    titleEn?: string;
    titleBn?: string;
    descriptionEn?: string;
    descriptionBn?: string;
    keywords?: string;
    ogImage?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
  }) {
    const { path, ...rest } = data;
    return this.prisma.seoEntry.upsert({
      where: { path },
      create: { path, ...rest },
      update: rest,
    });
  }

  async remove(path: string) {
    await this.getByPath(path);
    return this.prisma.seoEntry.delete({ where: { path } });
  }

  /** Public SEO payload for storefront head tags */
  async resolve(path: string, locale: 'en' | 'bn' = 'en') {
    const entry = await this.prisma.seoEntry.findUnique({ where: { path } });
    if (!entry) return null;
    return {
      path: entry.path,
      title: locale === 'bn' ? entry.titleBn || entry.titleEn : entry.titleEn,
      description:
        locale === 'bn'
          ? entry.descriptionBn || entry.descriptionEn
          : entry.descriptionEn,
      keywords: entry.keywords,
      ogImage: entry.ogImage,
      noIndex: entry.noIndex,
      canonicalUrl: entry.canonicalUrl || path,
    };
  }
}
