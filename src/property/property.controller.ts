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
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../auth/jwh-auth.guard';
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
    console.log('Images reçues:', imagePaths);
    
    const propertyData = {
      ...createPropertyDto,
      images: imagePaths,
    };

    console.log('Données de la propriété avant création:', propertyData);
    return this.propertyService.create(propertyData, req.user.id);
  }

  @Post(':id/tenants')
  async addTenants(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTenantsDto: AddTenantsDto,
  ) {
    return this.propertyService.addTenants(id, addTenantsDto.tenantIds);
  }

  @Get()
  async findAll() {
    return this.propertyService.findAll();
  }

  @Get('owner')
  async findPropertiesByOwner(@Request() req) {
    return this.propertyService.findPropertiesByOwner(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.findOne(id);
  }

  @Get('tenant/:id')
  async findPropertiesByTenant(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.findPropertiesByTenant(id);
  }
}
