import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, PropertyQueryDto, UpdatePropertyDto } from './dto/property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { memoryStorage } from 'multer';

@ApiTags('properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search & filter properties' })
  findAll(@Query() query: PropertyQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured properties' })
  getFeatured() {
    return this.propertiesService.findFeatured();
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get my saved properties' })
  getSaved(@CurrentUser('id') userId: string) {
    return this.propertiesService.getSavedProperties(userId);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my listings' })
  getMyListings(@CurrentUser('id') userId: string) {
    return this.propertiesService.getMyProperties(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get property detail' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.propertiesService.findById(id, userId);
  }

  @Post()
  @Roles('SELLER', 'BROKER', 'BUILDER', 'ADMIN')
  @ApiOperation({ summary: 'Create a new property listing' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property listing' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove property listing' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.remove(id, user);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload property images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', 30, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.uploadImages(id, files, user);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Toggle save/unsave a property' })
  toggleSave(@Param('id') propertyId: string, @CurrentUser('id') userId: string) {
    return this.propertiesService.toggleSave(propertyId, userId);
  }
}
