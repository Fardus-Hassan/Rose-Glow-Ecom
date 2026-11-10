import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpsertCategoryDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  nameEn!: string;

  @IsString()
  nameBn!: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionBn?: string;

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
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
