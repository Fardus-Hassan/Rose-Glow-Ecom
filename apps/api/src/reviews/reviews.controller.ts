import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('reviews')
  publicList() {
    return this.reviews.findPublic();
  }

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  adminList() {
    return this.reviews.findAdmin();
  }

  @Post('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body()
    body: {
      productId?: string;
      authorName: string;
      locationEn?: string;
      locationBn?: string;
      bodyEn: string;
      bodyBn: string;
      rating?: number;
      imageUrls?: string[];
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.reviews.create({
      ...body,
      imageUrls: body.imageUrls ?? [],
    });
  }

  @Patch('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      productId?: string | null;
      authorName?: string;
      locationEn?: string;
      locationBn?: string;
      bodyEn?: string;
      bodyBn?: string;
      rating?: number;
      imageUrls?: string[];
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.reviews.update(id, body);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.reviews.remove(id);
  }
}
