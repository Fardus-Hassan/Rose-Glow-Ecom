import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductMediaDto {
  @IsEnum(MediaType)
  type!: MediaType;

  @IsString()
  src!: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsOptional()
  @IsString()
  altEn?: string;

  @IsOptional()
  @IsString()
  altBn?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class LocalizedPairDto {
  @IsString()
  en!: string;

  @IsString()
  bn!: string;
}

export class UpsertProductDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  sku!: string;

  @IsString()
  nameEn!: string;

  @IsString()
  nameBn!: string;

  @IsString()
  descriptionEn!: string;

  @IsString()
  descriptionBn!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  compareAtPrice?: number | null;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  materialEn?: string;

  @IsOptional()
  @IsString()
  materialBn?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalizedPairDto)
  colors?: LocalizedPairDto[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsInt()
  reviewCount?: number;

  @IsOptional()
  @IsInt()
  soldCount?: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  newest?: boolean;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  seoTitleEn?: string;

  @IsOptional()
  @IsString()
  seoTitleBn?: string;

  @IsOptional()
  @IsString()
  seoDescriptionEn?: string;

  @IsOptional()
  @IsString()
  seoDescriptionBn?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalPath?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];
}
