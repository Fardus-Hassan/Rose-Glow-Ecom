import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('seo')
  resolve(
    @Query('path') path: string,
    @Query('locale') locale: 'en' | 'bn' = 'en',
  ) {
    return this.seo.resolve(path || '/', locale);
  }

  @Get('admin/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  list() {
    return this.seo.list();
  }

  @Put('admin/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsert(
    @Body()
    body: {
      path: string;
      titleEn?: string;
      titleBn?: string;
      descriptionEn?: string;
      descriptionBn?: string;
      keywords?: string;
      ogImage?: string;
      noIndex?: boolean;
      canonicalUrl?: string;
    },
  ) {
    return this.seo.upsert(body);
  }

  @Delete('admin/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Query('path') path: string) {
    return this.seo.remove(path.startsWith('/') ? path : `/${path}`);
  }
}
