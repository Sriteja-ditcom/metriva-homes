import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FurnishingStatus, ListingType, PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: '3BHK Apartment in Bandra West with Sea View' })
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'Spacious well-lit apartment with sea-facing balcony...' })
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ example: '12A, Pali Hill, Bandra West' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Bandra West' })
  @IsString()
  locality: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state: string;

  @ApiProperty({ example: '400050' })
  @IsString()
  pincode: string;

  @ApiPropertyOptional({ example: 19.0596 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 72.8295 })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  balconies?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  floorNumber?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  totalFloors?: number;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  builtUpArea?: number;

  @ApiPropertyOptional({ example: 1050 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  carpetArea?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  plotArea?: number;

  @ApiPropertyOptional({ example: 'North-East' })
  @IsOptional()
  @IsString()
  facing?: string;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  parking?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiProperty({ example: 1500000000 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 125000 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  pricePerSqft?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsInt()
  maintenanceCharge?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @ApiPropertyOptional({ example: ['Gym', 'Pool', 'Security'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  brokerId?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class PropertyQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxArea?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'trust_score';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
