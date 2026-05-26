import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('suggestions')
  @Public()
  @Throttle({ global: { limit: 30, ttl: 60 * 1000 } })
  @ApiOperation({ summary: 'Autocomplete search suggestions' })
  getSuggestions(@Query('q') query: string) {
    return this.searchService.autocomplete(query);
  }

  @Get('nearby')
  @Public()
  @ApiOperation({ summary: 'Get properties near a location' })
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('listingType') listingType?: string,
  ) {
    return this.searchService.getNearby(+lat, +lng, radius ? +radius : 5, listingType);
  }
}
