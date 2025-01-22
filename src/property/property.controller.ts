import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AddTenantsDto } from './dto/add-tenants.dto';

const UPLOAD_CONFIG = {
  destination: './uploads/properties',
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: /(jpg|jpeg|png|gif)$/,
};

const storage = diskStorage({
  destination: UPLOAD_CONFIG.destination,
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
  if (!file.originalname.toLowerCase().match(UPLOAD_CONFIG.allowedExtensions)) {
    return callback(new BadRequestException('Seuls les fichiers image sont autorisés!'), false);
  }
  callback(null, true);
};

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('new')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FilesInterceptor('images', UPLOAD_CONFIG.maxFiles, {
      storage,
      fileFilter,
      limits: {
        fileSize: UPLOAD_CONFIG.maxFileSize,
      },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Au moins une image est requise');
    }

    const imagePaths = files.map(file => `/uploads/properties/${file.filename}`);
    
    const propertyData = {
      ...createPropertyDto,
      images: imagePaths,
    };

    return this.propertyService.create(propertyData, req.user.id);
  }

  @Post(':id/tenants')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addTenants(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTenantsDto: AddTenantsDto,
    @Request() req,
  ) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
    return this.propertyService.addTenants(id, addTenantsDto.tenantIds);
  }

  @Get()
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findAll(@Request() req) {
    const properties = await this.propertyService.findAll();
    return properties.filter(property => property.owner.id === req.user.id);
  }

  @Get('owner')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findPropertiesByOwner(@Request() req) {
    return this.propertyService.findPropertiesByOwner(req.user.id);
  }

  @Get(':id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cette propriété');
    }
    return property;
  }

  @Get('tenant/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findPropertiesByTenant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    const properties = await this.propertyService.findPropertiesByTenant(id);
    return properties.filter(property => property.owner.id === req.user.id);
  }
}
