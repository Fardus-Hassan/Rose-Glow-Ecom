import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ContentService } from './content.service';

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('content/blocks')
  publicBlocks(@Query('group') group?: string) {
    return this.content.listBlocks(group);
  }

  @Get('content/blocks/:key')
  publicBlock(@Param('key') key: string) {
    return this.content.getBlock(key);
  }

  @Get('pages/:slug')
  publicPage(@Param('slug') slug: string) {
    return this.content.getPage(slug);
  }

  @Get('admin/content/blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  adminBlocks(@Query('group') group?: string) {
    return this.content.listBlocks(group);
  }

  @Put('admin/content/blocks/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertBlock(
    @Param('key') key: string,
    @Body()
    body: { label: string; group?: string; value: Record<string, unknown> },
  ) {
    return this.content.upsertBlock({
      key,
      label: body.label,
      group: body.group,
      value: body.value as Prisma.InputJsonValue,
    });
  }

  @Get('admin/pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  adminPages() {
    return this.content.listPages();
  }

  @Put('admin/pages/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertPage(
    @Param('slug') slug: string,
    @Body()
    body: {
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
    },
  ) {
    return this.content.upsertPage({ slug, ...body });
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  settings() {
    return this.content.listSettings();
  }

  @Put('admin/settings/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertSetting(
    @Param('key') key: string,
    @Body() body: { value: Record<string, unknown> },
  ) {
    return this.content.upsertSetting(key, body.value as Prisma.InputJsonValue);
  }
}
