import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class ModeratePropertyDto {
  @IsString() action: 'APPROVE' | 'REJECT';
  @IsOptional() @IsString() reason?: string;
}

class ResolveFraudDto {
  @IsString() action: 'RESOLVE' | 'DISMISS';
  @IsOptional() @IsString() resolution?: string;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard overview stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('properties/pending')
  @ApiOperation({ summary: 'Properties pending review' })
  getPendingProperties(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getPendingProperties(+page, +limit);
  }

  @Patch('properties/:id/moderate')
  @ApiOperation({ summary: 'Approve or reject a property listing' })
  moderateProperty(
    @Param('id') id: string,
    @Body() dto: ModeratePropertyDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.moderateProperty(id, dto.action, adminId, dto.reason);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Query('page') page = 1, @Query('limit') limit = 20, @Query('role') role?: string) {
    return this.adminService.getUsers(+page, +limit, role);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user account' })
  suspendUser(
    @Param('id') userId: string,
    @Body() dto: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.suspendUser(userId, dto.reason, adminId);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Reactivate a suspended user' })
  activateUser(@Param('id') userId: string) {
    return this.adminService.activateUser(userId);
  }

  @Get('fraud-reports')
  @ApiOperation({ summary: 'Get fraud reports' })
  getFraudReports(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getFraudReports(status, +page, +limit);
  }

  @Patch('fraud-reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve a fraud report' })
  resolveFraudReport(
    @Param('id') id: string,
    @Body() dto: ResolveFraudDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.resolveFraudReport(id, dto.action, adminId, dto.resolution);
  }

  @Get('brokers/pending')
  @ApiOperation({ summary: 'Brokers pending verification' })
  getPendingBrokers() {
    return this.adminService.getPendingBrokers();
  }

  @Patch('brokers/:id/verify')
  @ApiOperation({ summary: 'Verify a broker' })
  verifyBroker(@Param('id') id: string) {
    return this.adminService.verifyBroker(id);
  }
}
